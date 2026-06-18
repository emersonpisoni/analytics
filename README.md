# 📊 Analytics 101 — Laboratório em React Native

Um projeto de estudo, em Expo / React Native, para entender os **principais conceitos
de analytics de produto** na prática. Em vez de mandar eventos pra um servidor real,
construímos um **mini-SDK educacional** que mostra os eventos numa tela de console
dentro do próprio app — assim você *vê* os conceitos acontecendo, sem precisar de
nenhuma chave de API.

## Como rodar

```bash
npm install
npx expo start
```

Abra no Expo Go, simulador iOS/Android ou web. O app tem duas abas:

- **Demo** — botões que disparam eventos.
- **Console** — lista, ao vivo, os eventos capturados.

Toque nos botões da aba Demo e veja o resultado na aba Console.

---

## Conceitos de analytics

### O que é analytics?
É a prática de **registrar o que acontece no app** (quem fez o quê, quando e em que
contexto) para entender o comportamento dos usuários e tomar decisões de produto.

### Os 3 métodos universais
Quase todo SDK de analytics (Amplitude, Segment, Firebase, PostHog…) gira em torno de
três chamadas. Nosso mini-SDK implementa exatamente essas:

| Método | Para quê | Exemplo |
|---|---|---|
| `track(name, props)` | Registrar uma **ação** | `track('Product Viewed', { price: 79 })` |
| `screen(name, props)` | Registrar a **visualização de uma tela** | `screen('Home')` |
| `identify(userId, traits)` | **Associar** os eventos a um usuário | `identify('user-42', { plan: 'free' })` |

### Evento e propriedades
- **Evento (event):** a unidade básica — algo que aconteceu.
- **Propriedades (properties):** o contexto que viaja junto (`price`, `product_id`…).
  São elas que tornam o dado analisável. Um evento sem propriedades responde "aconteceu";
  com propriedades, responde "aconteceu **o quê**, com qual valor".

### Identidade: anônimo vs identificado
Antes do login o usuário é **anônimo** (só temos um id gerado pelo dispositivo). Depois
do `identify()`, os eventos passam a ser atribuídos àquele usuário. No nosso provider,
todo evento carrega o `userId` atual (veja-o mudar de `null` para `user-42` após o login).

### Taxonomy (convenção de nomes)
O maior inimigo de um bom analytics é **nomenclatura inconsistente** (`btn_click` vs
`Button Clicked` vs `click_button` viram métricas diferentes). Por isso centralizamos os
nomes em [`analytics/events.ts`](analytics/events.ts) usando o padrão **"Object Action"**
(`Product Viewed`, `Order Completed`).

### Funil de conversão (funnel)
Uma **sequência ordenada de eventos** que mede onde o usuário avança ou desiste. Na demo:
`Product Viewed → Product Added to Cart → Checkout Started → Order Completed`. Num
dashboard real, você veria a % que chega em cada etapa.

### Provider abstraction (a parte mais importante de arquitetura)
O app **nunca fala direto com o SDK**. Ele fala com a interface
[`AnalyticsProvider`](analytics/types.ts). Hoje a implementação é o `ConsoleProvider`
(mock); para usar Firebase/Amplitude no futuro, basta criar outra classe que implemente a
mesma interface e trocar **uma linha** em [`AnalyticsContext.tsx`](analytics/AnalyticsContext.tsx).
Esse é, inclusive, o conceito por trás do **Segment**.

### Dois modelos de tracking (contexto de mercado)
- **Explícito / manual:** você chama `track()` no código. Ex: Google Analytics (GA4 /
  Firebase), Amplitude, Mixpanel. É o que fazemos aqui.
- **Autocapture:** o SDK captura *tudo* automaticamente e você define os eventos depois.
  Ex: **Heap**, PostHog.

---

## Integração real com o Contentsquare (antigo Heap)

> O SDK clássico do Heap (`@heap/react-native-heap`) foi descontinuado. O caminho
> oficial agora é o **CSQ SDK** (`@contentsquare/react-native-bridge`). Este projeto já
> usa a versão nova.

Além do provider mock, o app está ligado ao **Contentsquare** de verdade, para mostrar
como um SDK real entra na arquitetura. A sacada: o app **não mudou nada** — só trocamos a
implementação da mesma interface.

