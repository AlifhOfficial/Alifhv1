/**
 * Revvup Design System - Mobile Theme (Simplified)
 * Primary: #0066FF | OLED Dark Mode | Clean Neutrals
 */

import { Dimensions, PixelRatio } from 'react-native';

// ═══════════════════════════════════════════════════
// RESPONSIVE SCALING
// ═══════════════════════════════════════════════════
// Base design width: iPhone 14/15 (393px)
// Scales proportionally to device screen width
// Factor of 0.5 = moderate scaling (not too aggressive)

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 393;

/**
 * Scales a size value based on screen width
 * @param size - Base size in design pixels
 * @param factor - How aggressively to scale (0 = none, 1 = full). Default 0.15
 */
const scale = (size: number, factor = 0.15): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size + (size * (scaleRatio - 1) * factor);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Font-specific scaling - very subtle to maintain consistency
const fontScale = (size: number): number => scale(size, 0.1);

export const Colors = {
  light: {
    // BACKGROUNDS
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F4',
    backgroundTertiary: '#EAEAEC',
    
    // SURFACES (Cards, Sheets, Modals) - Noticeable contrast on white
    surface: '#F2F2F4',
    surfaceSecondary: '#EAEAEC',
    surfacePressed: '#DDDDE0',
    
    // INPUT FIELDS - Distinct from both background and surface
    input: '#EDEDF0',
    inputFocused: '#FFFFFF',
    
    // TEXT
    text: '#0A0A0A',
    textSecondary: '#525252',
    textTertiary: '#737373',
    textMuted: '#A3A3A3',
    
    // BRAND
    primary: '#0066FF',
    primaryForeground: '#FFFFFF',
    primaryMuted: '#E6F0FF',
    
    // SEMANTIC
    success: '#22C55E',
    successMuted: '#DCFCE7',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    error: '#EF4444',
    errorMuted: '#FEE2E2',
    
    // BORDERS
    border: '#DCDCDE',
    borderSecondary: '#C8C8CC',
    
    // ICONS
    icon: '#525252',
    iconMuted: '#A3A3A3',
    
    // INTERACTIVE
    fill: 'rgba(115, 115, 115, 0.16)',
    fillSecondary: 'rgba(115, 115, 115, 0.10)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#DCDCDE',
    
    // ACTIONS
    favorite: '#F43F5E',
    
    // BLK LISTING - Premium tier
    blkBackground: '#0D0D0D',
    blkBorder: '#262626',
    blkText: '#FAFAFA',
    blkTextSecondary: '#A3A3A3',
  },
  
  dark: {
    // BACKGROUNDS - OLED Black
    background: '#000000',
    backgroundSecondary: '#141414',
    backgroundTertiary: '#1A1A1A',
    
    // SURFACES (Cards, Sheets, Modals)
    surface: '#1A1A1A',
    surfaceSecondary: '#262626',
    surfacePressed: '#333333',
    
    // INPUT FIELDS
    input: '#1A1A1A',
    inputFocused: '#262626',
    
    // TEXT
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    textMuted: '#525252',
    
    // BRAND
    primary: '#0066FF',
    primaryForeground: '#FAFAFA',
    primaryMuted: '#0D2847',
    
    // SEMANTIC
    success: '#22C55E',
    successMuted: '#14532D',
    warning: '#F59E0B',
    warningMuted: '#451A03',
    error: '#EF4444',
    errorMuted: '#450A0A',
    
    // BORDERS
    border: '#262626',
    borderSecondary: '#333333',
    
    // ICONS
    icon: '#A3A3A3',
    iconMuted: '#525252',
    
    // INTERACTIVE
    fill: 'rgba(115, 115, 115, 0.24)',
    fillSecondary: 'rgba(115, 115, 115, 0.16)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#262626',
    
    // ACTIONS
    favorite: '#F43F5E',
    
    // BLK LISTING - Premium tier
    blkBackground: '#0D0D0D',
    blkBorder: '#262626',
    blkText: '#FAFAFA',
    blkTextSecondary: '#A3A3A3',
  },
};

// ═══════════════════════════════════════════════════
// SPACING SCALE (8pt grid)
// ═══════════════════════════════════════════════════
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ═══════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════
export const Layout = {
  tabBarHeight: 85,
  screenPadding: 16,
  headerPadding: 8,
} as const;

