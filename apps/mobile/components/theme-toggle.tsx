/**
 * Theme Toggle Button for Header
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.7 : 1 }
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconSymbol 
        name={colorScheme === 'dark' ? 'moon.fill' : 'sun.max.fill'} 
        size={22} 
        color={colors.text} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
});
