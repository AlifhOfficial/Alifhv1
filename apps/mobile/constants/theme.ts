/** Revvup Mobile Theme — Inter only, OLED dark mode */

import { Dimensions, PixelRatio, Platform, TextStyle } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const BASE_WIDTH = 430;
export const BASE_HEIGHT = 932;
const MIN_DEVICE_SCALE = 0.82;
const MIN_FONT_SCALE = 0.74;
const MAX_DEVICE_SCALE = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getDeviceScale = () => {
  const widthRatio = SCREEN_WIDTH / BASE_WIDTH;
  const heightRatio = SCREEN_HEIGHT / BASE_HEIGHT;
  const blendedRatio = widthRatio * 0.68 + heightRatio * 0.32;
  return clamp(blendedRatio, MIN_DEVICE_SCALE, MAX_DEVICE_SCALE);
};

const getFontDeviceScale = () =>
  clamp(SCREEN_WIDTH / BASE_WIDTH, MIN_FONT_SCALE, MAX_DEVICE_SCALE);

export const scale = (size: number, factor = 0.86): number => {
  const ratio = getDeviceScale();
  const scaled = size * (1 + (ratio - 1) * factor);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const fontScale = (size: number): number => {
  const scaled = size * getFontDeviceScale();
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const Fonts = {
  regular: "400" as const,
  medium: "500" as const,
  semiBold: "600" as const,
  bold: "700" as const,
  extraBold: "800" as const,
} as const;

export const AppFontFamilies = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
} as const;

const getAppFontStyle = (fontWeight: TextStyle["fontWeight"]): TextStyle => {
  if (fontWeight === "800" || fontWeight === "900") {
    return { fontFamily: AppFontFamilies.extraBold };
  }

  if (fontWeight === "700" || fontWeight === "bold") {
    return { fontFamily: AppFontFamilies.bold };
  }

  if (fontWeight === "500" || fontWeight === "medium") {
    return { fontFamily: AppFontFamilies.medium };
  }

  if (fontWeight === "600" || fontWeight === "semibold") {
    return { fontFamily: AppFontFamilies.semiBold };
  }

  return { fontFamily: AppFontFamilies.regular };
};

// ── APP PALETTE ─────────────────────────────────────────────────────────────
// Shared design palette used directly by the app on both iOS and Android.

const palette = {
  // Neutrals
  gray: "#8C8C8C",
  gray2: "#ADADAD",
  gray3: "#C7C7C7",
  gray4: "#D1D1D1",
  gray5: "#E5E5E5",
  gray6: "#F2F2F2",

  // Semantic labels
  label: "#000000", // Primary text (light mode)
  labelDark: "#FAFAFA", // Primary text (dark mode) - hsl(0,0%,98%)
  secondaryLabel: "#3C3C3C",
  secondaryLabelDark: "#ADADAD", // hsl(0,0%,68%) - matches web muted-foreground
  tertiaryLabel: "#737373",
  tertiaryLabelDark: "#8C8C8C", // hsl(0,0%,55%) - mid grey, readable on elevated surfaces
  quaternaryLabel: "#A3A3A3",
  quaternaryLabelDark: "#6B6B6B", // hsl(0,0%,42%) - low-emphasis but visible on dark surfaces

  // Backgrounds
  systemBackground: "#FFFFFF",
  systemBackgroundDark: "#000000",
  secondarySystemBackground: "#F5F5F5",
  secondarySystemBackgroundDark: "#1A1A1A", // hsl(0,0%,10%) - matches web card
  tertiarySystemBackground: "#FFFFFF",
  tertiarySystemBackgroundDark: "#262626", // hsl(0,0%,15%) - matches web muted

  // Grouped backgrounds
  groupedBackground: "#F5F5F5",
  groupedBackgroundDark: "#000000",
  secondaryGroupedBackground: "#FFFFFF",
  secondaryGroupedBackgroundDark: "#1A1A1A",
  tertiaryGroupedBackground: "#F5F5F5",
  tertiaryGroupedBackgroundDark: "#262626",

  // Fills
  fill: "rgba(128,128,128,0.20)",
  fillDark: "rgba(128,128,128,0.36)",
  fill2: "rgba(128,128,128,0.16)",
  fill2Dark: "rgba(128,128,128,0.32)",
  fill3: "rgba(128,128,128,0.12)",
  fill3Dark: "rgba(128,128,128,0.24)",

  // Borders & separators
  separator: "rgba(0,0,0,0.10)",
  separatorDark: "rgba(255,255,255,0.10)",
  opaqueSeparator: "#E0E0E0",
  opaqueSeparatorDark: "#383838", // hsl(0,0%,22%) - matches web border

  // Accent colors
  blue: "#007AFF",
  blueDark: "#0A84FF",
  green: "#34C759",
  greenDark: "#30D158",
  indigo: "#5856D6",
  indigoDark: "#5E5CE6",
  orange: "#FF9500",
  orangeDark: "#FF9F0A",
  pink: "#FF2D55",
  pinkDark: "#FF375F",
  purple: "#AF52DE",
  purpleDark: "#BF5AF2",
  red: "#FF3B30",
  redDark: "#FF453A",
  teal: "#5AC8FA",
  tealDark: "#64D2FF",
  yellow: "#FFCC00",
  yellowDark: "#FFD60A",
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
  grid: string; // Section grid background — slightly deeper than surface so cards lift above it
  sheet: string; // Sheet/modal background (white in light, #1A1A1A in dark)
  sheetBorder: string; // Subtle dividers inside sheets
  sheetHandle: string; // Drag handle tint
  sheetSurface: string; // Secondary sheet surface for inset groups

  // Text/Labels
  label: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
  placeholder: string;
  sheetLabel: string; // Default sheet copy tone
  sheetLabelMuted: string; // Quiet supporting sheet copy

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
  star: string; // Rating stars
  amna: string; // AI/Amna purple
  amnaMuted: string; // AI/Amna purple background
  whatsapp: string; // WhatsApp brand
  info: string; // Info/blue-500 accent
  infoMuted: string; // Info background
}

/** Semantic color system — unified across iOS and Android */
export const Colors: { light: ColorPalette; dark: ColorPalette } = {
  light: {
    // ── Base ──────────────────────────────────────────────────────────────
    black: "#000000",
    white: "#FFFFFF",

    // ── Backgrounds (3-tier hierarchy) ────────────────────────────────────
    background: "#ffffff", // Creamy warm white page background
    backgroundSecondary: "#F7F7F7", // Softer secondary page tier
    backgroundTertiary: "#F1F1F1", // Third tier

    // ── Surfaces (for elevated/grouped content) ───────────────────────────
    surface: "#F0F0F0", // Light gray card — lifts above white bg
    surfaceSecondary: "#E8E8E8", // Deeper elevated tier
    surfaceTertiary: "#E0E0E0", // Soft tertiary surface
    grid: "#E9E9E9", // Section grid bg — slightly deeper than surface
    sheet: "#FFFFFF", // Apple HIG-style sheet base in light mode
    sheetBorder: "#E1E1E1", // Quiet sheet dividers
    sheetHandle: "#D2D2D2", // Subtle grabber tint
    sheetSurface: "#F7F7F7", // Inset rows/sections within sheets

    // ── Text/Labels (4-tier semantic hierarchy) ───────────────────────────
    label: "#050505", // Opposite of dark #FAFAFA
    labelSecondary: "#525252", // Opposite of dark #ADADAD
    labelTertiary: "#737373", // Opposite of dark #8C8C8C
    labelQuaternary: "#949494", // Opposite of dark #6B6B6B
    placeholder: "#737373", // Mirrors light tertiary label
    sheetLabel: "#050505", // Primary sheet text
    sheetLabelMuted: "#737373", // Muted sheet text

    // ── Borders & Separators ──────────────────────────────────────────────
    border: "rgba(0,0,0,0.10)", // Opposite of dark border
    separator: "#E1E1E1", // Softer light separator
    outline: "#D2D2D2", // Softer light outline

    // ── Fills (translucent overlays) ──────────────────────────────────────
    fill: "rgba(127,127,127,0.18)",
    fill2: "rgba(127,127,127,0.14)",
    fill3: "rgba(127,127,127,0.10)",

    // ── Accent/Primary (brand color) ──────────────────────────────────────
    primary: palette.blue, // Primary accent
    primaryForeground: "#FFFFFF", // Text on primary
    primaryMuted: "rgba(0,122,255,0.12)", // Subtle primary background

    // ── Semantic states ───────────────────────────────────────────────────
    success: palette.green, // Success state
    successMuted: "rgba(52,199,89,0.15)", // Success background
    warning: palette.orange, // Warning state
    warningMuted: "rgba(255,149,0,0.15)", // Warning background
    error: palette.red, // Error state
    errorMuted: "rgba(255,59,48,0.14)", // Error background

    // ── Additional semantic colors ────────────────────────────────────────
    link: palette.blue, // Hyperlinks
    overlay: "rgba(0,0,0,0.4)",
    skeleton: "#E6E6E6",

    // ── App-specific ──────────────────────────────────────────────────────
    favorite: palette.pink, // Favorite/like indicator

    // ── BLK tier badge (premium badge branding) ───────────────────────────
    blkBadgeBg: "rgba(0,0,0,0.88)", // Always-black premium badge
    blkBadgeBorder: "rgba(255,255,255,0.10)", // Soft light outline
    blkBadgeFg: "#FAFAFA", // Light foreground on black

    // ── Status indicators (online/presence) ───────────────────────────────
    online: palette.red, // Online indicator (red per brand)
    offline: palette.purple, // Offline/away indicator

    // ── Semantic accent colors ────────────────────────────────────────────
    star: "#FACC15", // Rating stars (amber)
    amna: "#8B5CF6", // AI/Amna purple
    amnaMuted: "rgba(139,92,246,0.15)", // AI/Amna purple background
    whatsapp: "#25D366", // WhatsApp brand green
    info: "#3B82F6", // Info/blue-500
    infoMuted: "rgba(59,130,246,0.12)", // Info background
  },
  dark: {
    // ── Base ──────────────────────────────────────────────────────────────
    black: "#000000",
    white: "#FFFFFF",

    // ── Backgrounds (3-tier hierarchy) ────────────────────────────────────
    background: palette.systemBackgroundDark, // Pure black (OLED)
    backgroundSecondary: palette.secondarySystemBackgroundDark, // Slightly elevated
    backgroundTertiary: palette.tertiarySystemBackgroundDark, // Third-level

    // ── Surfaces (for elevated/grouped content) ───────────────────────────
    surface: palette.secondarySystemBackgroundDark, // Default surface
    surfaceSecondary: palette.tertiarySystemBackgroundDark, // Elevated
    surfaceTertiary: "#333333", // Highest
    grid: "#141414", // Section grid bg — slightly deeper than surface
    sheet: palette.secondarySystemBackgroundDark, // Apple HIG-style sheet base (#1A1A1A)
    sheetBorder: palette.opaqueSeparatorDark, // Quiet sheet dividers
    sheetHandle: "#474747", // Subtle grabber tint
    sheetSurface: palette.tertiarySystemBackgroundDark, // Inset rows/sections within sheets

    // ── Text/Labels (4-tier semantic hierarchy) ───────────────────────────
    label: palette.labelDark, // Primary text (white)
    labelSecondary: palette.secondaryLabelDark, // Secondary
    labelTertiary: palette.tertiaryLabelDark, // Tertiary
    labelQuaternary: palette.quaternaryLabelDark, // Quaternary
    placeholder: palette.tertiaryLabelDark, // Placeholder
    sheetLabel: palette.labelDark, // Primary sheet text
    sheetLabelMuted: palette.tertiaryLabelDark, // Muted sheet text

    // ── Borders & Separators ──────────────────────────────────────────────
    border: palette.separatorDark,
    separator: palette.opaqueSeparatorDark,
    outline: "#474747",

    // ── Fills (translucent overlays) ──────────────────────────────────────
    fill: palette.fillDark,
    fill2: palette.fill2Dark,
    fill3: palette.fill3Dark,

    // ── Accent/Primary (brand color) ──────────────────────────────────────
    primary: palette.blueDark,
    primaryForeground: "#FFFFFF",
    primaryMuted: "rgba(10,132,255,0.18)",

    // ── Semantic states ───────────────────────────────────────────────────
    success: palette.greenDark,
    successMuted: "rgba(48,209,88,0.20)",
    warning: palette.orangeDark,
    warningMuted: "rgba(255,159,10,0.20)",
    error: palette.redDark,
    errorMuted: "rgba(255,69,58,0.22)",

    // ── Additional semantic colors ────────────────────────────────────────
    link: palette.blueDark,
    overlay: "rgba(0,0,0,0.7)",
    skeleton: "#333333", // subtle neutral on dark surfaces

    // ── App-specific ──────────────────────────────────────────────────────
    favorite: palette.pinkDark,

    // ── BLK tier badge (premium badge branding) ───────────────────────────
    blkBadgeBg: "rgba(0,0,0,0.92)", // Always-black premium badge
    blkBadgeBorder: "rgba(255,255,255,0.12)", // Soft light outline
    blkBadgeFg: "#FAFAFA", // Light foreground on black

    // ── Status indicators (online/presence) ───────────────────────────────
    online: palette.redDark,
    offline: palette.purpleDark,

    // ── Semantic accent colors ────────────────────────────────────────────
    star: "#FBBF24", // Rating stars (amber, slightly brighter for dark)
    amna: "#A78BFA", // AI/Amna purple (lighter for dark)
    amnaMuted: "rgba(167,139,250,0.20)", // AI/Amna purple background
    whatsapp: "#25D366", // WhatsApp brand green
    info: "#60A5FA", // Info/blue-400 (lighter for dark)
    infoMuted: "rgba(96,165,250,0.15)", // Info background
  },
};

export const Spacing = {
  none: 0,
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  "2xl": scale(24),
  "3xl": scale(32),
  "4xl": scale(40),
  "5xl": scale(48),
} as const;

export const Layout = {
  screenPadding: scale(16),
  tabBarHeight: scale(85),
  headerPadding: scale(8),
  headerGap: scale(8),
  topGradientExtension: scale(24),
  bottomGradientExtension: scale(30),
  hitTarget: scale(44),
  hitTargetSmall: scale(36),
  hitSlop: scale(10),
  hitSlopSmall: scale(8),
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
  iconXs: scale(14),
  iconSm: scale(18),
  iconMd: scale(22),
  iconLg: scale(24),
  iconXl: scale(28),
  avatarSm: scale(32),
  avatarMd: scale(40),
  avatarLg: scale(48),
  bubbleXs: scale(28),
  bubble: scale(36),
  bubbleMd: scale(42),
  pillHeight: scale(36),
  pillHeightMd: scale(42),
  pillRadius: scale(18),
  pillRadiusMd: scale(21),
  actionButtonSm: scale(36),
  actionButtonMd: scale(40),
  actionButtonLg: scale(48),
  cardThumbnailWidth: scale(160),
  cardThumbnailHeight: scale(140),
  badgePaddingH: scale(6),
  badgePaddingV: scale(3),
} as const;

export const Radius = {
  none: 0,
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  "2xl": scale(20),
  "3xl": scale(24),
  sheet: scale(40),
  circle: Sizes.avatarMd / 2,
  full: 9999,
} as const;

export const SheetSnapPoints = {
  peek: ["35%", "50%"],
  compact: ["40%", "60%"],
  detail: ["50%", "84%"],
  booking: ["50%", "91%"],
  standard: ["60%", "92%"],
  roomy: ["70%", "91%"],
  singlePeek: ["35%"],
  singleSm: ["40%"],
  singleMd: ["55%"],
  singleLg: ["72%"],
  singleXl: ["82%"],
} satisfies Record<string, (string | number)[]>;

export const Tracking = {
  tight: 0.3,
} as const;

/** Stacking layers — use instead of raw zIndex values */
export const ZIndex = {
  base: 0,
  raised: 10, // Floating elements above content (FAB, sticky headers)
  overlay: 20, // Headers, toolbars, overlaid UI
  modal: 100, // Sheets, modals, auth overlays
} as const;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────────────
// Unified Apple HIG-based typography for both iOS and Android.

const b: TextStyle = { includeFontPadding: false };
const bc: TextStyle = {
  includeFontPadding: false,
  textAlignVertical: "center",
};
const t = (
  fs: number,
  lh: number,
  fw: TextStyle["fontWeight"],
  x?: Partial<TextStyle>,
  androidLh = lh,
): TextStyle => ({
  ...b,
  fontSize: fontScale(fs),
  lineHeight: fontScale(Platform.OS === "android" ? androidLh : lh),
  ...getAppFontStyle(fw),
  ...x,
});
const tc = (
  fs: number,
  lh: number,
  fw: TextStyle["fontWeight"],
  x?: Partial<TextStyle>,
  androidLh = lh,
): TextStyle => ({
  ...bc,
  fontSize: fontScale(fs),
  lineHeight: fontScale(Platform.OS === "android" ? androidLh : lh),
  ...getAppFontStyle(fw),
  ...x,
});

const R7: TextStyle["fontWeight"] = "700";

// ── Apple HIG — Large (default) Dynamic Type ─────────────────────────────────
//   Plain variants = Semibold (our floor), Emphasized = Bold
const ios = {
  largeTitle: t(34, 41, "600"),
  largeTitleE: t(34, 41, "700"), // 34pt  Semibold / Bold
  title1: t(28, 34, "600"),
  title1E: t(28, 34, "700"), // 28pt  Semibold / Bold
  title2: t(22, 28, "600"),
  title2E: t(22, 28, "700"), // 22pt  Semibold / Bold
  title3: t(20, 25, "600"),
  title3E: t(20, 25, "700"), // 20pt  Semibold / Bold
  headline: t(17, 22, "600"), // 17pt  Semibold
  body: t(17, 22, "600"),
  bodyE: t(17, 22, "700"), // 17pt  Semibold / Bold
  callout: t(16, 21, "600"),
  calloutE: t(16, 21, "700"), // 16pt  Semibold / Bold
  subhead: t(15, 20, "600"),
  subheadE: t(15, 20, "700"), // 15pt  Semibold / Bold
  footnote: t(13, 18, "600"),
  footnoteE: t(13, 18, "700"), // 13pt  Semibold / Bold
  caption1: t(12, 16, "600"),
  caption1E: t(12, 16, "700"), // 12pt  Semibold / Bold
  caption2: t(11, 13, "600"),
  caption2E: t(11, 13, "700"), // 11pt  Semibold / Bold
} as const;

export const Typography = {
  largeTitle: ios.largeTitle,
  largeTitleEmphasized: ios.largeTitleE,
  title1: ios.title1,
  title1Emphasized: ios.title1E,
  title2: ios.title2,
  title2Emphasized: ios.title2E,
  title3: ios.title3,
  title3Emphasized: ios.title3E,
  headline: ios.headline,
  body: ios.body,
  bodyEmphasized: ios.bodyE,
  callout: ios.callout,
  calloutEmphasized: ios.calloutE,
  subhead: ios.subhead,
  subheadEmphasized: ios.subheadE,
  footnote: ios.footnote,
  footnoteEmphasized: tc(13, 18, R7, { letterSpacing: 0.8 }),
  caption1: ios.caption1,
  caption1Emphasized: tc(12, 16, R7, { letterSpacing: 0.5 }),
  caption2: ios.caption2,
  caption2Emphasized: ios.caption2E,
} as const;

export const SheetTypography = {
  headerAction: "subhead",
  headerTitle: "subheadEmphasized",
  rowLabel: "subhead",
  rowLabelSelected: "subheadEmphasized",
  supporting: "footnote",
  supportingEmphasized: "footnoteEmphasized",
} as const;

export const SheetChrome = {
  radius: Radius.sheet,
  handleWidth: Sizes.bubble,
  handleHeight: Spacing.xs,
  contentPaddingHorizontal: Spacing.lg,
  contentPaddingTop: Spacing.md,
  headerPaddingBottom: Spacing.md,
  headerMarginBottom: Spacing.md,
  rowGap: Spacing.xs,
  rowPaddingHorizontal: Spacing.md,
  rowPaddingVertical: Spacing.md,
  headerActionPaddingHorizontal: Spacing.sm,
  headerActionPaddingVertical: Spacing.xs,
  headerPlaceholderWidth: Spacing.xl * 3,
  // Android native sheets sit closer to the system nav area, so give them
  // extra bottom breathing room across every sheet surface.
  bottomSafeAreaSpacing:
    Platform.OS === "android" ? Spacing["5xl"] : Spacing["3xl"],
} as const;

export const InputTypography: TextStyle = {
  ...Typography.body,
  fontFamily: AppFontFamilies.regular,
};

// ── Raw type scales (for direct use) ────────────────────────────────────────
export const IosTypeScale = ios;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(1, 0.45) },
    shadowOpacity: 0.05,
    shadowRadius: scale(2, 0.45),
    elevation: scale(1, 0.35),
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(2, 0.45) },
    shadowOpacity: 0.08,
    shadowRadius: scale(4, 0.45),
    elevation: scale(2, 0.35),
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4, 0.45) },
    shadowOpacity: 0.12,
    shadowRadius: scale(8, 0.45),
    elevation: scale(4, 0.35),
  },
} as const;

