/**
 * Top Safe Area Gradient
 * Linear gradient overlay for top safe area (notch/dynamic island area)
 * Matches the bottom safe area vignette style from tab-bar
 */

import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

/** Convert a hex color (#RGB or #RRGGBB) to rgba() with the given opacity */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.substring(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.substring(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function TopSafeAreaGradient() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];

  if (insets.top <= 0) return null;

  // Android doesn't interpolate hex alpha correctly — use rgba with multiple stops
  const gradientColors = useMemo(() => {
    const bg = colors.background;
    if (Platform.OS === 'android') {
      return [
        hexToRgba(bg, 1),
        hexToRgba(bg, 0.95),
        hexToRgba(bg, 0.8),
        hexToRgba(bg, 0.5),
        hexToRgba(bg, 0.2),
        hexToRgba(bg, 0),
      ] as const;
    }
    return [bg, hexToRgba(bg, 0.6), `${bg}00`] as const;
  }, [colors.background]);

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={gradientColors as unknown as string[]}
        {...(Platform.OS === 'android' && { locations: [0, 0.2, 0.4, 0.6, 0.8, 1] })}
        {...(Platform.OS === 'ios' && { locations: [0, 0.5, 1] })}
        style={[styles.gradient, { height: insets.top + 40 }]}
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
