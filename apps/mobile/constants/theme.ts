/** Revvup Mobile Theme — Inter only, OLED dark mode */

import { Dimensions, PixelRatio, Platform, TextStyle } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const BASE_WIDTH   = 430;

export const scale = (size: number, factor = 0.5): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(size + size * (ratio - 1) * factor));
};
export const fontScale = (size: number) => scale(size, 0.3);

export const Fonts = {
  regular:   '400' as const,
  medium:    '500' as const,
  semiBold:  '600' as const,
  bold:      '700' as const,
  extraBold: '800' as const,
} as const;

// ── SYSTEM COLORS (Apple HIG + Material Design 3) ──────────────────────────
// All color values are from official platform specifications.
// iOS: Apple Human Interface Guidelines system colors
// Android: Material Design 3 dynamic color equivalents

/** Apple HIG system colors — official specifications */
const iosSystemColors = {
  // System grays (neutral — 0% saturation)
  gray:  '#8C8C8C',  gray2: '#ADADAD',  gray3: '#C7C7C7',
  gray4: '#D1D1D1',  gray5: '#E5E5E5',  gray6: '#F2F2F2',
  
  // Semantic labels (neutral greys)
  label:           '#000000',  // Primary text (light mode)
  labelDark:       '#FAFAFA',  // Primary text (dark mode) - hsl(0,0%,98%)
  secondaryLabel:  '#3C3C3C',  secondaryLabelDark:  '#ADADAD',  // hsl(0,0%,68%) - matches web muted-foreground
  tertiaryLabel:   '#737373',  tertiaryLabelDark:   '#8C8C8C',  // hsl(0,0%,55%) - mid grey, readable on elevated surfaces
  quaternaryLabel: '#A3A3A3',  quaternaryLabelDark: '#6B6B6B',  // hsl(0,0%,42%) - low-emphasis but visible on dark surfaces
  
  // Backgrounds
  systemBackground:          '#FFFFFF',  systemBackgroundDark:          '#000000',
  secondarySystemBackground: '#F5F5F5',  secondarySystemBackgroundDark: '#1A1A1A',  // hsl(0,0%,10%) - matches web card
  tertiarySystemBackground:  '#FFFFFF',  tertiarySystemBackgroundDark:  '#262626',  // hsl(0,0%,15%) - matches web muted
  
  // Grouped backgrounds (for grouped lists/tables)
  groupedBackground:          '#F5F5F5',  groupedBackgroundDark:          '#000000',
  secondaryGroupedBackground: '#FFFFFF',  secondaryGroupedBackgroundDark: '#1A1A1A',
  tertiaryGroupedBackground:  '#F5F5F5',  tertiaryGroupedBackgroundDark:  '#262626',
  
  // Fills (translucent overlays — neutral)
  fill:  'rgba(128,128,128,0.20)',  fillDark:  'rgba(128,128,128,0.36)',
  fill2: 'rgba(128,128,128,0.16)',  fill2Dark: 'rgba(128,128,128,0.32)',
  fill3: 'rgba(128,128,128,0.12)',  fill3Dark: 'rgba(128,128,128,0.24)',
  
  // Separators (neutral greys)
  separator:       'rgba(0,0,0,0.10)',     separatorDark:       'rgba(255,255,255,0.10)',
  opaqueSeparator: '#E0E0E0',              opaqueSeparatorDark: '#383838',  // hsl(0,0%,22%) - matches web border
  
  // System accent colors (official HIG values)
  blue:   '#007AFF',  blueDark:   '#0A84FF',
  green:  '#34C759',  greenDark:  '#30D158',
  indigo: '#5856D6',  indigoDark: '#5E5CE6',
  orange: '#FF9500',  orangeDark: '#FF9F0A',
  pink:   '#FF2D55',  pinkDark:   '#FF375F',
  purple: '#AF52DE',  purpleDark: '#BF5AF2',
  red:    '#FF3B30',  redDark:    '#FF453A',
  teal:   '#5AC8FA',  tealDark:   '#64D2FF',
  yellow: '#FFCC00',  yellowDark: '#FFD60A',
} as const;

