import React, { createContext, useContext, useMemo } from 'react';

import { CompositeProvider } from './CompositeProvider';
import { ConsoleProvider } from './ConsoleProvider';
import { ContentsquareProvider } from './ContentsquareProvider';
import { AnalyticsProvider } from './types';

export const eventLog = new ConsoleProvider();

export const analytics: AnalyticsProvider = new CompositeProvider([
  new ContentsquareProvider(),
  eventLog,
]);

const AnalyticsContext = createContext<AnalyticsProvider>(analytics);

export function AnalyticsContextProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => analytics, []);
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsProvider {
  return useContext(AnalyticsContext);
}
