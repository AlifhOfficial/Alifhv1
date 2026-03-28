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

export const Colors = {
  light: {
    black: '#000000',    white: '#FFFFFF',
    bg: '#F2F2F2',       bg2: '#EBEBEB',
    surface: '#E5E5E5',  surface2: '#D9D9D9',
    input: '#E5E5E5',
    text: '#050505',     text2: '#2B2B2B',   text3: '#8C8C8C',   textMuted: '#ADADAD',
    primary: '#0066FF',  primaryFg: '#FFFFFF', primaryMuted: '#E6F0FF',
    success: '#22C55E',  successMuted: '#DCFCE7',
    warning: '#F59E0B',  warningMuted: '#FEF3C7',
    error: '#EF4444',    errorMuted: '#FEE2E2',
    border: '#D9D9D9',
    icon: '#2B2B2B',     iconMuted: '#ADADAD',
    glassBorder: 'rgba(0,0,0,0.22)',
    glassBg: '#F2F2F2',
    glassBorderDark: 'rgba(0,0,0,0.22)',
    fill: 'rgba(115,115,115,0.16)',
    fill2: 'rgba(115,115,115,0.10)',
    overlay: 'rgba(0,0,0,0.4)',
    skeleton: '#D9D9D9',
    favorite: '#F43F5E',
    blkBadgeBg: 'rgba(0,0,0,0.85)',
    blkBadgeBorder: 'rgba(255,255,255,0.12)',
    blkBadgeFg: '#FAFAFA',
    blkBg: '#F2F2F2',    blkBorder: '#D9D9D9',
    blkText: '#050505',  blkText2: '#5C5C5C',
    online: '#FF6B6B',   offline: '#9B87F5',
  },
  dark: {
    black: '#000000',    white: '#FFFFFF',
    bg: '#0D0D0D',       bg2: '#141414',
    surface: '#1A1A1A',  surface2: '#262626',
    input: '#1A1A1A',
    text: '#FAFAFA',     text2: '#D4D4D4',   text3: '#737373',   textMuted: '#525252',
    primary: '#0066FF',  primaryFg: '#FAFAFA', primaryMuted: '#0D2847',
    success: '#22C55E',  successMuted: '#14532D',
    warning: '#F59E0B',  warningMuted: '#451A03',
    error: '#EF4444',    errorMuted: '#450A0A',
    border: '#262626',
    icon: '#D4D4D4',     iconMuted: '#525252',
    glassBorder: 'rgba(255,255,255,0.22)',
    glassBg: '#0D0D0D',
    glassBorderDark: 'rgba(255,255,255,0.22)',
    fill: 'rgba(115,115,115,0.24)',
    fill2: 'rgba(115,115,115,0.16)',
    overlay: 'rgba(0,0,0,0.7)',
    skeleton: '#262626',
    favorite: '#F43F5E',
    blkBadgeBg: 'rgba(0,0,0,0.9)',
    blkBadgeBorder: 'rgba(255,255,255,0.14)',
    blkBadgeFg: '#FAFAFA',
    blkBg: '#0D0D0D',    blkBorder: '#262626',
    blkText: '#FAFAFA',  blkText2: '#A3A3A3',
    online: '#FF6B6B',   offline: '#9B87F5',
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
// Android → Material Design 3, remapped to exactly mirror HIG Large sizes
// All semantic tokens produce the same pt values on both platforms.
// The only per-platform difference is weight: iOS emphasized tokens use 700
// while MD3 base tokens use 600 (MD3 doesn't separate regular/emphasized tiers).

const b:  TextStyle = { includeFontPadding: false };
const bc: TextStyle = { includeFontPadding: false, textAlignVertical: 'center' };
const t  = (fs: number, lh: number, fw: TextStyle['fontWeight'], x?: Partial<TextStyle>): TextStyle =>
  ({ ...b,  fontSize: fontScale(fs), lineHeight: fontScale(lh), fontWeight: fw, ...x });
const tc = (fs: number, lh: number, fw: TextStyle['fontWeight'], x?: Partial<TextStyle>): TextStyle =>
  ({ ...bc, fontSize: fontScale(fs), lineHeight: fontScale(lh), fontWeight: fw, ...x });

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
  displayLg:  t(34, 41, '600'),  // = ios.largeTitle  (was 57/64)
  displayMd:  t(28, 34, '600'),  // = ios.title1      (was 45/52)
  displaySm:  t(22, 28, '600'),  // = ios.title2      (was 36/44)
  headlineLg: t(20, 25, '600'),  // = ios.title3      (was 32/40)
  headlineMd: t(17, 22, '600'),  // = ios.headline    (was 28/36)
  headlineSm: t(16, 21, '600'),  // = ios.callout     (was 24/32)
  titleLg:    t(15, 20, '600'),  // = ios.subhead     (was 22/28)
  titleMd:    t(13, 18, '600'),  // = ios.footnote    (was 16/24)
  titleSm:    t(12, 16, '600'),  // = ios.caption1    (was 14/20)
  labelLg:    t(13, 18, '600'),  // = ios.footnote    (was 14/20)
  labelMd:    t(12, 16, '600'),  // = ios.caption1    (unchanged)
  labelSm:    t(11, 13, '600'),  // = ios.caption2    (was 11/16 — fixed leading)
  bodyLg:     t(17, 22, '600'),  // = ios.body        (was 16/24)
  bodyMd:     t(16, 21, '600'),  // = ios.callout     (was 14/20)
  bodySm:     t(15, 20, '600'),  // = ios.subhead     (was 12/16)
} as const;

const p = <T extends TextStyle>(iosVal: T, androidVal: T): T =>
  (Platform.select({ ios: iosVal, android: androidVal }) ?? iosVal) as T;

// ── Semantic tokens ───────────────────────────────────────────────────────────
//   iOS uses emphasized variants (700) for display/heading tiers; Android uses
//   the base (600) at the same point size. All sizes are now identical cross-platform.
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
    tc(13, 18, R7, { letterSpacing: 0.8 }),  // md3.labelLg     — same
  ),
  caption: p(
    tc(12, 16, R7, { letterSpacing: 0.5 }),  // Caption 1 (12pt) — badges, timestamps
    tc(12, 16, R7, { letterSpacing: 0.5 }),  // md3.labelMd      — same
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

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
