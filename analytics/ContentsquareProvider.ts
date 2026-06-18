import { CSQ, StartConfig } from '@contentsquare/react-native-bridge';

import { CSQ_ENABLED, CSQ_ENVIRONMENT_ID } from './csqConfig';
import { AnalyticsProvider, Properties } from './types';

/**
 * ContentsquareProvider: provider REAL, ligado ao Contentsquare (antigo Heap).
 *
 * É só uma "tradução" da nossa interface AnalyticsProvider para a API do CSQ.
 * O resto do app não muda nada — esse é o ganho da abstração de provider.
 *
 * Diferenças importantes em relação ao Heap clássico:
 *  - `Heap.setAppId()`  ->  `CSQ.start(StartConfig.withEnvironmentId(...))`
 *  - `Heap.track()`     ->  `CSQ.trackEvent()`
 *  - O CSQ é OPT-OUT por padrão: nada é rastreado até chamar `CSQ.optIn()`.
 *    (Isso conecta direto com o conceito de consentimento / LGPD.)
 *
 * Obs: o CSQ só envia eventos num DEV BUILD nativo (não no Expo Go).
 */
export class ContentsquareProvider implements AnalyticsProvider {
  constructor() {
    if (!CSQ_ENABLED) return;

    CSQ.start(
      StartConfig.withEnvironmentId(CSQ_ENVIRONMENT_ID, {
        // Habilita a captura automática de toques/telas (modelo "autocapture").
        enableRNAutocapture: true,
      }),
    );

    // Consentimento: sem isto, o CSQ não rastreia nada (opt-out por padrão).
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

/** CSQ aceita só string/number/boolean nas propriedades — removemos null/undefined. */
function clean(properties?: Properties): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties ?? {})) {
    if (value !== null && value !== undefined) result[key] = value;
  }
  return result;
}
