/**
 * Theme Context - Manual theme switching with system default
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Re-export for compatibility
export function useColorScheme(): ColorScheme {
  const context = useContext(ThemeContext);
  if (!context) {
    return 'dark';
  }
  return context.colorScheme;
}
