/**
 * Profile Colors Hook
 */

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import type { ThemeColors } from '../types';

export function useProfileColors(): ThemeColors {
  const { colorScheme } = useTheme();
  return Colors[colorScheme];
}
