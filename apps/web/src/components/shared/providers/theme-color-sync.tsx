/**
 * Theme Color Sync
 * 
 * Updates browser chrome color (address bar, status bar) based on current theme.
 * Owns a dedicated set of meta tags so browser chrome stays in sync in production too.
 */

"use client";

import { useTheme } from "next-themes";
import { useLayoutEffect } from "react";

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
  const { theme, resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    const activeTheme = resolvedTheme || theme;
    if (!activeTheme) return;

    const color = THEME_COLORS[activeTheme] || THEME_COLORS.dark;
    const colorScheme = THEME_SCHEMES[activeTheme] || THEME_SCHEMES.dark;
    const appleStatusBarStyle =
      APPLE_STATUS_BAR_STYLES[activeTheme] || APPLE_STATUS_BAR_STYLES.dark;

    const themeColorMeta = document.querySelector<HTMLMetaElement>('#revvup-theme-color');
    const colorSchemeMeta = document.querySelector<HTMLMetaElement>('#revvup-color-scheme');
    const appleStatusMeta = document.querySelector<HTMLMetaElement>('#revvup-apple-status-bar-style');

    themeColorMeta?.setAttribute("content", color);
    colorSchemeMeta?.setAttribute("content", colorScheme);
    appleStatusMeta?.setAttribute("content", appleStatusBarStyle);

    document.documentElement.style.colorScheme = colorScheme;
  }, [theme, resolvedTheme]);

  return null;
}