/** Material Design 3 equivalent mappings */
const md3Colors = {
  // Surface tiers (neutral greys to match web, no purple tint)
  surfaceContainerLowest:  '#FFFFFF',  surfaceContainerLowestDark:  '#0D0D0D',  // hsl(0,0%,5%)
  surfaceContainerLow:     '#F5F5F5',  surfaceContainerLowDark:     '#141414',  // hsl(0,0%,8%)
  surfaceContainer:        '#F0F0F0',  surfaceContainerDark:        '#1A1A1A',  // hsl(0,0%,10%) - web card
  surfaceContainerHigh:    '#EBEBEB',  surfaceContainerHighDark:    '#262626',  // hsl(0,0%,15%) - web muted
  surfaceContainerHighest: '#E6E6E6',  surfaceContainerHighestDark: '#333333',  // hsl(0,0%,20%)
  
  // On-surface text (neutral)
  onSurface:          '#1A1A1A',  onSurfaceDark:          '#E6E6E6',
  onSurfaceVariant:   '#474747',  onSurfaceVariantDark:   '#C7C7C7',
  
  // Outline (borders/separators — neutral)
  outline:        '#787878',  outlineDark:        '#939393',
  outlineVariant: '#C7C7C7',  outlineVariantDark: '#474747',
  
  // Primary (brand/accent color — using HIG blue as default)
  primary:         '#0066FF',  primaryDark:         '#0A84FF',
  onPrimary:       '#FFFFFF',  onPrimaryDark:       '#FFFFFF',
  primaryContainer:'#E6F0FF',  primaryContainerDark:'#0D2847',
  
  // Semantic states
  error:         '#BA1A1A',  errorDark:         '#FF5449',
  onError:       '#FFFFFF',  onErrorDark:       '#690005',
  errorContainer:'#FFDAD6',  errorContainerDark:'#93000A',
} as const;

/** Color palette type — ensures light/dark compatibility */
export interface ColorPalette {
  // Base
  black: string;
  white: string;
  
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Text/Labels
  label: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
  placeholder: string;
  
  // Borders & Separators
  border: string;
  separator: string;
  outline: string;
  
  // Fills
  fill: string;
  fill2: string;
  fill3: string;
  
  // Primary
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  
  // Semantic states
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  
  // Additional
  link: string;
  overlay: string;
  skeleton: string;
  favorite: string;
  
  // BLK tier (badge only)
  blkBadgeBg: string;
  blkBadgeBorder: string;
  blkBadgeFg: string;
  
  // Status
  online: string;
  offline: string;
  
  // Semantic accent colors (for UI elements that need specific hues)
  star: string;           // Rating stars
  amna: string;           // AI/Amna purple
  amnaMuted: string;      // AI/Amna purple background
  whatsapp: string;       // WhatsApp brand
  info: string;           // Info/blue-500 accent
  infoMuted: string;      // Info background
}

