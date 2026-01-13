import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    /** Inter font for all sans-serif text */
    sans: 'Inter',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const lightColors = {
  // Base colors - Pure white background
  background: '#FFFFFF',
  foreground: '#0D0D0D', // ~5% gray

  // Card colors
  card: '#FFFFFF',
  cardForeground: '#0D0D0D',

  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#0D0D0D',

  // Primary colors - Blue accent (221.2 83.2% 53.3%)
  primary: '#2563EB', // Blue
  primaryForeground: '#FAFAFA',

  // Secondary colors
  secondary: '#F5F5F5', // ~96% lightness
  secondaryForeground: '#1A1A1A', // ~10% lightness

  // Muted colors
  muted: '#F5F5F5', // ~96% lightness
  mutedForeground: '#737373', // ~45% lightness

  // Accent colors
  accent: '#F5F5F5',
  accentForeground: '#1A1A1A',

  // Destructive colors - Red (0 84.2% 60.2%)
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',

  // Border and input
  border: '#E5E5E5', // ~90% lightness
  input: '#E5E5E5',
  ring: '#2563EB',

  // Text colors
  text: '#0D0D0D',
  textMuted: '#737373',

  // Sidebar colors
  sidebar: '#FAFAFA', // ~98% lightness
  sidebarForeground: '#1A1A1A',
  sidebarBorder: '#E5E5E5',

  // Legacy support for existing components
  tint: '#1A1A1A',
  icon: '#737373',
  tabIconDefault: '#737373',
  tabIconSelected: '#1A1A1A',

  // iOS System Colors
  blue: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  pink: '#FF2D92',
  purple: '#AF52DE',
  teal: '#5AC8FA',
  indigo: '#5856D6',
};

export const darkColors = {
  // Base colors - Pure OLED black (matches web dark theme)
  background: '#000000', // 0% lightness - pure black
  foreground: '#FAFAFA', // ~98% lightness

  // Card colors - Match web dark theme
  card: '#1A1A1A', // ~10% lightness
  cardForeground: '#FAFAFA',

  // Popover colors
  popover: '#1A1A1A', // ~10% lightness
  popoverForeground: '#FAFAFA',

  // Primary colors - Blue (217.2 91.2% 59.8%)
  primary: '#3B82F6',
  primaryForeground: '#FAFAFA',

  // Secondary colors
  secondary: '#262626', // ~15% lightness
  secondaryForeground: '#FAFAFA',

  // Muted colors
  muted: '#262626', // ~15% lightness
  mutedForeground: '#A6A6A6', // ~65% lightness

  // Accent colors
  accent: '#262626',
  accentForeground: '#FAFAFA',

  // Destructive colors - Red (0 62.8% 50%)
  destructive: '#DC2626',
  destructiveForeground: '#FAFAFA',

  // Border and input - ~15% lightness
  border: '#262626',
  input: '#262626',
  ring: '#3B82F6',

  // Text colors
  text: '#FAFAFA',
  textMuted: '#A6A6A6',

  // Sidebar colors - Match card styling
  sidebar: '#1A1A1A', // ~10% lightness
  sidebarForeground: '#F2F2F2', // ~95% lightness
  sidebarBorder: '#292929', // ~16% lightness

  // Legacy support for existing components
  tint: '#FAFAFA',
  icon: '#A6A6A6',
  tabIconDefault: '#A6A6A6',
  tabIconSelected: '#FAFAFA',

  // iOS System Colors - Dark variants
  blue: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  pink: '#FF375F',
  purple: '#BF5AF2',
  teal: '#64D2FF',
  indigo: '#5E5CE6',
};

// Charcoal theme - macOS-inspired (matches web charcoal theme)
export const charcoalColors = {
  // Base colors - 8% lightness background
  background: '#141414', // 0 0% 8%
  foreground: '#F5F5F5', // ~96% lightness

  // Card colors - Elevated surfaces (12% lightness)
  card: '#1F1F1F', // 0 0% 12%
  cardForeground: '#F5F5F5',

  // Popover colors
  popover: '#1F1F1F',
  popoverForeground: '#F5F5F5',

  // Primary colors - Blue accent (217 91% 60%)
  primary: '#3B82F6',
  primaryForeground: '#F5F5F5',

  // Secondary colors - Subtle surfaces (18% lightness)
  secondary: '#2E2E2E',
  secondaryForeground: '#F5F5F5',

  // Muted colors - Subdued elements
  muted: '#2E2E2E', // ~18% lightness
  mutedForeground: '#8C8C8C', // ~55% lightness

  // Accent colors - Interactive elements
  accent: '#333333', // ~20% lightness
  accentForeground: '#F5F5F5',

  // Destructive colors - Error states
  destructive: '#DC2626',
  destructiveForeground: '#F5F5F5',

  // Border and input - Refined separators
  border: '#333333', // ~20% lightness
  input: '#2E2E2E', // ~18% lightness
  ring: '#3B82F6',

  // Text colors
  text: '#F5F5F5',
  textMuted: '#8C8C8C',

  // Sidebar colors - macOS-style
  sidebar: '#1F1F1F', // ~12% lightness
  sidebarForeground: '#F5F5F5',
  sidebarBorder: '#333333', // ~20% lightness

  // Legacy support
  tint: '#F5F5F5',
  icon: '#8C8C8C',
  tabIconDefault: '#8C8C8C',
  tabIconSelected: '#F5F5F5',

  // iOS System Colors - Adjusted for charcoal
  blue: '#3B82F6',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  pink: '#FF375F',
  purple: '#BF5AF2',
  teal: '#64D2FF',
  indigo: '#5E5CE6',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
  charcoal: charcoalColors,
};
