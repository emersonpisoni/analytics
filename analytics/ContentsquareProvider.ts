import { CSQ, StartConfig } from '@contentsquare/react-native-bridge';

import { CSQ_ENABLED, CSQ_ENVIRONMENT_ID } from './csqConfig';
import { AnalyticsProvider, Properties } from './types';

export class ContentsquareProvider implements AnalyticsProvider {
  constructor() {
    if (!CSQ_ENABLED) return;

    CSQ.start(
      StartConfig.withEnvironmentId(CSQ_ENVIRONMENT_ID, {
        enableRNAutocapture: true,
      }),
    );

    CSQ.optIn();
  }

  track(name: string, properties?: Properties): void {
    if (CSQ_ENABLED) CSQ.trackEvent(name, clean(properties));
  }

  screen(name: string): void {
    if (CSQ_ENABLED) CSQ.trackScreenview(name);
  }

  identify(userId: string, traits?: Properties): void {
    if (!CSQ_ENABLED) return;
    CSQ.identify(userId);
    if (traits) CSQ.addUserProperties(clean(traits));
  }
}

function clean(properties?: Properties): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties ?? {})) {
    if (value !== null && value !== undefined) result[key] = value;
  }
  return result;
}
