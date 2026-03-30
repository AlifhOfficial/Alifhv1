/**
 * Danger Zone Component
 * Account deletion section - matches Profile SignOutButton styling
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from './types';

interface DangerZoneProps {
  colors: ThemeColors;
  onDeletePress: () => void;
  delay?: number;
}

export function DangerZone({
  colors,
  onDeletePress,
  delay = 300,
}: DangerZoneProps) {
  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDeletePress();
  };

  return (
    <HapticPressable
      onPress={handlePress}
      style={[
        styles.button,
        { backgroundColor: colors.surface },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Delete account"
    >
      <Text variant="body" style={{ color: colors.error }}>Delete Account</Text>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing['3xl'],
  },
});
