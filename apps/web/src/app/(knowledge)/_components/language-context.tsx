'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'akh-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (stored === 'ar' || stored === 'en') {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Simple translation helper - returns appropriate string based on language
  const t = (en: string, ar: string) => {
    if (!mounted) return en;
    return language === 'ar' ? ar : en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language: mounted ? language : 'en',
        setLanguage,
        isRTL: mounted && language === 'ar',
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
