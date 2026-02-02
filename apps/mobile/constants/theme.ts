/**
 * Alifh Design System - Mobile Theme
 * Aligned with web globals.css palette
 * Primary: #0066FF | OLED Dark Mode | Clean Neutrals
 */

export const Colors = {
  light: {
    // ═══════════════════════════════════════════
    // BACKGROUNDS - Clean whites
    // ═══════════════════════════════════════════
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#EBEBED',
    backgroundElevated: '#FFFFFF',
    backgroundGrouped: '#F5F5F7',
    
    // ═══════════════════════════════════════════
    // SURFACES (Cards, Sheets, Modals)
    // ═══════════════════════════════════════════
    surface: '#FFFFFF',
    surfaceSecondary: '#FAFAFA',
    surfacePressed: '#F0F0F2',
    surfaceHover: '#F5F5F7',
    
    // ═══════════════════════════════════════════
    // TEXT HIERARCHY - Alifh neutrals
    // ═══════════════════════════════════════════
    text: '#0D0D0D',
    textSecondary: '#737373',
    textTertiary: '#A3A3A3',
    textQuaternary: '#D4D4D4',
    textInverse: '#FAFAFA',
    
    // ═══════════════════════════════════════════
    // BRAND & ACCENT - Alifh Blue #0066FF
    // ═══════════════════════════════════════════
    primary: '#0066FF',
    primaryForeground: '#FAFAFA',
    accent: '#0066FF',
    accentForeground: '#FAFAFA',
    accentMuted: '#E6F0FF',
    
    // ═══════════════════════════════════════════
    // SEMANTIC COLORS
    // ═══════════════════════════════════════════
    success: '#22C55E',
    successMuted: '#DCFCE7',
    successForeground: '#FAFAFA',
    
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    warningForeground: '#FAFAFA',
    
    error: '#EF4444',
    errorMuted: '#FEE2E2',
    errorForeground: '#FAFAFA',
    
    info: '#8B5CF6',
    infoMuted: '#EDE9FE',
    infoForeground: '#FAFAFA',
    
    // ═══════════════════════════════════════════
    // UI ELEMENTS
    // ═══════════════════════════════════════════
    tint: '#0066FF',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    border: '#E5E5E5',
    borderSecondary: '#D4D4D4',
    separator: '#E5E5E5',
    separatorOpaque: '#D4D4D4',
    
    // ═══════════════════════════════════════════
    // ICONS
    // ═══════════════════════════════════════════
    icon: '#737373',
    iconSecondary: '#A3A3A3',
    iconTertiary: '#D4D4D4',
    iconActive: '#0066FF',
    
    // ═══════════════════════════════════════════
    // TAB BAR
    // ═══════════════════════════════════════════
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E5E5',
    tabIconDefault: '#A3A3A3',
    tabIconSelected: '#0066FF',
    
    // ═══════════════════════════════════════════
    // INTERACTIVE FILLS
    // ═══════════════════════════════════════════
    fill: '#737373',
    fillSecondary: 'rgba(115, 115, 115, 0.16)',
    fillTertiary: 'rgba(115, 115, 115, 0.12)',
    fillQuaternary: 'rgba(115, 115, 115, 0.08)',
    
    // ═══════════════════════════════════════════
    // BUTTONS
    // ═══════════════════════════════════════════
    buttonPrimary: '#0066FF',
    buttonPrimaryForeground: '#FAFAFA',
    buttonSecondary: '#F5F5F7',
    buttonSecondaryForeground: '#0D0D0D',
    buttonDestructive: '#EF4444',
    buttonDestructiveForeground: '#FAFAFA',
    buttonDisabled: '#E5E5E5',
    buttonDisabledForeground: '#A3A3A3',
    
    // ═══════════════════════════════════════════
    // INPUTS
    // ═══════════════════════════════════════════
    input: '#F5F5F7',
    inputBorder: '#E5E5E5',
    inputFocusBorder: '#0066FF',
    inputPlaceholder: '#A3A3A3',
    
    // ═══════════════════════════════════════════
    // MISC
    // ═══════════════════════════════════════════
    muted: '#737373',
    placeholder: '#A3A3A3',
    link: '#0066FF',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#E5E5E5',
    shimmer: '#F5F5F7',
  },
  
  dark: {
    // ═══════════════════════════════════════════
    // BACKGROUNDS - OLED Black base
    // ═══════════════════════════════════════════
    background: '#000000',
    backgroundSecondary: '#141414',
    backgroundTertiary: '#1A1A1A',
    backgroundElevated: '#1A1A1A',
    backgroundGrouped: '#000000',
    
    // ═══════════════════════════════════════════
    // SURFACES (Cards, Sheets, Modals) - ~10-15%
    // ═══════════════════════════════════════════
    surface: '#1A1A1A',
    surfaceSecondary: '#262626',
    surfacePressed: '#333333',
    surfaceHover: '#262626',
    
    // ═══════════════════════════════════════════
    // TEXT HIERARCHY
    // ═══════════════════════════════════════════
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    textQuaternary: '#525252',
    textInverse: '#0D0D0D',
    
    // ═══════════════════════════════════════════
    // BRAND & ACCENT - Alifh Blue #0066FF
    // ═══════════════════════════════════════════
    primary: '#0066FF',
    primaryForeground: '#FAFAFA',
    accent: '#0066FF',
    accentForeground: '#FAFAFA',
    accentMuted: '#0D2847',
    
    // ═══════════════════════════════════════════
    // SEMANTIC COLORS
    // ═══════════════════════════════════════════
    success: '#22C55E',
    successMuted: '#14532D',
    successForeground: '#FAFAFA',
    
    warning: '#F59E0B',
    warningMuted: '#451A03',
    warningForeground: '#FAFAFA',
    
    error: '#EF4444',
    errorMuted: '#450A0A',
    errorForeground: '#FAFAFA',
    
    info: '#8B5CF6',
    infoMuted: '#2E1065',
    infoForeground: '#FAFAFA',
    
    // ═══════════════════════════════════════════
    // UI ELEMENTS
    // ═══════════════════════════════════════════
    tint: '#0066FF',
    card: '#1A1A1A',
    cardElevated: '#262626',
    border: '#262626',
    borderSecondary: '#333333',
    separator: '#262626',
    separatorOpaque: '#333333',
    
    // ═══════════════════════════════════════════
    // ICONS
    // ═══════════════════════════════════════════
    icon: '#A3A3A3',
    iconSecondary: '#737373',
    iconTertiary: '#525252',
    iconActive: '#0066FF',
    
    // ═══════════════════════════════════════════
    // TAB BAR
    // ═══════════════════════════════════════════
    tabBar: '#000000',
    tabBarBorder: '#262626',
    tabIconDefault: '#737373',
    tabIconSelected: '#0066FF',
    
    // ═══════════════════════════════════════════
    // INTERACTIVE FILLS
    // ═══════════════════════════════════════════
    fill: '#737373',
    fillSecondary: 'rgba(115, 115, 115, 0.32)',
    fillTertiary: 'rgba(115, 115, 115, 0.24)',
    fillQuaternary: 'rgba(115, 115, 115, 0.18)',
    
    // ═══════════════════════════════════════════
    // BUTTONS
    // ═══════════════════════════════════════════
    buttonPrimary: '#0066FF',
    buttonPrimaryForeground: '#FAFAFA',
    buttonSecondary: '#262626',
    buttonSecondaryForeground: '#FAFAFA',
    buttonDestructive: '#EF4444',
    buttonDestructiveForeground: '#FAFAFA',
    buttonDisabled: '#262626',
    buttonDisabledForeground: '#525252',
    
    // ═══════════════════════════════════════════
    // INPUTS
    // ═══════════════════════════════════════════
    input: '#1A1A1A',
    inputBorder: '#262626',
    inputFocusBorder: '#0066FF',
    inputPlaceholder: '#525252',
    
    // ═══════════════════════════════════════════
    // MISC
    // ═══════════════════════════════════════════
    muted: '#A3A3A3',
    placeholder: '#525252',
    link: '#0066FF',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#262626',
    shimmer: '#333333',
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
// TYPOGRAPHY - Mobile-First Inter System
// Based on iOS HIG & shadcn/ui semantic patterns
// ═══════════════════════════════════════════════════
export const Typography = {
  // ─────────────────────────────────────────────────
  // HEADINGS - Semantic hierarchy (shadcn pattern)
  // ─────────────────────────────────────────────────
  h1: { 
    fontSize: 34, 
    lineHeight: 41, 
    fontWeight: '800' as const,  // extrabold
    letterSpacing: -1.2,         // tracking-tighter
  },
  h2: { 
    fontSize: 28, 
    lineHeight: 34, 
    fontWeight: '600' as const,  // semibold
    letterSpacing: -0.6,         // tracking-tight
  },
  h3: { 
    fontSize: 22, 
    lineHeight: 28, 
    fontWeight: '600' as const,
    letterSpacing: -0.4,
  },
  h4: { 
    fontSize: 20, 
    lineHeight: 25, 
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  
  // ─────────────────────────────────────────────────
  // BODY TEXT
  // ─────────────────────────────────────────────────
  p: { 
    fontSize: 17, 
    lineHeight: 28,              // leading-7 (relaxed)
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  
  // ─────────────────────────────────────────────────
  // SPECIAL TEXT STYLES (shadcn utilities)
  // ─────────────────────────────────────────────────
  lead: {  // Intro paragraphs, prominent descriptions
    fontSize: 20, 
    lineHeight: 32, 
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    // color: textMuted
  },
  large: {  // Emphasized content
    fontSize: 18, 
    lineHeight: 28, 
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  small: {  // Fine print, helper text
    fontSize: 14, 
    lineHeight: 14, 
    fontWeight: '500' as const,
    letterSpacing: 0,
  },
  muted: {  // Secondary/tertiary content
    fontSize: 14, 
    lineHeight: 20, 
    fontWeight: '400' as const,
    letterSpacing: 0,
    // color: textMuted
  },
  
  // ─────────────────────────────────────────────────
  // BLOCKQUOTE
  // ─────────────────────────────────────────────────
  blockquote: { 
    fontSize: 17, 
    lineHeight: 28, 
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
    letterSpacing: -0.2,
    // borderLeftWidth: 2, borderLeftColor: border
  },
  
  // ─────────────────────────────────────────────────
  // CODE
  // ─────────────────────────────────────────────────
  inlineCode: { 
    fontSize: 14, 
    lineHeight: 20, 
    fontWeight: '600' as const,
    fontFamily: 'monospace',
    letterSpacing: 0,
    // backgroundColor: muted, borderRadius: 4
  },
  
  // ─────────────────────────────────────────────────
  // LIST ITEMS
  // ─────────────────────────────────────────────────
  list: { 
    fontSize: 17, 
    lineHeight: 28, 
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  
  // ─────────────────────────────────────────────────
  // TABLE
  // ─────────────────────────────────────────────────
  tableHeader: { 
    fontSize: 15, 
    lineHeight: 20, 
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  tableCell: { 
    fontSize: 15, 
    lineHeight: 20, 
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  
  // ─────────────────────────────────────────────────
  // MOBILE-SPECIFIC (iOS HIG aligned)
  // ─────────────────────────────────────────────────
  largeTitle: {  // Screen headers, hero
    fontSize: 34, 
    lineHeight: 41, 
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  headline: {  // List row titles, card headers
    fontSize: 17, 
    lineHeight: 22, 
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {  // Primary content
    fontSize: 17, 
    lineHeight: 22, 
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {  // Secondary content
    fontSize: 16, 
    lineHeight: 21, 
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subhead: {  // Form labels, section subtitles
    fontSize: 15, 
    lineHeight: 20, 
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {  // Helper text, timestamps
    fontSize: 13, 
    lineHeight: 18, 
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {  // Badges, tags
    fontSize: 12, 
    lineHeight: 16, 
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {  // Smallest text
    fontSize: 11, 
    lineHeight: 13, 
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
  
  // ─────────────────────────────────────────────────
  // BUTTONS
  // ─────────────────────────────────────────────────
  buttonLarge: { 
    fontSize: 17, 
    lineHeight: 22, 
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  buttonMedium: { 
    fontSize: 15, 
    lineHeight: 20, 
    fontWeight: '600' as const,
    letterSpacing: -0.24,
  },
  buttonSmall: { 
    fontSize: 13, 
    lineHeight: 18, 
    fontWeight: '600' as const,
    letterSpacing: -0.08,
  },
  
  // ─────────────────────────────────────────────────
  // TAB BAR
  // ─────────────────────────────────────────────────
  tabBar: { 
    fontSize: 10, 
    lineHeight: 12, 
    fontWeight: '500' as const,
    letterSpacing: 0.16,
  },
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
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Type helpers
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
