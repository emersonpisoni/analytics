/**
 * Tipos centrais do nosso mini-SDK de analytics.
 *
 * A ideia é definir um CONTRATO (AnalyticsProvider) que qualquer provider
 * precisa seguir — seja o nosso mock educacional (ConsoleProvider) ou, no
 * futuro, um SDK real (Firebase, Amplitude, PostHog...). Isso é o conceito de
 * "provider abstraction": o app nunca fala direto com o SDK, fala com essa
 * interface. Trocar de ferramenta vira trocar uma linha.
 */

/**
 * Propriedades são o contexto que viaja junto de um evento ou usuário.
 * Mantemos valores simples (o que a maioria dos SDKs aceita).
 */
export type Properties = Record<string, string | number | boolean | null | undefined>;

/**
 * Um evento já registrado pelo SDK. É o que mostramos na tela de console.
 * Os tipos refletem os 3 "métodos universais" de analytics:
 *  - track:    algo aconteceu (ação do usuário)
 *  - screen:   o usuário viu uma tela
 *  - identify: associamos os eventos a um usuário conhecido
 */
export type AnalyticsEventType = 'track' | 'screen' | 'identify';

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  /** Nome do evento (track) ou da tela (screen). Vazio para identify. */
  name: string;
  properties?: Properties;
  /** Momento em que o evento foi capturado no cliente. */
  timestamp: number;
};

/**
 * O contrato. Repare como é parecido com a API do Segment/Amplitude.
 * Qualquer provider real implementa esses mesmos métodos.
 */
export interface AnalyticsProvider {
  /** Registra uma ação do usuário. Ex: track('Button Clicked', { name: 'buy' }) */
  track(name: string, properties?: Properties): void;
  /** Registra a visualização de uma tela. */
  screen(name: string, properties?: Properties): void;
  /** Associa os próximos eventos a um usuário identificado (ex: após login). */
  identify(userId: string, traits?: Properties): void;
}
