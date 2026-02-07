/**
 * Revvup Design System - Mobile Theme
 * Aligned with web globals.css palette
 * Primary: #0066FF | OLED Dark Mode | Clean Neutrals
 */

export const Colors = {
  light: {
    // ═══════════════════════════════════════════
    // BACKGROUNDS - Pure white base (mirrors dark #000000)
    // ═══════════════════════════════════════════
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EBEBEB',
    backgroundElevated: '#EBEBEB',
    backgroundGrouped: '#FFFFFF',
    
    // ═══════════════════════════════════════════
    // SURFACES (Cards, Sheets, Modals) - ~10-15% darker
    // ═══════════════════════════════════════════
    surface: '#F5F5F5',
    surfaceSecondary: '#EBEBEB',
    surfacePressed: '#E0E0E0',
    surfaceHover: '#EBEBEB',
    
    // ═══════════════════════════════════════════
    // TEXT HIERARCHY (mirrors dark text)
    // ═══════════════════════════════════════════
    text: '#0A0A0A',
    textSecondary: '#525252',
    textTertiary: '#737373',
    textQuaternary: '#A3A3A3',
    textInverse: '#FAFAFA',
    
    // ═══════════════════════════════════════════
    // BRAND & ACCENT - Revvup Blue #0066FF
    // ═══════════════════════════════════════════
    primary: '#0066FF',
    primaryForeground: '#FFFFFF',
    accent: '#0066FF',
    accentForeground: '#FFFFFF',
    accentMuted: '#E6F0FF',
    
    // ═══════════════════════════════════════════
    // SEMANTIC COLORS (same as dark, muted inverted)
    // ═══════════════════════════════════════════
    success: '#22C55E',
    successMuted: '#DCFCE7',
    successForeground: '#FFFFFF',
    
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    warningForeground: '#FFFFFF',
    
    error: '#EF4444',
    errorMuted: '#FEE2E2',
    errorForeground: '#FFFFFF',
    
    info: '#8B5CF6',
    infoMuted: '#EDE9FE',
    infoForeground: '#FFFFFF',
    
    // ═══════════════════════════════════════════
    // UI ELEMENTS (mirrors dark)
    // ═══════════════════════════════════════════
    tint: '#0066FF',
    card: '#F5F5F5',
    cardElevated: '#EBEBEB',
    border: '#E5E5E5',
    borderSecondary: '#D4D4D4',
    separator: '#E5E5E5',
    separatorOpaque: '#D4D4D4',
    
    // ═══════════════════════════════════════════
    // ICONS (mirrors dark)
    // ═══════════════════════════════════════════
    icon: '#525252',
    iconSecondary: '#737373',
    iconTertiary: '#A3A3A3',
    iconActive: '#0066FF',
    
    // ═══════════════════════════════════════════
    // TAB BAR (mirrors dark)
    // ═══════════════════════════════════════════
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E5E5',
    tabIconDefault: '#737373',
    tabIconSelected: '#0066FF',
    
    // ═══════════════════════════════════════════
    // INTERACTIVE FILLS (mirrors dark)
    // ═══════════════════════════════════════════
    fill: '#737373',
    fillSecondary: 'rgba(115, 115, 115, 0.16)',
    fillTertiary: 'rgba(115, 115, 115, 0.12)',
    fillQuaternary: 'rgba(115, 115, 115, 0.08)',
    
    // ═══════════════════════════════════════════
    // BUTTONS (mirrors dark)
    // ═══════════════════════════════════════════
    buttonPrimary: '#0066FF',
    buttonPrimaryForeground: '#FFFFFF',
    buttonSecondary: '#EBEBEB',
    buttonSecondaryForeground: '#0A0A0A',
    buttonDestructive: '#EF4444',
    buttonDestructiveForeground: '#FFFFFF',
    buttonDisabled: '#E5E5E5',
    buttonDisabledForeground: '#A3A3A3',
    
    // ═══════════════════════════════════════════
    // INPUTS (mirrors dark)
    // ═══════════════════════════════════════════
    input: '#F5F5F5',
    inputBorder: '#E5E5E5',
    inputFocusBorder: '#0066FF',
    inputPlaceholder: '#A3A3A3',
    
    // ═══════════════════════════════════════════
    // MISC (mirrors dark)
    // ═══════════════════════════════════════════
    muted: '#525252',
    placeholder: '#A3A3A3',
    link: '#0066FF',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#EBEBEB',
    shimmer: '#D4D4D4',
    
    // ═══════════════════════════════════════════
    // BLK LISTING - Premium tier styling (same as dark)
    // ═══════════════════════════════════════════
    blkBackground: '#0D0D0D',
    blkBorder: '#262626',
    blkText: '#FAFAFA',
    blkTextSecondary: '#E5E5E5',
    blkTextMuted: '#525252',
    blkSeparator: '#333333',
    blkImageBackground: '#0A0A0A',
    blkAvatarBackground: '#1A1A1A',
    blkAvatarBorder: '#262626',
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
    textInverse: '#000000',
    
    // ═══════════════════════════════════════════
    // BRAND & ACCENT - Revvup Blue #0066FF
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
    
    // ═══════════════════════════════════════════
    // BLK LISTING - Premium tier styling
    // ═══════════════════════════════════════════
    blkBackground: '#0D0D0D',
    blkBorder: '#262626',
    blkText: '#FAFAFA',
    blkTextSecondary: '#E5E5E5',
    blkTextMuted: '#525252',
    blkSeparator: '#333333',
    blkImageBackground: '#0A0A0A',
    blkAvatarBackground: '#1A1A1A',
    blkAvatarBorder: '#262626',
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
  /** Tab bar height for bottom padding calculations */
  tabBarHeight: 85,
  /** Content horizontal padding */
  screenPadding: 16,
  /** Header vertical padding */
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
  
  // ─────────────────────────────────────────────────
  // NAVIGATION & HEADERS
  // ─────────────────────────────────────────────────
  navTitle: {  // Screen titles in headers
    fontSize: 20, 
    lineHeight: 24, 
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  
  // ─────────────────────────────────────────────────
  // CARD STYLES
  // ─────────────────────────────────────────────────
  cardTitle: {  // Card main title (e.g., car make/model)
    fontSize: 15, 
    lineHeight: 20, 
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  cardPrice: {  // Price display on cards
    fontSize: 17, 
    lineHeight: 22, 
    fontWeight: '700' as const,
    letterSpacing: -0.4,
  },
  cardMeta: {  // Card metadata (year, mileage, specs)
    fontSize: 11, 
    lineHeight: 14, 
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  cardSeller: {  // Seller name on cards
    fontSize: 13, 
    lineHeight: 18, 
    fontWeight: '600' as const,
    letterSpacing: -0.08,
  },
  
  // ─────────────────────────────────────────────────
  // BADGES
  // ─────────────────────────────────────────────────
  badge: {  // Standard badge text
    fontSize: 9, 
    lineHeight: 12, 
    fontWeight: '700' as const,
    letterSpacing: 1.2,
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
