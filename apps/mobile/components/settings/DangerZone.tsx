/**
 * Danger Zone Component
 * Account deletion section - matches Profile SignOutButton styling
 */

import React from 'react';
import { StyleSheet, Text, Pressable, Platform } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/constants/theme';
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
      <Pressable
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
        <Text style={[styles.text, { color: colors.error }]}>Delete Account</Text>
      </Pressable>
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
  text: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
  },
});
