/**
 * Loader Types
 */

import { Spacing, Sizes, Colors } from '@/constants/theme';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'primary' | 'secondary' | 'white' | 'dark' | 'muted';

export interface LoaderProps {
  size?: LoaderSize;
  color?: string;
  variant?: LoaderVariant;
}

export const LOADER_SIZES: Record<LoaderSize, number> = {
  xs: Spacing.lg,
  sm: Spacing['2xl'],
  md: Sizes.bubble,
  lg: Sizes.avatarLg,
  xl: Sizes.avatarLg + Spacing.lg,
};

export const LOADER_COLORS = {
  light: {
    primary: Colors.light.primary,
    secondary: Colors.light.amna,
    white: Colors.light.white,
    dark: Colors.light.label,
    muted: Colors.light.labelTertiary,
  },
  dark: {
    primary: Colors.dark.primary,
    secondary: Colors.dark.amna,
    white: Colors.dark.white,
    dark: Colors.dark.label,
    muted: Colors.dark.labelTertiary,
  },
};
