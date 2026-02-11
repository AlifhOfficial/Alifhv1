/**
 * Danger Zone Component
 * Account deletion section - matches Profile SignOutButton styling
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ButtonText } from '@/components/ui';
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
        <Trash2 size={18} color={colors.error} strokeWidth={2} />
        <ButtonText size="medium" tone="error">Delete Account</ButtonText>
      </HapticPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 120,
  },
});
