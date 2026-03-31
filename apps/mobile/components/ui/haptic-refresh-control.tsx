import React, { useCallback } from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface HapticRefreshControlProps extends RefreshControlProps {
  /** Disable haptic feedback for this refresh control instance */
  disableHaptics?: boolean;
}

export function HapticRefreshControl({
  onRefresh,
  disableHaptics = false,
  ...props
}: HapticRefreshControlProps) {
  const handleRefresh = useCallback(() => {
    if (!disableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRefresh?.();
  }, [disableHaptics, onRefresh]);

  return <RefreshControl {...props} onRefresh={handleRefresh} />;
}
