import { AnalyticsEvent, AnalyticsProvider, Properties } from './types';

type Listener = (events: AnalyticsEvent[]) => void;

export class ConsoleProvider implements AnalyticsProvider {
  private events: AnalyticsEvent[] = [];
  private listeners = new Set<Listener>();
  private currentUserId: string | null = null;

  track(name: string, properties?: Properties): void {
    this.record('track', name, properties);
  }

  screen(name: string, properties?: Properties): void {
    this.record('screen', name, properties);
  }

  identify(userId: string, traits?: Properties): void {
    this.currentUserId = userId;
    this.record('identify', userId, traits);
  }

  private record(
    type: AnalyticsEvent['type'],
    name: string,
    properties?: Properties,
  ): void {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      name,
      properties: { userId: this.currentUserId, ...properties },
      timestamp: Date.now(),
    };

    this.events = [event, ...this.events];
    console.log(`[analytics] ${type}: ${name}`, event.properties);
    this.emit();
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.events);
  }
}