// ═══════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════
export const Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM
// ═══════════════════════════════════════════════════
// 
// LOADED FONTS (5 weights):
//   • Inter_400Regular   (body, descriptions)
//   • Inter_500Medium    (secondary labels, hints)
//   • Inter_600SemiBold  (values, buttons, emphasis)
//   • Inter_700Bold      (titles, prices, headers)
//   • Inter_800ExtraBold (hero numbers, feature callouts)
//
// RULES:
//   1. NEVER set fontWeight - fontFamily handles it
//   2. Use tokens via ...Typography.xxx
//   3. Set allowFontScaling={false} on UI text for consistency
//
// SEMANTIC GUIDE:
//   titleLarge   → Hero screens, onboarding
//   titlePrice   → Listing prices only
//   title        → Section headers, screen titles
//   titleSmall   → Navigation titles, card headers
//   titleCard    → Car make/model in cards
//   body         → Long-form reading, descriptions
//   bodySmall    → Secondary descriptions
//   bodyMini     → Fine print, disclaimers
//   value        → Spec values, names with emphasis
//   stat         → Metadata row (km, specs, location)
//   valueSmall   → Seller names, small emphasis
//   initial      → Avatar initials
//   label        → UPPERCASE section headers
//   labelSmall   → Small labels (VIN, tags)
//   labelBadge   → Badge text (BLK, VERIFIED)
//   button       → Primary/secondary buttons
//   buttonSmall  → Compact buttons, chips
//   tab          → Tab bar labels
//   chip         → Filter chips, tags
//   link         → Clickable text links
//   labelText    → Form field labels
//   helper       → Timestamps, helper text
//   secondary    → Tertiary info (seller type)
//
// ═══════════════════════════════════════════════════

// Base style for Android consistency (spread into all tokens)
const base = {
  includeFontPadding: false, // Removes extra Android padding
};

export const Typography = {
  // TITLES (Bold)
  titleLarge: { ...base, fontSize: fontScale(34), lineHeight: fontScale(41), fontFamily: 'Inter_700Bold' },
  titlePrice: { ...base, fontSize: fontScale(18), lineHeight: fontScale(24), fontFamily: 'Inter_700Bold' },
  title: { ...base, fontSize: fontScale(20), lineHeight: fontScale(26), fontFamily: 'Inter_700Bold' },
  titleSmall: { ...base, fontSize: fontScale(17), lineHeight: fontScale(22), fontFamily: 'Inter_600SemiBold' },
  titleCard: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_700Bold' },

  // BODY (Medium) - slightly looser for readability
  body: { ...base, fontSize: fontScale(17), lineHeight: fontScale(24), fontFamily: 'Inter_500Medium' },
  bodySmall: { ...base, fontSize: fontScale(15), lineHeight: fontScale(22), fontFamily: 'Inter_500Medium' },
  bodyMini: { ...base, fontSize: fontScale(14), lineHeight: fontScale(20), fontFamily: 'Inter_500Medium' },

  // VALUES (SemiBold) - tight for data display
  value: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_600SemiBold' },
  stat: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_600SemiBold' },
  valueSmall: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_600SemiBold' },
  initial: { ...base, fontSize: fontScale(18), lineHeight: fontScale(22), fontFamily: 'Inter_600SemiBold' },

  // LABELS (Bold + tracking) - reduced tracking for cross-platform consistency
  label: { ...base, fontSize: fontScale(12), lineHeight: fontScale(16), fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  labelSmall: { ...base, fontSize: fontScale(11), lineHeight: fontScale(14), fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  labelBadge: { ...base, fontSize: fontScale(10), lineHeight: fontScale(14), fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // UI ELEMENTS (SemiBold)
  button: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_600SemiBold' },
  buttonSmall: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_600SemiBold' },
  tab: { ...base, fontSize: fontScale(10), lineHeight: fontScale(14), fontFamily: 'Inter_600SemiBold' },
  chip: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_600SemiBold' },
  link: { ...base, fontSize: fontScale(14), lineHeight: fontScale(20), fontFamily: 'Inter_600SemiBold' },

  // SUPPORTING (Medium)
  labelText: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_500Medium' },
  helper: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_500Medium' },
  secondary: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_500Medium' },

  // MEDIUM WEIGHT (Inter_500Medium) - for secondary labels, hints
  labelMedium: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_500Medium' },
  helperMedium: { ...base, fontSize: fontScale(13), lineHeight: fontScale(18), fontFamily: 'Inter_500Medium' },
  valueMedium: { ...base, fontSize: fontScale(15), lineHeight: fontScale(20), fontFamily: 'Inter_500Medium' },

  // EXTRA BOLD (Inter_800ExtraBold) - for hero numbers
  heroNumber: { ...base, fontSize: fontScale(32), lineHeight: fontScale(38), fontFamily: 'Inter_800ExtraBold' },
} as const;

// ═══════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Type helpers
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

// Export scaling utilities for custom use
export { scale, fontScale, SCREEN_WIDTH, BASE_WIDTH };