/** Semantic color system — platform-adaptive */
export const Colors: { light: ColorPalette; dark: ColorPalette } = {
  light: {
    // ── Base ──────────────────────────────────────────────────────────────
    black: '#000000',
    white: '#FFFFFF',
    
    // ── Backgrounds (3-tier hierarchy) ────────────────────────────────────
    background:          '#FFFFFF',   // Pure white (mirrors dark #000000)
    backgroundSecondary: '#FAFAFA',   // Near-white step (mirrors dark #1A1A1A)
    backgroundTertiary:  '#F5F5F5',   // Subtle grey step (mirrors dark #262626)
    
    // ── Surfaces (for elevated/grouped content) ───────────────────────────
    surface:          '#FFFFFF',   // Pure white surface (mirrors dark #1A1A1A)
    surfaceSecondary: '#FAFAFA',   // Near-white elevated (mirrors dark #262626)
    surfaceTertiary:  '#F5F5F5',   // Subtle grey elevated (mirrors dark #333333)
    
    // ── Text/Labels (4-tier semantic hierarchy) ───────────────────────────
    label:           iosSystemColors.label,           // Primary text
    labelSecondary:  iosSystemColors.secondaryLabel,  // Secondary text (60% opacity equivalent)
    labelTertiary:   iosSystemColors.tertiaryLabel,   // Tertiary text (30% opacity equivalent)
    labelQuaternary: iosSystemColors.quaternaryLabel, // Quaternary text (18% opacity equivalent)
    placeholder:     iosSystemColors.tertiaryLabel,   // Placeholder text in inputs
    
    // ── Borders & Separators ──────────────────────────────────────────────
    border:    iosSystemColors.separator,       // Standard separator (translucent)
    separator: iosSystemColors.opaqueSeparator, // Opaque separator
    outline:   md3Colors.outline,               // MD3 outline (for borders)
    
    // ── Fills (translucent overlays) ──────────────────────────────────────
    fill:  iosSystemColors.fill,  // Primary fill
    fill2: iosSystemColors.fill2, // Secondary fill
    fill3: iosSystemColors.fill3, // Tertiary fill
    
    // ── Accent/Primary (brand color) ──────────────────────────────────────
    primary:          iosSystemColors.blue,           // Primary accent
    primaryForeground:md3Colors.onPrimary,            // Text on primary
    primaryMuted:     md3Colors.primaryContainer,     // Subtle primary background
    
    // ── Semantic states ───────────────────────────────────────────────────
    success:      iosSystemColors.green,           // Success state
    successMuted: 'rgba(52,199,89,0.15)',          // Success background
    warning:      iosSystemColors.orange,          // Warning state
    warningMuted: 'rgba(255,149,0,0.15)',          // Warning background
    error:        iosSystemColors.red,             // Error state
    errorMuted:   md3Colors.errorContainer,        // Error background
    
    // ── Additional semantic colors ────────────────────────────────────────
    link:     iosSystemColors.blue,  // Hyperlinks
    overlay:  'rgba(0,0,0,0.4)',     // Modal/sheet overlay
    skeleton: iosSystemColors.gray3, // Skeleton loader
    
    // ── App-specific ──────────────────────────────────────────────────────
    favorite: iosSystemColors.pink,  // Favorite/like indicator
    
    // ── BLK tier badge (premium badge branding) ───────────────────────────
    blkBadgeBg:      'rgba(0,0,0,0.85)',                 // Dark badge background
    blkBadgeBorder:  'rgba(255,255,255,0.12)',           // Subtle light border
    blkBadgeFg:      '#FAFAFA',                          // Light text on dark badge
    
    // ── Status indicators (online/presence) ───────────────────────────────
    online:  iosSystemColors.red,     // Online indicator (red per brand)
    offline: iosSystemColors.purple,  // Offline/away indicator
    
    // ── Semantic accent colors ────────────────────────────────────────────
    star:      '#FACC15',                  // Rating stars (amber)
    amna:      '#8B5CF6',                  // AI/Amna purple
    amnaMuted: 'rgba(139,92,246,0.15)',     // AI/Amna purple background
    whatsapp:  '#25D366',                  // WhatsApp brand green
    info:      '#3B82F6',                  // Info/blue-500
    infoMuted: 'rgba(59,130,246,0.12)',     // Info background
  },
  dark: {
    // ── Base ──────────────────────────────────────────────────────────────
    black: '#000000',
    white: '#FFFFFF',
    
    // ── Backgrounds (3-tier hierarchy) ────────────────────────────────────
    background:          iosSystemColors.systemBackgroundDark,           // Pure black (OLED)
    backgroundSecondary: iosSystemColors.secondarySystemBackgroundDark,  // Slightly elevated
    backgroundTertiary:  iosSystemColors.tertiarySystemBackgroundDark,   // Third-level
    
    // ── Surfaces (for elevated/grouped content) ───────────────────────────
    surface:          md3Colors.surfaceContainerDark,     // Default surface
    surfaceSecondary: md3Colors.surfaceContainerHighDark, // Elevated
    surfaceTertiary:  md3Colors.surfaceContainerHighestDark, // Highest
    
    // ── Text/Labels (4-tier semantic hierarchy) ───────────────────────────
    label:           iosSystemColors.labelDark,           // Primary text (white)
    labelSecondary:  iosSystemColors.secondaryLabelDark,  // Secondary
    labelTertiary:   iosSystemColors.tertiaryLabelDark,   // Tertiary
    labelQuaternary: iosSystemColors.quaternaryLabelDark, // Quaternary
    placeholder:     iosSystemColors.tertiaryLabelDark,   // Placeholder
    
    // ── Borders & Separators ──────────────────────────────────────────────
    border:    iosSystemColors.separatorDark,
    separator: iosSystemColors.opaqueSeparatorDark,
    outline:   md3Colors.outlineDark,
    
    // ── Fills (translucent overlays) ──────────────────────────────────────
    fill:  iosSystemColors.fillDark,
    fill2: iosSystemColors.fill2Dark,
    fill3: iosSystemColors.fill3Dark,
    
    // ── Accent/Primary (brand color) ──────────────────────────────────────
    primary:          iosSystemColors.blueDark,
    primaryForeground:md3Colors.onPrimaryDark,
    primaryMuted:     md3Colors.primaryContainerDark,
    
    // ── Semantic states ───────────────────────────────────────────────────
    success:      iosSystemColors.greenDark,
    successMuted: 'rgba(48,209,88,0.20)',
    warning:      iosSystemColors.orangeDark,
    warningMuted: 'rgba(255,159,10,0.20)',
    error:        iosSystemColors.redDark,
    errorMuted:   md3Colors.errorContainerDark,
    
    // ── Additional semantic colors ────────────────────────────────────────
    link:     iosSystemColors.blueDark,
    overlay:  'rgba(0,0,0,0.7)',
    skeleton: md3Colors.surfaceContainerHighestDark, // #333333 — subtle neutral on dark surfaces
    
    // ── App-specific ──────────────────────────────────────────────────────
    favorite: iosSystemColors.pinkDark,
    
    // ── BLK tier badge (premium badge branding) ───────────────────────────
    blkBadgeBg:      'rgba(0,0,0,0.9)',                     // Slightly darker badge
    blkBadgeBorder:  'rgba(255,255,255,0.14)',              // Slightly more visible border
    blkBadgeFg:      '#FAFAFA',                             // Same light text
    
    // ── Status indicators (online/presence) ───────────────────────────────
    online:  iosSystemColors.redDark,
    offline: iosSystemColors.purpleDark,
    
    // ── Semantic accent colors ────────────────────────────────────────────
    star:      '#FBBF24',                  // Rating stars (amber, slightly brighter for dark)
    amna:      '#A78BFA',                  // AI/Amna purple (lighter for dark)
    amnaMuted: 'rgba(167,139,250,0.20)',    // AI/Amna purple background
    whatsapp:  '#25D366',                  // WhatsApp brand green
    info:      '#60A5FA',                  // Info/blue-400 (lighter for dark)
    infoMuted: 'rgba(96,165,250,0.15)',     // Info background
  },
};

