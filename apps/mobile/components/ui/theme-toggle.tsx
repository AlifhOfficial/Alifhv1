/**
 * Theme Toggle Button for Header
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { HapticPressable } from './haptic-pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { Colors, Layout, Sizes, Spacing, Radius } from '@/constants/theme';

export function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <HapticPressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1 
        }
      ]}
      hitSlop={Layout.hitSlop}
    >
      <IconSymbol 
        name={colorScheme === 'dark' ? 'moon.fill' : 'sun.max.fill'} 
        size={Sizes.iconMd} 
        color={colors.iconMuted} 
      />
    </HapticPressable>
  );
}

const BUTTON_SIZE = Sizes.actionButtonLg + Spacing.xs; // 52

const styles = StyleSheet.create({
  button: {
    padding: Spacing.sm - 2,
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
