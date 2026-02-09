// UI components
export { IconSymbol, type IconSymbolName } from './icon-symbol';
export { ThemeToggle } from './theme-toggle';
export { UserAvatar } from './user-avatar';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonImage } from './skeleton';

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
