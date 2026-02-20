/**
 * Bottom Safe Area Gradient
 * Linear gradient overlay for bottom safe area extending up to tab bar
 * Matches the top safe area vignette style
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Layout } from '@/constants/theme';

// Paths where the global bottom gradient should NOT render (they have their own)
const HIDE_GRADIENT_PATHS = ['/blk'];

/** Convert a hex color (#RGB or #RRGGBB) to rgba() with the given opacity */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.substring(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.substring(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BottomSafeAreaGradient() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const colors = Colors[colorScheme];

  // Hide on screens that have their own bottom gradient
  if (HIDE_GRADIENT_PATHS.includes(pathname)) {
    return null;
  }

  // Use rgba colors for consistent gradient rendering on both Android and iOS
  const isLightMode = colorScheme === 'light';
  const gradientColors = useMemo((): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    const bg = colors.background;
    return isLightMode ? [
      hexToRgba(bg, 0),
      hexToRgba(bg, 0.15),
      hexToRgba(bg, 0.4),
      hexToRgba(bg, 0.7),
      hexToRgba(bg, 0.9),
    ] as const : [
      hexToRgba(bg, 0),
      hexToRgba(bg, 0.3),
      hexToRgba(bg, 0.6),
      hexToRgba(bg, 0.85),
      hexToRgba(bg, 1),
    ] as const;
  }, [colors.background, isLightMode]);

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.15, 0.4, 0.7, 1]}
        style={[styles.gradient, { height: insets.bottom + Layout.bottomGradientExtension }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  gradient: {
    width: '100%',
  },
});
