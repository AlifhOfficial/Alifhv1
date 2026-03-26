/** Revvup Mobile Theme — Inter only, OLED dark mode */

import { Dimensions, PixelRatio, TextStyle } from 'react-native';

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
    bg: '#FFFFFF',       bg2: '#F5F5F7',
    surface: '#F5F5F7',  surface2: '#EAEAEC',
    input: '#F0F0F2',
    text: '#0A0A0A',     text2: '#333333',   text3: '#737373',   textMuted: '#A3A3A3',
    primary: '#0066FF',  primaryFg: '#FFFFFF', primaryMuted: '#E6F0FF',
    success: '#22C55E',  successMuted: '#DCFCE7',
    warning: '#F59E0B',  warningMuted: '#FEF3C7',
    error: '#EF4444',    errorMuted: '#FEE2E2',
    border: '#DCDCDE',
    icon: '#333333',     iconMuted: '#A3A3A3',
    glassBorder: 'rgba(0,0,0,0.14)',
    glassBg: '#FFFFFF',
    glassBorderDark: 'rgba(255,255,255,0.22)',
    fill: 'rgba(115,115,115,0.16)',
    fill2: 'rgba(115,115,115,0.10)',
    overlay: 'rgba(0,0,0,0.4)',
    skeleton: '#DCDCDE',
    favorite: '#F43F5E',
    blkBadgeBg: 'rgba(0,0,0,0.85)',
    blkBadgeBorder: 'rgba(255,255,255,0.12)',
    blkBadgeFg: '#FAFAFA',
    blkBg: '#FFFFFF',    blkBorder: '#B6B6B6',
    blkText: '#1C1C1E',  blkText2: '#6E6E73',
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

// ── TYPOGRAPHY (Inter only, 5 weights) ─────────────────────────────────────
export const TextDefaults = { allowFontScaling: false, maxFontSizeMultiplier: 1 } as const;

const b:  TextStyle = { includeFontPadding: false };
const bc: TextStyle = { includeFontPadding: false, textAlignVertical: 'center' };
const t  = (fs: number, lh: number, fw: TextStyle['fontWeight'], x?: Partial<TextStyle>): TextStyle =>
  ({ ...b,  fontSize: fontScale(fs), lineHeight: fontScale(lh), fontWeight: fw, ...x });
const tc = (fs: number, lh: number, fw: TextStyle['fontWeight'], x?: Partial<TextStyle>): TextStyle =>
  ({ ...bc, fontSize: fontScale(fs), lineHeight: fontScale(lh), fontWeight: fw, ...x });

const R5: TextStyle['fontWeight'] = '500';
const R6: TextStyle['fontWeight'] = '600';
const R7: TextStyle['fontWeight'] = '700';
const R8: TextStyle['fontWeight'] = '800';

//  hero · title · heading · subheading
//  bodyLg · body · bodySm
//  label · micro
//  price · code · num
export const Typography = {
  hero:       t(34, 41, R8),               // display, hero numbers
  title:      t(22, 28, R7),               // screen titles
  heading:    t(18, 24, R7),               // section headers
  subheading: t(15, 20, R7),               // card titles, sub-sections

  bodyLg:  t(17, 24, R5),                  // prominent body
  body:    t(15, 22, R5),                  // default paragraph
  bodySm:  t(13, 18, R5),                  // captions, secondary

  label: tc(12, 16, R7, { letterSpacing: 0.8 }),   // uppercase labels
  micro: tc(10, 14, R7, { letterSpacing: 0.5 }),   // badges, tabs

  price: t(18, 24, R8),                    // price display
  code:  t(14, 20, R6, { letterSpacing: 0.5 }),   // VIN, plate numbers
  num:   tc(20, 24, R7),                   // counters
} as const;

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
