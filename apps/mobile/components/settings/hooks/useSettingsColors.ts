/**
 * Settings Colors Hook
 */

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';
import type { ThemeColors } from '../types';

export function useSettingsColors(): ThemeColors {
  const { colorScheme } = useTheme();
  const baseColors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return {
    ...baseColors,
    isDark,
  };
}
