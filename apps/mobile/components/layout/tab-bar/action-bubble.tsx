/**
 * ActionBubble - Generic action button bubble with micro-animation
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';

const GAP = Spacing.sm;

interface ActionBubbleProps {
  icon: LucideIcon;
  onPress: () => void;
  iconColor?: string;
  marginLeft?: boolean;
}

export function ActionBubble({ icon: Icon, onPress, iconColor, marginLeft }: ActionBubbleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <MotiPressable
      onPress={handlePress}
      animate={({ pressed }) => {
        'worklet';
        return {
          scale: pressed ? 0.92 : 1,
        };
      }}
      transition={{
        type: 'timing',
        duration: 120,
      }}
      style={[
        styles.bubble,
        styles.glass,
        {
          borderColor: colors.glassBorder,
          backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
          marginLeft: marginLeft ? GAP : 0,
        },
      ]}
    >
      <Icon
        size={Sizes.iconMd}
        color={iconColor || colors.text}
        strokeWidth={2}
      />
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
});
