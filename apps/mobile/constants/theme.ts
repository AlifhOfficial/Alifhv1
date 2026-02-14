/**
 * Revvup Design System - Mobile Theme
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Primary: #0066FF | OLED Dark Mode | Clean Neutrals
 * 
 * Typography System Architecture:
 * ─────────────────────────────────────────────────────────────────────────────
 * This theme implements a comprehensive typography system designed for
 * automotive marketplace UI patterns. Every text style is tokenized to ensure
 * consistency across the entire app.
 * 
 * FONT WEIGHTS LOADED:
 *   • Inter_400Regular   → Supporting text, placeholders
 *   • Inter_500Medium    → Body text, labels, descriptions
 *   • Inter_600SemiBold  → Data values, stats, interactive elements
 *   • Inter_700Bold      → Titles, prices, headings
 *   • Inter_800ExtraBold → Hero numbers, marketing callouts
 * 
 * IMPORTANT RULES:
 *   1. NEVER set fontWeight inline - fontFamily handles weight
 *   2. Always use tokens via ...Typography.xxx spread
 *   3. Font scaling is DISABLED for UI consistency across devices
 *   4. Do NOT override fontSize/lineHeight unless absolutely necessary
 * 
 * RESPONSIVE SCALING:
 *   • Layout/spacing scales with screen width via scale() (factor 0.5)
 *   • Font sizes scale gently via fontScale() (factor 0.3)
 *   • Base design width: 430px (iPhone 15 Pro Max)
 *   • All sizes adapt proportionally to smaller/larger screens
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Dimensions, PixelRatio, TextStyle } from 'react-native';

// ═══════════════════════════════════════════════════
// SCREEN METRICS
// ═══════════════════════════════════════════════════
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 430; // iPhone 15 Pro Max - scales down gracefully on smaller devices

/**
 * Scales a size value proportionally to screen width.
 * @param size - Base size designed at 430px width (iPhone 15 Pro Max)
 * @param factor - How aggressively to scale (0 = none, 1 = full proportional). Default 0.5
 */
const scale = (size: number, factor = 0.5): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size + (size * (scaleRatio - 1) * factor);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scales font sizes gently with screen width.
 * Uses a conservative factor (0.3) so text stays readable on all sizes
 * but still adapts to small/large screens.
 */
const fontScale = (size: number): number => scale(size, 0.3);

