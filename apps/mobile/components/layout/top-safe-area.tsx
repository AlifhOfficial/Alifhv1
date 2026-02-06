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

export function TopSafeAreaGradient() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  if (insets.top <= 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[
          isDark ? '#0D0D0D' : '#FAFAFA',
          isDark ? 'rgba(13,13,13,0)' : 'rgba(250,250,250,0)',
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
