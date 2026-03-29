/**
 * Toggle Component
 * iOS-style toggle switch
 */

import { HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Radius, Sizes, Spacing } from '@/constants/theme';
import type { ThemeColors } from './types';

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  colors: ThemeColors;
}

// Toggle dimensions
const TOGGLE_WIDTH = Sizes.actionButtonMd + Spacing.xs;
const TOGGLE_HEIGHT = Spacing['2xl'];
const KNOB_SIZE = Spacing.xl;
const KNOB_TRAVEL = TOGGLE_WIDTH - KNOB_SIZE - Spacing.xs;

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
        style={[styles.knob, { backgroundColor: colors.surface }, { transform: [{ translateX: enabled ? KNOB_TRAVEL : Sizes.badgePaddingV }] }]}
      />
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: Radius.lg,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: Radius.lg,
  },
  disabled: {
    opacity: 0.6,
  },
});
