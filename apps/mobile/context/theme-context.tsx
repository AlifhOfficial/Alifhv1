/**
 * Theme Context - Manual theme switching with system default
 * Integrates with device preferences and persists user choice
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme, Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setStatusBarStyle } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

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

  // Persist theme preference when changed
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Silently fail - preference just won't persist
    }
  };

  // Resolve the actual color scheme based on mode
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (deviceColorScheme ?? 'dark') 
      : themeMode;

  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  // Sync theme with native system (keyboard, status bar, navigation bar)
  // With edge-to-edge on Android, only style (light/dark icons) is supported.
  // Background colors are handled by the app content drawing behind system bars.
  useEffect(() => {
    // Appearance API - controls keyboard theme, alerts, etc. on both platforms
    if (themeMode === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themeMode);
    }
    
    // Status bar icon style (light/dark) - supported in edge-to-edge
    setStatusBarStyle(isDark ? 'light' : 'dark', true);
    
    // Navigation bar button style (light/dark) - Android only
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
    
    // Root background color for the window behind the app
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [themeMode, colorScheme, isDark, colors.background]);

  const toggleTheme = () => {
    // Toggle between light and dark (explicit choice, not system)
    setThemeMode(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      themeMode,
      setThemeMode, 
      toggleTheme, 
      isDark,
      colors,
    }}>
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
