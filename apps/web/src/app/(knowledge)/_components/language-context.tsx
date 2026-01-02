'use client';

import { createContext, useContext, useState, ReactNode, useSyncExternalStore } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'akh-language';

// Use useSyncExternalStore for hydration-safe localStorage access
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function getSnapshot(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'ar' ? 'ar' : 'en';
}

function getServerSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore handles hydration correctly without setState in effects
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    emitChange();
    setUpdateTrigger(n => n + 1); // Force re-render for immediate update
  };

  // Simple translation helper - returns appropriate string based on language
  const t = (en: string, ar: string) => {
    return language === 'ar' ? ar : en;
  };

  // updateTrigger is used to force re-render, suppress unused warning
  void updateTrigger;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL: language === 'ar',
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