// ═══════════════════════════════════════════════════
// FONT FAMILY NAMES
// ═══════════════════════════════════════════════════
export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const Colors = {
  light: {
    // BACKGROUNDS - Pure white base
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#EAEAEC',
    
    // SURFACES (Cards, Sheets, Modals) - Elevated gray on white
    surface: '#F5F5F7',
    surfaceSecondary: '#EAEAEC',
    surfacePressed: '#E0E0E2',
    
    // INPUT FIELDS - Distinct from both background and surface
    input: '#F0F0F2',
    inputFocused: '#FFFFFF',
    
    // TEXT
    text: '#0A0A0A',
    textSecondary: '#333333',
    textTertiary: '#737373',
    textMuted: '#A3A3A3',
    
    // BRAND
    primary: '#0066FF',
    primaryForeground: '#FFFFFF',
    primaryMuted: '#E6F0FF',
    
    // SECONDARY (Buttons)
    secondary: '#F5F5F7',
    secondaryForeground: '#0A0A0A',
    
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
    icon: '#333333',
    iconMuted: '#A3A3A3',
    
    // GLASS (Pills, bubbles - solid backgrounds)
    glassBorder: 'rgba(0,0,0,0.08)',
    glassBackground: '#FFFFFF',
    
    // INTERACTIVE
    fill: 'rgba(115, 115, 115, 0.16)',
    fillSecondary: 'rgba(115, 115, 115, 0.10)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    skeleton: '#DCDCDE',
    
    // ACTIONS
    favorite: '#F43F5E',
    
    // BLK Badge - stays dark in both modes
    blkBadgeBackground: '#0D0D0D',
    blkBadgeText: '#FAFAFA',
    // BLK LISTING - Premium tier (light mode variant - macOS-style gray)
    blkBackground: '#FFFFFF',
    blkBorder: '#B6B6B6',
    blkText: '#1C1C1E',
    blkTextSecondary: '#6E6E73',
  },
  
  dark: {
    // BACKGROUNDS - Near-black
    background: '#0D0D0D',
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
    textSecondary: '#D4D4D4',
    textTertiary: '#737373',
    textMuted: '#525252',
    
    // BRAND
    primary: '#0066FF',
    primaryForeground: '#FAFAFA',
    primaryMuted: '#0D2847',
    
    // SECONDARY (Buttons)
    secondary: '#262626',
    secondaryForeground: '#FAFAFA',
    
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
    icon: '#D4D4D4',
    iconMuted: '#525252',
    
    // GLASS (Pills, bubbles - solid backgrounds)
    glassBorder: 'rgba(255,255,255,0.14)',
    glassBackground: '#0D0D0D',
    
    // INTERACTIVE
    fill: 'rgba(115, 115, 115, 0.24)',
    fillSecondary: 'rgba(115, 115, 115, 0.16)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#262626',
    
    // ACTIONS
    favorite: '#F43F5E',
    
    // BLK Badge - stays dark in both modes
    blkBadgeBackground: '#0D0D0D',
    blkBadgeText: '#FAFAFA',
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
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(32),
  '4xl': scale(40),
  '5xl': scale(48),
} as const;

// ═══════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════
export const Layout = {
  // Screen
  screenPadding: scale(16),
  tabBarHeight: 85,
  
  // Header
  headerPadding: scale(8),
  headerGap: scale(8),
  
  // Hit targets (Apple HIG: 44pt minimum)
  hitTarget: scale(44),
  hitTargetSmall: scale(36),
  hitSlop: scale(10),
  hitSlopSmall: scale(8),
} as const;

// ═══════════════════════════════════════════════════
// COMPONENT SIZES
// ═══════════════════════════════════════════════════
export const Sizes = {
  // Icons
  iconXs: scale(14),
  iconSm: scale(18),
  iconMd: scale(22),
  iconLg: scale(24),
  iconXl: scale(28),
  
  // Avatars
  avatarSm: scale(32),
  avatarMd: scale(40),
  avatarLg: scale(48),
  
  // Bubbles & Pills (universal action containers)
  bubble: scale(36),        // Standard action bubble (back, search, sort, create, etc.)
  bubbleLg: scale(48),      // Large bubble for global tab bar
  pillHeight: scale(36),    // Inner pill height for tab bars
  pillHeightLg: scale(48),  // Large pill height for global tab bar
  pillRadius: 18,           // Pill border radius
  pillRadiusLg: 24,         // Large pill border radius
  
  // Action buttons (icon containers)
  actionButtonSm: scale(36),
  actionButtonMd: scale(40),
  actionButtonLg: scale(48),
  
  // Card thumbnails
  cardThumbnailWidth: scale(160),
  cardThumbnailHeight: scale(140),
  
  // Badge padding
  badgePaddingH: scale(6),
  badgePaddingV: scale(3),
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
// A comprehensive, semantic typography system designed for
// automotive marketplace UI. Organized by purpose, not just size.
//
// ═══════════════════════════════════════════════════
// CATEGORY GUIDE
// ═══════════════════════════════════════════════════
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ DISPLAY (Inter_800ExtraBold / Inter_700Bold)                           │
// │ Hero screens, large numbers, marketing callouts                        │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ displayLarge   → 34px  Hero onboarding, splash screens                 │
// │ displayMedium  → 28px  Feature highlights, empty states                │
// │ displayNumber  → 32px  Large stats (price totals, counts)              │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ HEADINGS (Inter_700Bold / Inter_600SemiBold)                           │
// │ Screen titles, section headers, card titles                            │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ headingLarge   → 20px  Screen titles, detail page titles               │
// │ headingMedium  → 18px  Large prices, modal titles                      │
// │ headingSmall   → 17px  Navigation titles, card headers                 │
// │ headingCard    → 17px  Car make/model in list cards                    │
// │ headingMini    → 15px  Small section titles, drawer headers            │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ BODY (Inter_500Medium / Inter_400Regular)                              │
// │ Long-form content, descriptions, readable paragraphs                   │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ bodyLarge      → 17px  Primary body text, descriptions                 │
// │ bodyMedium     → 15px  Standard body, listing descriptions             │
// │ bodySmall      → 14px  Secondary descriptions, compact text            │
// │ bodyMini       → 13px  Fine print, disclaimers, captions               │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ DATA / VALUES (Inter_600SemiBold)                                      │
// │ Statistics, specs, metadata - tight line heights for data density      │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ dataLarge      → 16px  Prominent prices in cards                       │
// │ dataMedium     → 15px  Spec values, stats (mileage, km, year)          │
// │ dataSmall      → 14px  Seller names, secondary values                  │
// │ dataMini       → 13px  Highlights, negotiable labels, VIN              │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ LABELS (Inter_700Bold + letter-spacing)                                │
// │ Section headers (uppercase), category titles, form labels              │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ labelLarge     → 13px  Form labels, filter headers                     │
// │ labelMedium    → 12px  SECTION HEADERS (uppercase)                     │
// │ labelSmall     → 11px  Small tags, VIN labels                          │
// │ labelBadge     → 10px  Badge text (BLK, VERIFIED)                      │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ UI CONTROLS (Inter_600SemiBold)                                        │
// │ Buttons, tabs, chips, interactive elements                             │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ buttonLarge    → 17px  Primary CTA buttons                             │
// │ buttonMedium   → 15px  Standard buttons                                │
// │ buttonSmall    → 13px  Compact buttons, action links                   │
// │ tabLabel       → 10px  Tab bar labels                                  │
// │ chip           → 13px  Filter chips, feature tags                      │
// │ link           → 14px  Clickable text links ("Read more")              │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ SUPPORTING (Inter_500Medium / Inter_400Regular)                        │
// │ Helper text, timestamps, tertiary information                          │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ supportingMedium → 15px  Spec labels (left side), form hints           │
// │ supportingSmall  → 13px  Seller type, timestamps, helper text          │
// │ supportingMini   → 12px  Subtle metadata, copyright text               │
// │ placeholder      → 15px  Input placeholders                            │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ SPECIAL PURPOSE                                                        │
// │ Unique use cases with specific requirements                            │
// ├─────────────────────────────────────────────────────────────────────────┤
// │ avatarInitial  → 18px  Avatar letter initials                          │
// │ avatarSmall    → 14px  Small avatar initials                           │
// │ priceTag       → 18px  Standalone price display                        │
// │ priceMini      → 16px  Compact price (in cards)                        │
// │ vinCode        → 15px  VIN numbers (monospace feel)                    │
// │ counter        → 20px  Notification badges, counts                     │
// └─────────────────────────────────────────────────────────────────────────┘
//
// ═══════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════
//
// Screen Title:         ...Typography.headingLarge
// Car Title (Detail):   ...Typography.headingLarge
// Car Title (Card):     ...Typography.headingCard
// Price (Detail):       ...Typography.priceTag
// Price (Card):         ...Typography.priceMini
// Stats Row:            ...Typography.dataMedium
// Description:          ...Typography.bodyMedium
// Section Header:       ...Typography.labelMedium (+ uppercase)
// Spec Label:           ...Typography.supportingMedium
// Spec Value:           ...Typography.dataMedium
// Feature Badge:        ...Typography.chip
// Seller Name:          ...Typography.dataSmall
// Seller Type:          ...Typography.supportingSmall
// Timestamp:            ...Typography.dataMedium
// "Read more" link:     ...Typography.link
// Primary Button:       ...Typography.buttonMedium
// Tab Bar:              ...Typography.tabLabel
//
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// BASE TEXT STYLE - Cross-platform consistency
// ═══════════════════════════════════════════════════
// Applied to ALL typography tokens for consistent rendering
//
// NOTE: To disable font scaling, set allowFontScaling={false} 
// on Text components, or use a custom Text wrapper component.

const base: TextStyle = {
  // Android-specific fix for consistent rendering
  includeFontPadding: false,        // Remove extra top/bottom padding
};

// Centered variant for single-line UI controls (buttons, labels, chips, tabs)
// NOT for multi-line body text which would look "off" on Android
const centered: TextStyle = {
  textAlignVertical: 'center',
};

// ═══════════════════════════════════════════════════
// TEXT COMPONENT DEFAULTS
// ═══════════════════════════════════════════════════
// Export these to use in a custom Text wrapper component
// to ensure consistent behavior app-wide

export const TextDefaults = {
  allowFontScaling: false,  // Disable accessibility font scaling for UI consistency
  maxFontSizeMultiplier: 1, // Cap font scaling if allowFontScaling is enabled
} as const;

// ═══════════════════════════════════════════════════
// PRIMARY SEMANTIC TOKENS
// ═══════════════════════════════════════════════════

const SemanticTypography = {
  // ─────────────────────────────────────────────────────
  // DISPLAY - Hero screens, large attention text
  // ─────────────────────────────────────────────────────
  displayLarge: { 
    ...base, 
    fontSize: fontScale(34), 
    lineHeight: fontScale(41), 
    fontFamily: 'Inter_700Bold' 
  },
  displayMedium: { 
    ...base, 
    fontSize: fontScale(28), 
    lineHeight: fontScale(34), 
    fontFamily: 'Inter_700Bold' 
  },
  displayNumber: { 
    ...base, 
    fontSize: fontScale(32), 
    lineHeight: fontScale(38), 
    fontFamily: 'Inter_800ExtraBold' 
  },

  // ─────────────────────────────────────────────────────
  // HEADINGS - Titles and section headers
  // ─────────────────────────────────────────────────────
  headingLarge: { 
    ...base, 
    fontSize: fontScale(22), 
    lineHeight: fontScale(24), 
    fontFamily: 'Inter_700Bold' 
  },
  headingMedium: { 
    ...base, 
    fontSize: fontScale(18), 
    lineHeight: fontScale(24), 
    fontFamily: 'Inter_700Bold' 
  },
  headingSmall: { 
    ...base, 
    fontSize: fontScale(17), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_600SemiBold' 
  },
  headingCard: { 
    ...base, 
    fontSize: fontScale(17), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_700Bold' 
  },
  headingMini: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_700Bold' 
  },

  // ─────────────────────────────────────────────────────
  // BODY - Long-form readable content
  // ─────────────────────────────────────────────────────
  bodyLarge: { 
    ...base, 
    fontSize: fontScale(17), 
    lineHeight: fontScale(24), 
    fontFamily: 'Inter_500Medium' 
  },
  bodyMedium: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_500Medium' 
  },
  bodySmall: { 
    ...base, 
    fontSize: fontScale(14), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_500Medium' 
  },
  bodyMini: { 
    ...base, 
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_500Medium' 
  },

  // ─────────────────────────────────────────────────────
  // DATA / VALUES - Stats, specs, metadata (tight)
  // ─────────────────────────────────────────────────────
  dataLarge: { 
    ...base, 
    fontSize: fontScale(16), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_600SemiBold' 
  },
  dataMedium: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_600SemiBold' 
  },
  dataSmall: { 
    ...base, 
    fontSize: fontScale(14), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_600SemiBold' 
  },
  dataMini: { 
    ...base, 
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_600SemiBold' 
  },

  // ─────────────────────────────────────────────────────
  // LABELS - Section headers, form labels, tags
  // ─────────────────────────────────────────────────────
  labelLarge: { 
    ...base, 
    ...centered,
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_700Bold', 
    letterSpacing: 0.5 
  },
  labelMedium: { 
    ...base, 
    ...centered,
    fontSize: fontScale(12), 
    lineHeight: fontScale(16), 
    fontFamily: 'Inter_700Bold', 
    letterSpacing: 1 
  },
  labelSmall: { 
    ...base, 
    ...centered,
    fontSize: fontScale(11), 
    lineHeight: fontScale(14), 
    fontFamily: 'Inter_700Bold', 
    letterSpacing: 0.3 
  },
  labelBadge: { 
    ...base, 
    ...centered,
    fontSize: fontScale(10), 
    lineHeight: fontScale(14), 
    fontFamily: 'Inter_700Bold', 
    letterSpacing: 0.5 
  },

  // ─────────────────────────────────────────────────────
  // UI CONTROLS - Buttons, tabs, chips, links
  // ─────────────────────────────────────────────────────
  buttonLarge: { 
    ...base, 
    ...centered,
    fontSize: fontScale(17), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_600SemiBold' 
  },
  buttonMedium: { 
    ...base, 
    ...centered,
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_600SemiBold' 
  },
  buttonSmall: { 
    ...base, 
    ...centered,
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_600SemiBold' 
  },
  tabLabel: { 
    ...base, 
    ...centered,
    fontSize: fontScale(10), 
    lineHeight: fontScale(14), 
    fontFamily: 'Inter_600SemiBold' 
  },
  chip: { 
    ...base, 
    ...centered,
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_600SemiBold' 
  },
  link: { 
    ...base, 
    ...centered,
    fontSize: fontScale(14), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_600SemiBold' 
  },

  // ─────────────────────────────────────────────────────
  // SUPPORTING - Helper text, captions, metadata
  // ─────────────────────────────────────────────────────
  supportingMedium: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_500Medium' 
  },
  supportingSmall: { 
    ...base, 
    fontSize: fontScale(13), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_500Medium' 
  },
  supportingMini: { 
    ...base, 
    fontSize: fontScale(12), 
    lineHeight: fontScale(16), 
    fontFamily: 'Inter_500Medium' 
  },
  placeholder: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_400Regular' 
  },

  // ─────────────────────────────────────────────────────
  // SPECIAL PURPOSE - Unique use cases
  // ─────────────────────────────────────────────────────
  avatarInitial: { 
    ...base, 
    fontSize: fontScale(18), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_600SemiBold' 
  },
  avatarSmall: { 
    ...base, 
    fontSize: fontScale(14), 
    lineHeight: fontScale(18), 
    fontFamily: 'Inter_600SemiBold' 
  },
  priceTag: { 
    ...base, 
    fontSize: fontScale(18), 
    lineHeight: fontScale(24), 
    fontFamily: 'Inter_700Bold' 
  },
  priceMini: { 
    ...base, 
    fontSize: fontScale(16), 
    lineHeight: fontScale(22), 
    fontFamily: 'Inter_700Bold' 
  },
  vinCode: { 
    ...base, 
    fontSize: fontScale(15), 
    lineHeight: fontScale(20), 
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5 
  },
  counter: { 
    ...base, 
    ...centered,
    fontSize: fontScale(20), 
    lineHeight: fontScale(24), 
    fontFamily: 'Inter_700Bold' 
  },
} as const;

export const Typography = {
  ...SemanticTypography,
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
