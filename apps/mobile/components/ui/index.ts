// UI components
export { IconSymbol, type IconSymbolName } from './icon-symbol';
export { ThemeToggle } from './theme-toggle';
export { UserAvatar } from './user-avatar';
export { BrandAvatar, type BrandAvatarProps, type BrandAvatarSize, type BrandAvatarShape } from './brand-avatar';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonImage } from './skeleton';

// Button component
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button';

// HapticPressable - Pressable with haptic feedback
export { HapticPressable, type HapticPressableProps, type HapticType } from './haptic-pressable';
export { Bubble, Pill, EdgeFade } from './chrome';

// Loader exports
export { Loader, SpinnerLoader, LogoLoader, RefreshLoader } from './loader';
export {
  PulseLoader,
  SpinLoader,
  BreatheLoader,
  GlowLoader,
  ButtonLoader,
  InlineLoader,
  FullScreenLoader,
  SkeletonLoader,
  type LoaderSize,
  type LoaderVariant,
} from './loaders';


// Confetti burst effect
export {
  ConfettiBurst,
  useConfettiBurst,
  FAVORITE_COLORS,
  SUPERLIKE_COLORS,
  type ConfettiBurstRef,
  type ConfettiBurstOptions,
} from './confetti-burst';

// Favorite/Superlike action components
export {
  useFavoriteActions,
  FavoriteButton,
  SuperlikeButton,
  type UseFavoriteActionsOptions,
  type FavoriteButtonProps,
  type SuperlikeButtonProps,
} from './favorite-actions';

// Typography component (with font scaling disabled)
export { Text, type TextProps } from './text';

// Error handling
export { ErrorBoundary } from './error-boundary';

// Network status
export { OfflineBanner } from './offline-banner';

// Auth Required Empty State
export { AuthRequiredEmptyState, type AuthRequiredEmptyStateProps } from './auth-required-empty-state';

// Themed Alert (Android-compatible)
export { AlertProvider, useAlert } from './themed-alert';
