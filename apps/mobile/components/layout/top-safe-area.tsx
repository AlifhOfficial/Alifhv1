/**
 * Top Safe Area Gradient
 * Linear gradient overlay for top safe area (notch/dynamic island area)
 * Matches the bottom safe area vignette style from tab-bar
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export function TopSafeAreaGradient() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  if (insets.top <= 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[
          colors.background,
          isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
        ]}
        style={[styles.gradient, { height: insets.top + 16 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradient: {
    width: '100%',
  },
});
