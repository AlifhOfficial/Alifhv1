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

const THEME_SCHEMES: Record<string, "light" | "dark"> = {
  light: "light",
  dark: "dark",
  charcoal: "dark",
};

const APPLE_STATUS_BAR_STYLES: Record<string, string> = {
  light: "default",
  dark: "black-translucent",
  charcoal: "black-translucent",
};

export function ThemeColorSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;
    
    const color = THEME_COLORS[theme] || THEME_COLORS.dark;
    const colorScheme = THEME_SCHEMES[theme] || THEME_SCHEMES.dark;
    const appleStatusBarStyle =
      APPLE_STATUS_BAR_STYLES[theme] || APPLE_STATUS_BAR_STYLES.dark;

    // Update all theme-color meta tags in place
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", color);
    });

    document.querySelectorAll('meta[name="color-scheme"]').forEach((meta) => {
      meta.setAttribute("content", colorScheme);
    });

    document
      .querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]')
      .forEach((meta) => {
        meta.setAttribute("content", appleStatusBarStyle);
      });

    document.documentElement.style.colorScheme = colorScheme;
  }, [theme]);

  return null;
}