export const BrandColors = {
  googleBlue: "#4285F4",
  googleGreen: "#34A853",
  googleYellow: "#FBBC05",
  googleRed: "#EA4335",
} as const;

export const ConfettiPalettes = {
  favorite: ["#F43F5E", "#FB7185", "#FF8FA3", "#FF2D55", "#FCA5A5", "#FE6D73"],
  superlike: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#F97316", "#FB923C"],
} as const;

export const VehicleColorSwatches = {
  exterior: {
    white: "#FFFFFF",
    black: "#000000",
    silver: "#C0C0C0",
    grey: "#808080",
    blue: "#0066CC",
    red: "#CC0000",
    green: "#228B22",
    brown: "#8B4513",
    beige: "#F5F5DC",
    gold: "#FFD700",
    orange: "#FF8C00",
    yellow: "#FFD700",
    purple: "#800080",
    other: "#CCCCCC",
  },
  interior: {
    black: "#1A1A1A",
    beige: "#F5F5DC",
    brown: "#8B4513",
    tan: "#D2B48C",
    grey: "#808080",
    white: "#F5F5F5",
    red: "#8B0000",
    burgundy: "#800020",
    other: "#CCCCCC",
  },
} as const;

// ── Type exports ────────────────────────────────────────────────────────────
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = ColorPalette;

/** iOS system grays — neutral scale aligned with our shared surface tiers
 *  Light values: original HIG, all hsl(0,0%,N%)
 *  Dark values:  inverted to match our established neutral dark scale */
export const SystemGrays = {
  gray: palette.gray,
  grayDark: palette.quaternaryLabelDark, // #595959 — hsl(0,0%,35%)
  gray2: palette.gray2,
  gray2Dark: "#474747", // hsl(0,0%,28%)
  gray3: palette.gray3,
  gray3Dark: palette.opaqueSeparatorDark, // #383838 — hsl(0,0%,22%)
  gray4: palette.gray4,
  gray4Dark: "#333333", // hsl(0,0%,20%)
  gray5: palette.gray5,
  gray5Dark: palette.tertiarySystemBackgroundDark, // #262626 — hsl(0,0%,15%)
  gray6: palette.gray6,
  gray6Dark: palette.secondarySystemBackgroundDark, // #1A1A1A — hsl(0,0%,10%)
} as const;
