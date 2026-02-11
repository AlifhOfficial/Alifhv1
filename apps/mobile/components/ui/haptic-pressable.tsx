/**
 * HapticPressable - Pressable with built-in haptic feedback
 * 
 * Drop-in replacement for Pressable that provides haptic feedback on press.
 * Use this instead of Pressable for consistent tactile feedback across the app.
 */

import React, { useCallback } from 'react';
import { Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'none';

export interface HapticPressableProps extends PressableProps {
  /** Type of haptic feedback. Defaults to 'light' */
  haptic?: HapticType;
}

const triggerHaptic = (type: HapticType) => {
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'selection':
      Haptics.selectionAsync();
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'none':
      // No haptic
      break;
  }
};

export function HapticPressable({ 
  haptic = 'light', 
  onPress, 
  children, 
  ...props 
}: HapticPressableProps) {
  const handlePress = useCallback((event: any) => {
    triggerHaptic(haptic);
    onPress?.(event);
  }, [haptic, onPress]);

  return (
    <Pressable 
      onPress={handlePress}
      {...props}
    >
      {children}
    </Pressable>
  );
}
