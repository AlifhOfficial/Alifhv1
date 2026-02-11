// UI components
export { IconSymbol, type IconSymbolName } from './icon-symbol';
export { ThemeToggle } from './theme-toggle';
export { UserAvatar } from './user-avatar';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonImage } from './skeleton';

// Button component
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button';

// HapticPressable - Pressable with haptic feedback
export { HapticPressable, type HapticPressableProps, type HapticType } from './haptic-pressable';

// Legacy loader exports (for backwards compatibility)
export { Loader, SpinnerLoader, LogoLoader, RefreshLoader } from './loader';

// Premium Loaders
export {
  // Brand logo components
  RevvupLogo,
  RevvupLogoAnimated,
  // Spinner variations
  PulseLoader,
  SpinLoader,
  BreatheLoader,
  GlowLoader,
  ButtonLoader,
  InlineLoader,
  FullScreenLoader,
  SkeletonLoader,
  // Logo-based spinners
  LogoSpinner,
  LogoPulse,
  LogoOrbit,
  // Types
  type LoaderSize,
  type LoaderVariant,
} from './loaders';

// Premium Backgrounds (Skia GPU-accelerated)
export {
  PremiumBackground,
  MeshBG,
  RadialBG,
  AuroraBG,
  NoiseBG,
  ACCENT_PALETTES,
  type PremiumBackgroundProps,
  type BackgroundVariant,
  type AccentPalette,
} from './premium-background';

// Typography components (with font scaling disabled)
export {
  Text,
  Display,
  Heading,
  Body,
  Data,
  Label,
  Supporting,
  ButtonText,
  Price,
  type TextProps,
  type DisplayProps,
  type HeadingProps,
  type BodyProps,
  type DataProps,
  type LabelProps,
  type SupportingProps,
  type ButtonTextProps,
  type PriceProps,
} from './text';
