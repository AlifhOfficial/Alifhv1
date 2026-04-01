import React, { useCallback } from 'react';
import { Platform, RefreshControl, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export interface HapticRefreshControlProps extends RefreshControlProps {
  /** Disable haptic feedback for this refresh control instance */
  disableHaptics?: boolean;
}

export function HapticRefreshControl({
  onRefresh,
  disableHaptics = false,
  tintColor,
  colors,
  progressBackgroundColor,
  progressViewOffset,
  ...props
}: HapticRefreshControlProps) {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handleRefresh = useCallback(() => {
    if (!disableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRefresh?.();
  }, [disableHaptics, onRefresh]);

  return (
    <RefreshControl
      {...props}
      onRefresh={handleRefresh}
      tintColor={tintColor ?? themeColors.labelSecondary}
      colors={colors ?? [themeColors.labelSecondary]}
      progressBackgroundColor={progressBackgroundColor ?? themeColors.background}
      progressViewOffset={progressViewOffset ?? (Platform.OS === 'ios' ? insets.top + Spacing['5xl'] : 0)}
    />
  );
}
