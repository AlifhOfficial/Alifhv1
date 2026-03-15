/**
 * Theme Context - Manual theme switching with system default
 * Integrates with device preferences and persists user choice
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, startTransition } from 'react';
import { useColorScheme as useDeviceColorScheme, Appearance, Platform, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';

const THEME_STORAGE_KEY = '@revvup_theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** Current resolved color scheme (always 'light' or 'dark') */
  colorScheme: ColorScheme;
  /** Current theme mode preference */
  themeMode: ThemeMode;
  /** Set theme mode (light, dark, or system) */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
  /** Convenience boolean for dark mode checks */
  isDark: boolean;
  /** Current theme colors from the design system */
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system'); // Default to system theme
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch {
        // Use default on error
      } finally {
        setIsLoaded(true);
      }
    };
    loadThemePreference();
  }, []);

  // Persist theme preference when changed (non-blocking)
  const setThemeMode = useCallback((mode: ThemeMode) => {
    startTransition(() => {
      setThemeModeState(mode);
    });
    // Fire-and-forget storage update - don't block UI
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  // Resolve the actual color scheme based on mode
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (deviceColorScheme ?? 'dark') 
      : themeMode;

  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  // ═══════════════════════════════════════════════════════════════════════════
  // NATIVE THEME SYNC
  // ═══════════════════════════════════════════════════════════════════════════
  // 
  // IMPORTANT: Do NOT call Appearance.setColorScheme() on Android!
  // It resets NavigationBar.setStyle() and breaks nav bar button colors.
  // 
  // Platform-specific handling:
  // - StatusBar: Declarative <StatusBar style={...}> in _layout.tsx (both platforms)
  // - Android nav bar: NavigationBar.setStyle() - only for 3-button nav, not gesture
  // - iOS keyboard/alerts: Appearance.setColorScheme() - safe on iOS only
  // - Edge-to-edge: Handled natively via edgeToEdgeEnabled + enforceContrast in app.json
  //
  // PERF: Defer native calls to avoid blocking theme switch animation
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;

    // Let the React repaint land before running native bridge work.
    const frameId = requestAnimationFrame(() => {
      interactionTask = InteractionManager.runAfterInteractions(() => {
        if (Platform.OS === 'android') {
          // Nav bar button colors (light/dark icons) for 3-button navigation
          // Has no effect on gesture navigation - Android provides no API for that
          NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light');
        }
        if (Platform.OS === 'ios') {
          // Keyboard, alerts, action sheets, pickers
          Appearance.setColorScheme(themeMode === 'system' ? null : themeMode);
        }
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      interactionTask?.cancel();
    };
  }, [themeMode, colorScheme]);

  const toggleTheme = useCallback(() => {
    // Toggle between light and dark (explicit choice, not system)
    const current = themeMode === 'system' ? (deviceColorScheme ?? 'dark') : themeMode;
    const next = current === 'light' ? 'dark' : 'light';

    startTransition(() => {
      setThemeModeState(next);
    });

    // Fire-and-forget storage update
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, [deviceColorScheme, themeMode]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    colorScheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark,
    colors,
  }), [colorScheme, themeMode, setThemeMode, toggleTheme, isDark, colors]);

  return (
    <ThemeContext.Provider value={contextValue}>
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

/**
 * Safe version of useTheme that returns a fallback when outside provider.
 * Use this in components that may render before ThemeProvider is mounted.
 */
export function useThemeSafe() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a safe fallback for components rendering outside provider
    return {
      colorScheme: 'light' as const,
      themeMode: 'system' as const,
      setThemeMode: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

/**
 * @deprecated Use useTheme().colorScheme instead
 * Kept for backwards compatibility
 */
export function useColorScheme(): ColorScheme {
  const context = useContext(ThemeContext);
  if (!context) {
    return 'dark';
  }
  return context.colorScheme;
}

// Re-export types for convenience
export type { ThemeMode };
