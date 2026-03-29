import React from 'react';
import {
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Radius, Shadows, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, type HapticPressableProps } from './haptic-pressable';

type BubbleSize = 'sm' | 'md' | 'lg';
type BubbleTone = 'surface' | 'accent';

interface BubbleProps extends Omit<HapticPressableProps, 'style'> {
  size?: BubbleSize;
  tone?: BubbleTone;
  style?: StyleProp<ViewStyle>;
}

interface PillProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface EdgeFadeProps {
  edge: 'top' | 'bottom';
  height: number;
  style?: StyleProp<ViewStyle>;
}

const BUBBLE_SIZE_MAP = {
  sm: Sizes.actionButtonSm,
  md: Sizes.actionButtonMd,
  lg: Sizes.actionButtonLg,
} as const;

export function Bubble({
  children,
  size = 'md',
  tone = 'surface',
  style,
  ...pressableProps
}: BubbleProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const bubbleSize = BUBBLE_SIZE_MAP[size];
  const isAccent = tone === 'accent';

  return (
    <HapticPressable
      style={({ pressed }: PressableStateCallbackType) => [
        styles.bubble,
        {
          width: bubbleSize,
          height: bubbleSize,
          backgroundColor: isAccent ? colors.label : colors.surfaceSecondary,
          borderColor: isAccent ? colors.label : colors.outline,
          ...Shadows.md,
          shadowColor: colors.black,
          shadowOpacity: isAccent ? 0 : Shadows.md.shadowOpacity,
          elevation: isAccent ? 0 : Shadows.md.elevation,
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...pressableProps}
    >
      {children}
    </HapticPressable>
  );
}

export function Pill({ children, style }: PillProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.background,
          borderColor: colors.outline,
          ...Shadows.lg,
          shadowColor: colors.black,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function EdgeFade({ edge, height, style }: EdgeFadeProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const isTop = edge === 'top';

  return (
    <LinearGradient
      pointerEvents="none"
      colors={
        isTop
          ? [
              colors.background,
              'transparent',
            ]
          : [
              colors.background,
              'transparent',
            ]
      }
      locations={[0, 1]}
      start={{ x: 0, y: isTop ? 0 : 1 }}
      end={{ x: 0, y: isTop ? 1 : 0 }}
      style={[
        styles.fade,
        isTop ? styles.fadeTop : styles.fadeBottom,
        { height },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: Radius.circle,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
});
