import React, { createContext, useContext, useMemo } from 'react';

import { CompositeProvider } from './CompositeProvider';
import { ConsoleProvider } from './ConsoleProvider';
import { ContentsquareProvider } from './ContentsquareProvider';
import { AnalyticsProvider } from './types';

/**
 * Conecta o nosso SDK ao React.
 *
 * - O hook useAnalytics() dá acesso a track/screen/identify em qualquer tela.
 * - O app inteiro só conhece a interface AnalyticsProvider; aqui decidimos
 *   QUAIS implementações concretas usar.
 *
 * Hoje usamos um CompositeProvider que manda os eventos para DOIS destinos:
 *   1. Contentsquare (real) — só envia de fato num dev build nativo.
 *   2. eventLog (ConsoleProvider) — alimenta a aba Console pra você ver ao vivo.
 */

// O ConsoleProvider fica exposto para a tela de Console observar os eventos.
export const eventLog = new ConsoleProvider();

// O provider que as telas realmente usam: faz fan-out Contentsquare + Console.
export const analytics: AnalyticsProvider = new CompositeProvider([
  new ContentsquareProvider(),
  eventLog,
]);

const AnalyticsContext = createContext<AnalyticsProvider>(analytics);

export function AnalyticsContextProvider({ children }: { children: React.ReactNode }) {
  // useMemo só pra deixar explícito que a instância é estável entre renders.
  const value = useMemo(() => analytics, []);
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

/** Hook usado nas telas: const a = useAnalytics(); a.track('Button Clicked'). */
export function useAnalytics(): AnalyticsProvider {
  return useContext(AnalyticsContext);
}
