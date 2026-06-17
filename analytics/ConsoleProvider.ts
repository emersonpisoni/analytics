import { AnalyticsEvent, AnalyticsProvider, Properties } from './types';

/**
 * ConsoleProvider: nosso provider MOCK / educacional.
 *
 * Em vez de mandar eventos pra um servidor (como o Firebase faria), ele:
 *   1. guarda os eventos numa lista em memória,
 *   2. loga no terminal (console.log),
 *   3. notifica quem estiver inscrito (a tela de console no app).
 *
 * Assim conseguimos VER os conceitos acontecendo sem precisar de nenhuma
 * chave de API. Um SDK real implementaria essa mesma interface, mas no lugar
 * do console.log faria uma chamada de rede.
 */

type Listener = (events: AnalyticsEvent[]) => void;

export class ConsoleProvider implements AnalyticsProvider {
  private events: AnalyticsEvent[] = [];
  private listeners = new Set<Listener>();

  /** Usuário atualmente identificado (null = anônimo). */
  private currentUserId: string | null = null;

  track(name: string, properties?: Properties): void {
    this.record('track', name, properties);
  }

  screen(name: string, properties?: Properties): void {
    this.record('screen', name, properties);
  }

  identify(userId: string, traits?: Properties): void {
    this.currentUserId = userId;
    // Guardamos o userId nas próprias propriedades só pra ficar visível na demo.
    this.record('identify', userId, traits);
  }

  /** Cria o evento, adiciona contexto comum e avisa os ouvintes. */
  private record(
    type: AnalyticsEvent['type'],
    name: string,
    properties?: Properties,
  ): void {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      name,
      // Todo evento carrega quem é o usuário no momento (anônimo ou não).
      properties: { userId: this.currentUserId, ...properties },
      timestamp: Date.now(),
    };

    this.events = [event, ...this.events]; // mais recente primeiro
    console.log(`[analytics] ${type}: ${name}`, event.properties);
    this.emit();
  }

  // --- API pra tela de console observar os eventos ---

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
    this.emit();
  }

  /** Inscreve um ouvinte. Retorna função pra cancelar a inscrição. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.events);
  }
}
