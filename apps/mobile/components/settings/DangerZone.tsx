/**
 * Danger Zone Component
 * Account deletion section - matches Profile SignOutButton styling
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Layout, Sizes, Spacing, Radius } from '@/constants/theme';
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
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <HapticPressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.surface,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Trash2 size={Sizes.iconSm} color={colors.error} strokeWidth={2} />
        <Text variant="body" tone="error">Delete Account</Text>
      </HapticPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    marginTop: Spacing.md,
    marginBottom: Layout.tabBarHeight + Spacing['3xl'],
  },
});
