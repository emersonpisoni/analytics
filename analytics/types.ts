export type Properties = Record<string, string | number | boolean | null | undefined>;

export type AnalyticsEventType = 'track' | 'screen' | 'identify';

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  name: string;
  properties?: Properties;
  timestamp: number;
};

export interface AnalyticsProvider {
  track(name: string, properties?: Properties): void;
  screen(name: string, properties?: Properties): void;
  identify(userId: string, traits?: Properties): void;
}
