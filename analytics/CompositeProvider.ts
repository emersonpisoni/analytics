import { AnalyticsProvider, Properties } from './types';

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
