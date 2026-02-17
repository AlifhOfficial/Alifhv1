/**
 * Theme Color Sync
 * 
 * Dynamically updates the browser's native UI color (address bar, status bar)
 * to match the current app theme. This ensures consistency between:
 * - Safari iOS status bar
 * - Android Chrome address bar
 * - PWA title bar
 * - Windows title bar (in supported browsers)
 * 
 * Note: manifest.json theme_color takes precedence in installed PWAs.
 * This only affects browser tab/address bar, not PWA standalone mode.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Theme colors matching globals.css design system
const THEME_COLORS: Record<string, string> = {
  light: "#f5f5f5",    // Light background
  dark: "#000000",     // Pure black (OLED)
  charcoal: "#121212", // Deep charcoal (7% in CSS)
};

export function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Use theme directly since we don't use system preference
    const currentTheme = theme || resolvedTheme || 'dark';
    const color = THEME_COLORS[currentTheme] || THEME_COLORS.dark;

    // Chrome needs in-place update, not remove/create
    const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
    
    if (existingMetas.length > 0) {
      // Update the first one in place (Chrome responds to this)
      existingMetas[0].setAttribute("content", color);
      // Remove any media attribute so it applies universally
      existingMetas[0].removeAttribute("media");
      // Remove extra meta tags (from viewport media queries)
      for (let i = 1; i < existingMetas.length; i++) {
        existingMetas[i].remove();
      }
    } else {
      // Create if none exist
      const metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      metaThemeColor.setAttribute("content", color);
      document.head.appendChild(metaThemeColor);
    }

    // Update color-scheme meta tag
    const existingColorScheme = document.querySelector('meta[name="color-scheme"]');
    const colorSchemeValue = currentTheme === 'light' ? 'light' : 'dark';
    if (existingColorScheme) {
      existingColorScheme.setAttribute("content", colorSchemeValue);
    }

    // Update Apple status bar style
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const appleStyle = currentTheme === 'light' ? 'default' : 'black-translucent';
    if (appleMeta) {
      appleMeta.setAttribute("content", appleStyle);
    } else {
      appleMeta = document.createElement("meta");
      appleMeta.setAttribute("name", "apple-mobile-web-app-status-bar-style");
      appleMeta.setAttribute("content", appleStyle);
      document.head.appendChild(appleMeta);
    }

  }, [mounted, theme, resolvedTheme]);

  return null;
}
