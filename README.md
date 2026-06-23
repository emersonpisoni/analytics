# 📊 Analytics 101 — Laboratório em React Native

Projeto de estudo (Expo / React Native) para entender, na prática, os **principais
conceitos de analytics de produto** — e como um SDK real (o **Contentsquare**, antigo
Heap) se encaixa numa arquitetura limpa.

A ideia central: o app fala com **uma interface** (`AnalyticsProvider`), nunca direto com
o SDK. Isso permite mandar os mesmos eventos para dois destinos ao mesmo tempo:

- um **provider mock** que mostra os eventos numa tela de **Console** dentro do app
  (pra você *ver* tudo acontecendo, sem conta nem build);
- o **Contentsquare** real, num dev build.

---

## Arquitetura

```
  Tela (aba Demo)
     │  useAnalytics().track('Product Viewed', { price: 79 })
     ▼
  CompositeProvider            ← faz "fan-out" (1 evento → N destinos, estilo Segment)
     ├─────────────► ContentsquareProvider ──► CSQ SDK ──► nuvem Contentsquare
     └─────────────► ConsoleProvider ─────────► aba Console (visível no app)
```

Todos implementam o **mesmo contrato** `AnalyticsProvider`. Trocar/adicionar um destino
(Firebase, Amplitude…) é criar uma classe nova e plugar — o resto do app não muda.

---

## Conceitos principais

**Os 3 métodos universais** — quase todo SDK (Amplitude, Segment, Firebase, Contentsquare)
gira em torno destes três:

| Método | Para quê | Exemplo |
|---|---|---|
| `track(name, props)` | registrar uma **ação** | `track('Product Viewed', { price: 79 })` |
| `screen(name)` | registrar a **visualização de uma tela** | `screen('Home')` |
| `identify(userId, traits)` | **associar** os eventos a um usuário | `identify('user-42', { plan: 'free' })` |

**Evento e propriedades** — o evento é a unidade básica ("algo aconteceu"); as
propriedades são o contexto (`price`, `product_id`) que torna o dado analisável.

**Identidade** — antes do login o usuário é **anônimo**; depois do `identify()` os eventos
passam a ser atribuídos a ele. (Veja o `userId` mudar de `null` para `user-42` na Console.)

**Taxonomy (nomenclatura)** — o maior inimigo do analytics é nome inconsistente
(`btn_click` vs `Button Clicked`). Centralizamos os nomes em
[`analytics/events.ts`](analytics/events.ts) no padrão **"Object Action"**.

**Funil de conversão** — sequência ordenada de eventos que mede onde o usuário desiste:
`Product Viewed → Added to Cart → Checkout Started → Order Completed`.

**Dois modelos de tracking** — **manual** (você chama `track()`; ex: GA4, Amplitude) vs
**autocapture** (o SDK captura tudo sozinho; ex: Heap/Contentsquare, PostHog). Aqui usamos
os dois: chamadas manuais **e** `enableRNAutocapture: true`.

---

## Exemplos no código

**1. O contrato** — [`analytics/types.ts`](analytics/types.ts)

```ts
export interface AnalyticsProvider {
  track(name: string, properties?: Properties): void;
  screen(name: string, properties?: Properties): void;
  identify(userId: string, traits?: Properties): void;
}
```

**2. Usando numa tela** — [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx)

```tsx
const analytics = useAnalytics();

<Button onPress={() => analytics.track('Product Viewed', {
  product_id: 'SKU-123', price: 79.0, currency: 'BRL',
})} />
```

**3. Traduzindo para o SDK real** — [`analytics/ContentsquareProvider.ts`](analytics/ContentsquareProvider.ts)

```ts
export class ContentsquareProvider implements AnalyticsProvider {
  constructor() {
    CSQ.start(StartConfig.withEnvironmentId(CSQ_ENVIRONMENT_ID, { enableRNAutocapture: true }));
    CSQ.optIn(); // CSQ é opt-out por padrão: sem isto, nada é rastreado
  }
  track(name, props)        { CSQ.trackEvent(name, props); }
  screen(name)              { CSQ.trackScreenview(name); }
  identify(userId, traits)  { CSQ.identify(userId); CSQ.addUserProperties(traits); }
}
```

**4. Ligando os destinos** — [`analytics/AnalyticsContext.tsx`](analytics/AnalyticsContext.tsx)

```ts
export const eventLog = new ConsoleProvider();           // alimenta a aba Console
export const analytics = new CompositeProvider([          // o que as telas usam
  new ContentsquareProvider(),
  eventLog,
]);
```

Mapeamento da nossa interface → API do Contentsquare:

| Nossa interface | Contentsquare (`@contentsquare/react-native-bridge`) |
|---|---|
| inicialização | `CSQ.start(StartConfig.withEnvironmentId(id, { enableRNAutocapture: true }))` |
| consentimento | `CSQ.optIn()` — **obrigatório** (opt-out por padrão) |
| `track` | `CSQ.trackEvent(name, props)` |
| `screen` | `CSQ.trackScreenview(name)` |
| `identify` | `CSQ.identify(userId)` + `CSQ.addUserProperties(traits)` |

