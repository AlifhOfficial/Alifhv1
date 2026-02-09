/**
 * Revvup Design System - Mobile Theme (Simplified)
 * Primary: #0066FF | OLED Dark Mode | Clean Neutrals
 */

export const Colors = {
  light: {
    // BACKGROUNDS
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EBEBEB',
    
    // SURFACES (Cards, Sheets, Modals)
    surface: '#F5F5F5',
    surfaceSecondary: '#EBEBEB',
    surfacePressed: '#E0E0E0',
    
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
    border: '#E5E5E5',
    borderSecondary: '#D4D4D4',
    
    // ICONS
    icon: '#525252',
    iconMuted: '#A3A3A3',
    
    // INTERACTIVE
    fill: 'rgba(115, 115, 115, 0.12)',
    fillSecondary: 'rgba(115, 115, 115, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#EBEBEB',
    
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
// LOAD ONLY THESE 3 FONTS:
//   • Inter_400Regular  (body, descriptions)
//   • Inter_600SemiBold (values, buttons, emphasis)
//   • Inter_700Bold     (titles, prices, headers)
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
  // 34→41, 22→28, 20→26, 17→22, 15→20
  titleLarge: { ...base, fontSize: 34, lineHeight: 41, fontFamily: 'Inter_700Bold' },
  titlePrice: { ...base, fontSize: 22, lineHeight: 28, fontFamily: 'Inter_700Bold' },
  title: { ...base, fontSize: 20, lineHeight: 26, fontFamily: 'Inter_700Bold' },
  titleSmall: { ...base, fontSize: 17, lineHeight: 22, fontFamily: 'Inter_600SemiBold' },
  titleCard: { ...base, fontSize: 15, lineHeight: 20, fontFamily: 'Inter_700Bold' },

  // BODY (Regular) - slightly looser for readability
  // 17→24 (paragraphs), 15→22, 14→20
  body: { ...base, fontSize: 17, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  bodySmall: { ...base, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  bodyMini: { ...base, fontSize: 14, lineHeight: 20, fontFamily: 'Inter_400Regular' },

  // VALUES (SemiBold) - tight for data display
  // 15→20, 14→20, 13→18, 18→22
  value: { ...base, fontSize: 15, lineHeight: 20, fontFamily: 'Inter_600SemiBold' },
  stat: { ...base, fontSize: 14, lineHeight: 20, fontFamily: 'Inter_600SemiBold' },
  valueSmall: { ...base, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_600SemiBold' },
  initial: { ...base, fontSize: 18, lineHeight: 22, fontFamily: 'Inter_600SemiBold' },

  // LABELS (Bold + tracking) - reduced tracking for cross-platform consistency
  // 12→16, 11→14, 10→14
  label: { ...base, fontSize: 12, lineHeight: 16, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  labelSmall: { ...base, fontSize: 11, lineHeight: 14, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  labelBadge: { ...base, fontSize: 10, lineHeight: 14, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // UI ELEMENTS (SemiBold)
  // 15→20, 13→18, 10→14
  button: { ...base, fontSize: 15, lineHeight: 20, fontFamily: 'Inter_600SemiBold' },
  buttonSmall: { ...base, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_600SemiBold' },
  tab: { ...base, fontSize: 10, lineHeight: 14, fontFamily: 'Inter_600SemiBold' },
  chip: { ...base, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_600SemiBold' },
  link: { ...base, fontSize: 14, lineHeight: 20, fontFamily: 'Inter_600SemiBold' },

  // SUPPORTING (Regular)
  // 15→20, 13→18
  labelText: { ...base, fontSize: 15, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  helper: { ...base, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  secondary: { ...base, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_400Regular' },
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