export const Spacing = {
  xs: scale(4), sm: scale(8), md: scale(12), lg: scale(16),
  xl: scale(20), '2xl': scale(24), '3xl': scale(32), '4xl': scale(40), '5xl': scale(48),
} as const;

export const Layout = {
  screenPadding: scale(16), tabBarHeight: scale(85),
  headerPadding: scale(8),  headerGap: scale(8),
  topGradientExtension: scale(60), bottomGradientExtension: scale(30),
  hitTarget: scale(44), hitTargetSmall: scale(36), hitSlop: scale(10), hitSlopSmall: scale(8),
} as const;

export const BorderWidths = {
  thin: 1,
  medium: 2,
} as const;

export const Opacity = {
  muted: 0.4,
} as const;

export const Timing = {
  longPress: 400,
  imageTransition: 200,
  avatarTransition: 150,
} as const;

export const Stroke = {
  icon: 1.75,
} as const;

export const AspectRatio = {
  cardImage: 16 / 9,
} as const;

export const Sizes = {
  iconXs: scale(14), iconSm: scale(18), iconMd: scale(22), iconLg: scale(24), iconXl: scale(28),
  avatarSm: scale(32), avatarMd: scale(40), avatarLg: scale(48),
  bubbleXs: scale(28), bubble: scale(36), bubbleMd: scale(42),
  pillHeight: scale(36), pillHeightMd: scale(42), pillRadius: 18, pillRadiusMd: 21,
  actionButtonSm: scale(36), actionButtonMd: scale(40), actionButtonLg: scale(48),
  cardThumbnailWidth: scale(160), cardThumbnailHeight: scale(140),
  badgePaddingH: scale(6), badgePaddingV: scale(3),
} as const;