### Como está montado
```
analytics/
  ContentsquareProvider.ts # traduz nossa interface -> API do CSQ
  CompositeProvider.ts     # manda cada evento pro CSQ E pro Console (fan-out, estilo Segment)
  csqConfig.ts             # 👈 onde você cola o Environment ID
```
Em [`AnalyticsContext.tsx`](analytics/AnalyticsContext.tsx) o app usa um
`CompositeProvider([new ContentsquareProvider(), eventLog])`: os eventos vão pro
Contentsquare **e** continuam aparecendo na aba Console pra você conferir localmente.

Mapeamento da nossa interface para o CSQ:

| Nossa interface | Contentsquare (`@contentsquare/react-native-bridge`) |
|---|---|
| (inicialização) | `CSQ.start(StartConfig.withEnvironmentId(id, { enableRNAutocapture: true }))` |
| (consentimento) | `CSQ.optIn()` — **obrigatório**: o CSQ é opt-out por padrão |
| `track(name, props)` | `CSQ.trackEvent(name, props)` |
| `screen(name)` | `CSQ.trackScreenview(name)` |
| `identify(userId, traits)` | `CSQ.identify(userId)` + `CSQ.addUserProperties(traits)` |

> ⚠️ **Opt-out por padrão:** diferente do Heap clássico, o CSQ **não rastreia nada** até
> você chamar `CSQ.optIn()`. Nosso provider já faz isso no construtor — e é exatamente o
> gancho do **Passo 5 (consentimento / LGPD)**.

### Configuração (faça isto para enviar dados de verdade)

1. **Cole o Environment ID** em [`analytics/csqConfig.ts`](analytics/csqConfig.ts)
   (painel do Contentsquare → Settings → Environments).

2. **⚠️ Não funciona no Expo Go.** É um módulo nativo. No Expo Go o app roda normal e o
   Console funciona, mas o CSQ fica desligado (nada é enviado). Para enviar de verdade
   você precisa de um **dev build**.

3. **Gerar o dev build e instalar no Android físico:**
   ```bash
   # com o celular conectado via USB (depuração USB ativada):
   npx expo run:android
   ```
   Isso compila o app nativo e instala no aparelho. (Requer Android Studio / SDK.)
   Alternativa sem ambiente nativo local: `eas build --profile development --platform android`
   e instalar o APK gerado.

4. Abra o app no aparelho, toque nos botões da aba **Demo** e confira os eventos
   chegando no **painel do Contentsquare** (pode levar alguns minutos para aparecer).

> O autocapture já vem ligado (`enableRNAutocapture: true` + plugin do babel em
> [`babel.config.js`](babel.config.js)): além dos eventos manuais, o CSQ captura
> toques/telas automaticamente — dá pra comparar os dois modelos no painel.

---

## Estrutura do código

```
analytics/
  types.ts             # Contrato: Properties, AnalyticsEvent, AnalyticsProvider
  ConsoleProvider.ts       # Provider MOCK: guarda em memória, loga e notifica a UI
  ContentsquareProvider.ts # Provider REAL: traduz nossa interface -> API do CSQ
  CompositeProvider.ts     # Fan-out: manda cada evento pra vários providers
  csqConfig.ts             # Environment ID do Contentsquare
  events.ts            # Catálogo de eventos (taxonomy)
  AnalyticsContext.tsx # Context + hook useAnalytics() + wiring dos providers
app/(tabs)/
  index.tsx            # Tela Demo: botões que disparam eventos
  console.tsx          # Tela Console: lista os eventos ao vivo
```

---

## Roadmap do estudo

- [x] **Passo 1 — Fundamentos:** evento, propriedades, identidade, taxonomy, funil e
      provider abstraction, com console na tela.
- [ ] **Passo 2 — Screen tracking automático** com expo-router (disparar `screen()` a
      cada navegação, sem chamar manualmente).
- [ ] **Passo 3 — Sessão e user properties** (timeout de sessão, traits do usuário).
- [ ] **Passo 4 — Pipeline mobile:** fila, **batching**, *flush* e **buffer offline**.
- [ ] **Passo 5 — Consentimento / LGPD:** toggle de opt-out que bloqueia o tracking.
- [x] **Contentsquare real** — `ContentsquareProvider` (CSQ SDK) ligado via fan-out,
      com autocapture habilitado.
- [ ] **Passo 6 — Comparar manual vs autocapture**: analisar no painel do Contentsquare
      a diferença entre os eventos que mandamos com `trackEvent` e os capturados sozinhos.

---

> Projeto educacional. Os "eventos" não saem do dispositivo — ficam apenas em memória e
> são exibidos na aba Console.
