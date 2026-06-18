import { AnalyticsProvider, Properties } from './types';

/**
 * CompositeProvider: envia cada chamada para VÁRIOS providers ao mesmo tempo.
 *
 * Usamos isso para mandar os eventos pro Contentsquare (real) E pro nosso
 * ConsoleProvider (a aba Console), assim você vê localmente, ao vivo, o que foi enviado.
 *
 * Esse padrão "fan-out" é, no fundo, o que o Segment faz: um track() vira N
 * chamadas para N destinos.
 */
export class CompositeProvider implements AnalyticsProvider {
  constructor(private readonly providers: AnalyticsProvider[]) {}

  track(name: string, properties?: Properties): void {
    for (const p of this.providers) p.track(name, properties);
  }

  screen(name: string, properties?: Properties): void {
    for (const p of this.providers) p.screen(name, properties);
  }

  identify(userId: string, traits?: Properties): void {
    for (const p of this.providers) p.identify(userId, traits);
  }
}