export const Radius = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, full: 9999,
} as const;

/** Stacking layers — use instead of raw zIndex values */
export const ZIndex = {
  base:    0,
  raised:  10,   // Floating elements above content (FAB, sticky headers)
  overlay: 20,   // Headers, toolbars, overlaid UI
  modal:   100,  // Sheets, modals, auth overlays
} as const;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────────────
// iOS     → Apple HIG Dynamic Type, "Large" (default) sizes
// Android → Material Design 3, remapped to the same semantic size tiers
// while preserving platform-typical weight behavior.

const b:  TextStyle = { includeFontPadding: false };
const bc: TextStyle = { includeFontPadding: false, textAlignVertical: 'center' };
const androidLineHeight = (fontSize: number, lineHeight: number) =>
  Math.max(lineHeight - 3, fontSize + 2);
const t  = (
  fs: number,
  lh: number,
  fw: TextStyle['fontWeight'],
  x?: Partial<TextStyle>,
  androidLh = lh,
): TextStyle =>
  ({
    ...b,
    fontSize: fontScale(fs),
    lineHeight: fontScale(Platform.OS === 'android' ? androidLh : lh),
    fontWeight: fw,
    ...x,
  });
const tc = (
  fs: number,
  lh: number,
  fw: TextStyle['fontWeight'],
  x?: Partial<TextStyle>,
  androidLh = lh,
): TextStyle =>
  ({
    ...bc,
    fontSize: fontScale(fs),
    lineHeight: fontScale(Platform.OS === 'android' ? androidLh : lh),
    fontWeight: fw,
    ...x,
  });

const R6: TextStyle['fontWeight'] = '600';
const R7: TextStyle['fontWeight'] = '700';

// ── Apple HIG — Large (default) Dynamic Type ─────────────────────────────────
//   Plain variants = Semibold (our floor), Emphasized = Bold
const ios = {
  largeTitle:  t(34, 41, '600'),  largeTitleE:  t(34, 41, '700'),  // 34pt  Semibold / Bold
  title1:      t(28, 34, '600'),  title1E:      t(28, 34, '700'),  // 28pt  Semibold / Bold
  title2:      t(22, 28, '600'),  title2E:      t(22, 28, '700'),  // 22pt  Semibold / Bold
  title3:      t(20, 25, '600'),  title3E:      t(20, 25, '700'),  // 20pt  Semibold / Bold
  headline:    t(17, 22, '600'),                                    // 17pt  Semibold
  body:        t(17, 22, '600'),  bodyE:        t(17, 22, '700'),  // 17pt  Semibold / Bold
  callout:     t(16, 21, '600'),  calloutE:     t(16, 21, '700'),  // 16pt  Semibold / Bold
  subhead:     t(15, 20, '600'),  subheadE:     t(15, 20, '700'),  // 15pt  Semibold / Bold
  footnote:    t(13, 18, '600'),  footnoteE:    t(13, 18, '700'),  // 13pt  Semibold / Bold
  caption1:    t(12, 16, '600'),  caption1E:    t(12, 16, '700'),  // 12pt  Semibold / Bold
  caption2:    t(11, 13, '600'),  caption2E:    t(11, 13, '700'),  // 11pt  Semibold / Bold
} as const;

// ── Material Design 3 — remapped to Apple HIG Large equivalents ──────────────
//   Token names preserved for semantic clarity; sizes now mirror HIG exactly.
//   display* → title tier  |  headline* → heading tier
//   title*  → subheading/body tier  |  label* → caption/label tier  |  body* → body tier
const md3 = {
  displayLg:  t(34, 41, '600', undefined, 37),                              // = ios.largeTitle
  displayMd:  t(28, 34, '600', undefined, 31),                              // = ios.title1
  displaySm:  t(22, 28, '600', undefined, 25),                              // = ios.title2
  headlineLg: t(20, 25, '600', undefined, androidLineHeight(20, 25)),       // = ios.title3
  headlineMd: t(17, 22, '600', undefined, androidLineHeight(17, 22)),       // = ios.headline
  headlineSm: t(16, 21, '600', undefined, androidLineHeight(16, 21)),       // = ios.callout
  titleLg:    t(15, 20, '600', undefined, androidLineHeight(15, 20)),       // = ios.subhead
  titleMd:    t(13, 18, '600', undefined, androidLineHeight(13, 18)),       // = ios.footnote
  titleSm:    t(12, 16, '600', undefined, androidLineHeight(12, 16)),       // = ios.caption1
  labelLg:    t(13, 18, '600', undefined, androidLineHeight(13, 18)),       // = ios.footnote
  labelMd:    t(12, 16, '600', undefined, androidLineHeight(12, 16)),       // = ios.caption1
  labelSm:    t(11, 13, '600', undefined, androidLineHeight(11, 13)),       // = ios.caption2
  bodyLg:     t(17, 22, '600', undefined, androidLineHeight(17, 22)),       // = ios.body
  bodyMd:     t(16, 21, '600', undefined, androidLineHeight(16, 21)),       // = ios.callout
  bodySm:     t(15, 20, '600', undefined, androidLineHeight(15, 20)),       // = ios.subhead
} as const;

