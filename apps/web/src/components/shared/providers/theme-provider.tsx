/**
 * Theme Provider
 * 
 * Provides theme context using next-themes
 * Supports light/dark/charcoal modes with system preference detection
 */

"use client";

import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeColorSync } from "./theme-color-sync";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      themes={["light", "dark", "charcoal"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
