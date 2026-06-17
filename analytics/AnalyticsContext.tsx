import React, { createContext, useContext, useMemo } from 'react';

import { ConsoleProvider } from './ConsoleProvider';
import { AnalyticsProvider } from './types';

/**
 * Conecta o nosso SDK ao React.
 *
 * - Criamos UMA instância do provider e a disponibilizamos via Context.
 * - O hook useAnalytics() dá acesso a track/screen/identify em qualquer tela.
 *
 * Como o app inteiro só conhece a interface AnalyticsProvider, pra plugar um
 * SDK real depois basta trocar `new ConsoleProvider()` pela implementação real.
 */

// Expomos a instância concreta para a tela de console poder ler/observar os
// eventos (getEvents/subscribe). As telas normais usam só o hook.
export const analytics = new ConsoleProvider();

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
