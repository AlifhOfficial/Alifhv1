/**
 * Loader Types
 */

import { Spacing, Sizes } from '@/constants/theme';

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
    primary: '#0066FF',
    secondary: '#6366F1',
    white: '#FFFFFF',
    dark: '#18181B',
    muted: '#71717A',
  },
  dark: {
    primary: '#3B82F6',
    secondary: '#818CF8',
    white: '#FFFFFF',
    dark: '#FAFAFA',
    muted: '#A1A1AA',
  },
};
