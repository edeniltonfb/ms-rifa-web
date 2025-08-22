'use client';

import { AppContextType } from '@common/data';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [loading, setLoading] = useState(false);
  
  // Controle de loading
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  const value: AppContextType = {
    loading,
    showLoader,
    hideLoader,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