---

## Setup e como rodar

### A) Só o mock (rápido, roda no Expo Go)

```bash
npm install
npx expo start
```

Abra no Expo Go / simulador. Toque nos botões da aba **Demo** e veja os eventos na aba
**Console**. O Contentsquare fica desligado, mas todos os conceitos são visíveis.

### B) Com o Contentsquare real (⚠️ exige dev build)

> **Não funciona no Expo Go.** O Contentsquare é um **módulo nativo** — no Expo Go o app
> roda e a Console funciona, mas nenhum evento é enviado. Para enviar de verdade é preciso
> um **dev build**.

1. **Cole o Environment ID** em [`analytics/csqConfig.ts`](analytics/csqConfig.ts)
   (painel: *Account → Manage → Projects → [projeto] → Environments*).

2. **Gere o dev build e instale no Android físico** (USB com depuração ativada):
   ```bash
   npx expo prebuild --clean   # regenera o projeto nativo com o SDK
   npx expo run:android        # compila e instala no aparelho
   ```
   Alternativa sem ambiente nativo local: `eas build --profile development --platform android`.

3. Toque nos botões da aba **Demo** e valide (veja abaixo).

---

## Como validar a implementação (4 camadas)

O dado "some" entre o toque e o dashboard. Cheque camada por camada, da mais rápida à
definitiva:

| # | Onde | Confirma que… | Latência |
|---|---|---|---|
| 1 | **Aba Console** (no app) | o app **disparou** o evento | imediato |
| 2 | **logcat** (`adb logcat`) | o SDK **enviou** pra rede | imediato |
| 3 | **Live / Log Visualizer** (painel) | o evento **chegou** no Contentsquare | segundos/min |
| 4 | **Events / Explore** (painel) | virou **análise** | ~30 min* |

\* Os dados só viram análise depois de **sessionizados** (~30 min após o último evento,
quando a sessão "fecha"). A tela de análise ficar vazia logo após o teste é esperado.

Sinal de sucesso da camada 2 no logcat:
```
I CSLIB : All pending data has been uploaded.
```

---

## Pegadinhas reais (gotchas)

Coisas que a documentação não deixa óbvias e custaram tempo:

1. **Heap virou Contentsquare.** `@heap/react-native-heap` foi descontinuado; o novo é
   `@contentsquare/react-native-bridge`, com API diferente (`track` → `trackEvent`) e
   **opt-out por padrão** (precisa de `CSQ.optIn()`).
2. **Não roda no Expo Go** — módulo nativo exige dev build.
3. **`babel.config.js` próprio exige instalar `babel-preset-expo`** (o autocapture precisa
   do plugin do babel). Sem o preset, o bundle quebra com `Cannot find module 'babel-preset-expo'`.
4. **Trocar de SDK exige `expo prebuild --clean`** — a pasta `android/` fica desatualizada.
5. **O 404 de `config/v2/<package>.json` é normal** e **não** bloqueia o Product Analytics:
   é a config de Experience Analytics (session replay), buscada por **package name**. Os
   `trackEvent`/`identify` sobem pelo **Environment ID**, por outro caminho.
6. **Dois identificadores, não confunda:**
   **Environment ID** (do Contentsquare, vai no `csqConfig.ts`) vs **package name** (do seu
   app, em [`app.json`](app.json) → `expo.android.package`, gerada pelo prebuild).

---

## Estrutura do código

```
analytics/
  types.ts                 # Contrato: Properties, AnalyticsEvent, AnalyticsProvider
  ConsoleProvider.ts       # Provider MOCK: guarda em memória, loga e notifica a UI
  ContentsquareProvider.ts # Provider REAL: traduz nossa interface → API do CSQ
  CompositeProvider.ts     # Fan-out: manda cada evento pra vários providers
  csqConfig.ts             # Environment ID do Contentsquare
  events.ts                # Catálogo de eventos (taxonomy)
  AnalyticsContext.tsx     # Context + hook useAnalytics() + wiring dos providers
app/(tabs)/
  index.tsx                # Tela Demo: botões que disparam eventos
  console.tsx              # Tela Console: lista os eventos ao vivo
```

---

## Roadmap

- [x] Fundamentos: evento, propriedades, identidade, taxonomy, funil, provider abstraction.
- [x] Contentsquare real via `CompositeProvider` (fan-out), com autocapture.
- [ ] Screen tracking automático com expo-router.
- [ ] Sessão e user properties (timeout, traits).
- [ ] Pipeline mobile: fila, batching, flush, buffer offline.
- [ ] Consentimento / LGPD: toggle de opt-out ligado ao `CSQ.optIn()/optOut()`.
- [ ] Comparar, no painel, eventos manuais vs autocapture.
