/**
 * Theme Color Sync
 * 
 * Updates browser chrome color (address bar, status bar) based on current theme.
 * Only modifies existing meta tag attributes - never adds/removes DOM nodes.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const THEME_COLORS: Record<string, string> = {
  light: "#f5f5f5",
  dark: "#000000",
  charcoal: "#121212",
};

export function ThemeColorSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;
    
    const color = THEME_COLORS[theme] || THEME_COLORS.dark;

    // Update all theme-color meta tags in place
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", color);
    });
  }, [theme]);

  return null;
}