const p = <T extends TextStyle>(iosVal: T, androidVal: T): T =>
  (Platform.select({ ios: iosVal, android: androidVal }) ?? iosVal) as T;

// ── Semantic tokens ───────────────────────────────────────────────────────────
//   iOS uses emphasized variants for display/heading tiers; Android maps to the
//   equivalent MD3 role with tighter leading to offset larger font metrics.
//
//                        iOS                   Android (md3 equivalent)     pt
export const Typography = {
  hero:       p(ios.largeTitleE,  md3.displayLg  ),  // Display      — 34pt 700/600
  title:      p(ios.title2E,      md3.displaySm  ),  // Title 2      — 22pt 700/600
  heading:    p(ios.title3E,      md3.headlineLg ),  // Title 3      — 20pt 700/600
  subheading: p(ios.headline,     md3.headlineMd ),  // Headline     — 17pt 600/600

  bodyLg:     p(ios.body,         md3.bodyLg     ),  // Body         — 17pt 600/600
  body:       p(ios.callout,      md3.bodyMd     ),  // Callout      — 16pt 600/600
  bodySm:     p(ios.subhead,      md3.bodySm     ),  // Subhead      — 15pt 600/600

  // Caption tier — same value on both platforms
  label: p(
    tc(13, 18, R7, { letterSpacing: 0.8 }),  // Footnote (13pt) — uppercase labels
    tc(13, 18, R6, { letterSpacing: 0.8 }, androidLineHeight(13, 18)),  // md3.labelLg
  ),
  caption: p(
    tc(12, 16, R7, { letterSpacing: 0.5 }),  // Caption 1 (12pt) — badges, timestamps
    tc(12, 16, R6, { letterSpacing: 0.5 }, androidLineHeight(12, 16)),  // md3.labelMd
  ),
} as const;

// ── Raw platform type scales (for direct platform-specific use) ─────────────
export const IosTypeScale = ios;
export const Md3TypeScale = md3;

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
} as const;

// ── Type exports ────────────────────────────────────────────────────────────
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = ColorPalette;

/** iOS system grays — neutral scale aligned with md3 surface tiers
 *  Light values: original HIG, all hsl(0,0%,N%)
 *  Dark values:  inverted to match our established neutral dark scale */
export const SystemGrays = {
  gray:  iosSystemColors.gray,   grayDark:  iosSystemColors.quaternaryLabelDark,  // #595959 — hsl(0,0%,35%)
  gray2: iosSystemColors.gray2,  gray2Dark: md3Colors.outlineVariantDark,         // #474747 — hsl(0,0%,28%)
  gray3: iosSystemColors.gray3,  gray3Dark: iosSystemColors.opaqueSeparatorDark,  // #383838 — hsl(0,0%,22%)
  gray4: iosSystemColors.gray4,  gray4Dark: md3Colors.surfaceContainerHighestDark,// #333333 — hsl(0,0%,20%)
  gray5: iosSystemColors.gray5,  gray5Dark: iosSystemColors.tertiarySystemBackgroundDark, // #262626 — hsl(0,0%,15%)
  gray6: iosSystemColors.gray6,  gray6Dark: iosSystemColors.secondarySystemBackgroundDark,// #1A1A1A — hsl(0,0%,10%)
} as const;
