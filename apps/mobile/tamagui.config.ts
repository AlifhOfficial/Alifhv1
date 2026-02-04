/**
 * Tamagui Config - Revvup Design System
 * Inter font with mobile-first typography
 */

import { createTamagui, createFont } from 'tamagui';
import { config as configBase } from '@tamagui/config/v3';
import { createAnimations } from '@tamagui/animations-react-native';

// ═══════════════════════════════════════════════════
// INTER FONT - Mobile-First Typography Scale
// iOS HIG & Material Design aligned
// ═══════════════════════════════════════════════════
const interFont = createFont({
  family: 'Inter_400Regular',
  
  // Size scale following iOS HIG
  size: {
    1: 10,   // tabBar
    2: 11,   // caption2
    3: 12,   // caption1
    4: 13,   // footnote, buttonSmall
    5: 15,   // subhead, buttonMedium
    6: 16,   // callout
    7: 17,   // body, headline, buttonLarge (iOS default)
    8: 20,   // title3
    9: 22,   // title2
    10: 28,  // title1
    11: 34,  // largeTitle
    true: 17, // Default body size
  },
  
  // Line heights matched to sizes
  lineHeight: {
    1: 12,   // tabBar
    2: 13,   // caption2
    3: 16,   // caption1
    4: 18,   // footnote
    5: 20,   // subhead
    6: 21,   // callout
    7: 22,   // body, headline
    8: 25,   // title3
    9: 28,   // title2
    10: 34,  // title1
    11: 41,  // largeTitle
    true: 22,
  },
  
  // Weight tokens
  weight: {
    1: '400', // regular
    2: '500', // medium
    3: '600', // semibold
    4: '700', // bold
    true: '400',
  },
  
  // Letter spacing (negative for tight, positive for loose)
  letterSpacing: {
    1: 0.16,  // tabBar (loose)
    2: 0.07,  // caption2
    3: 0,     // caption1
    4: -0.08, // footnote
    5: -0.24, // subhead
    6: -0.32, // callout  
    7: -0.41, // body, headline
    8: 0.38,  // title3
    9: 0.35,  // title2
    10: 0.36, // title1
    11: 0.37, // largeTitle
    true: -0.41,
  },
  
  // Map weights to actual Inter font variants
  face: {
    400: { normal: 'Inter_400Regular' },
    500: { normal: 'Inter_500Medium' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});

// Animations
const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 300,
  },
});

// Revvup themes
const lightTheme = {
  background: '#FFFFFF',
  backgroundHover: '#F5F5F7',
  backgroundPress: '#F5F5F7',
  backgroundFocus: '#F5F5F7',
  color: '#0D0D0D',
  colorHover: '#0D0D0D',
  colorPress: '#737373',
  colorFocus: '#0D0D0D',
  borderColor: '#E5E5E5',
  borderColorHover: '#D4D4D4',
  borderColorPress: '#D4D4D4',
  borderColorFocus: '#0066FF',
  placeholderColor: '#A3A3A3',
  
  // Semantic
  primary: '#0066FF',
  secondary: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',
  textPrimary: '#0D0D0D',
  textSecondary: '#737373',
  textMuted: '#A3A3A3',
};

const darkTheme = {
  background: '#000000',
  backgroundHover: '#141414',
  backgroundPress: '#141414',
  backgroundFocus: '#141414',
  color: '#FAFAFA',
  colorHover: '#FAFAFA',
  colorPress: '#A3A3A3',
  colorFocus: '#FAFAFA',
  borderColor: '#262626',
  borderColorHover: '#333333',
  borderColorPress: '#333333',
  borderColorFocus: '#0066FF',
  placeholderColor: '#737373',
  
  // Semantic
  primary: '#0066FF',
  secondary: '#141414',
  surface: '#1A1A1A',
  surfaceSecondary: '#262626',
  textPrimary: '#FAFAFA',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
};

const config = createTamagui({
  ...configBase,
  animations,
  fonts: {
    heading: interFont,
    body: interFont,
  },
  themes: {
    ...configBase.themes,
    light: {
      ...configBase.themes.light,
      ...lightTheme,
    },
    dark: {
      ...configBase.themes.dark,
      ...darkTheme,
    },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
