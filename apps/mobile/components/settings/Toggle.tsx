/**
 * Toggle Component
 * iOS-style toggle switch
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import type { ThemeColors } from './types';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  colors: ThemeColors;
}

export function Toggle({ enabled, onToggle, disabled, colors }: ToggleProps) {
  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle();
  };

  return (
    <HapticPressable
      onPress={handleToggle}
      disabled={disabled}
      style={[
        styles.toggle,
        { backgroundColor: enabled ? colors.success : colors.surfaceSecondary },
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[styles.knob, { backgroundColor: colors.surface }, { transform: [{ translateX: enabled ? 20 : 2 }] }]}
      />
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
});
