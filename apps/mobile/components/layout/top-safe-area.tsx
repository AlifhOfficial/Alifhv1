/**
 * Top Safe Area Gradient
 * Linear gradient overlay for top safe area (notch/dynamic island area)
 * Matches the bottom safe area vignette style from tab-bar
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Layout } from '@/constants/theme';

/** Convert a hex color (#RGB or #RRGGBB) to rgba() with the given opacity */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.substring(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.substring(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface TopSafeAreaGradientProps {
  /** Use OLED colors (pure black/white) instead of theme background */
  useOled?: boolean;
}

export function TopSafeAreaGradient({ useOled = false }: TopSafeAreaGradientProps = {}) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];

  if (insets.top <= 0) return null;

  // Use rgba colors for consistent gradient rendering on both Android and iOS
  const isLightMode = colorScheme === 'light';
  const gradientColors = useMemo((): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    const bg = useOled ? (isLightMode ? colors.oledWhite : colors.oledBlack) : colors.background;
    return isLightMode ? [
      hexToRgba(bg, 0.9),
      hexToRgba(bg, 0.7),
      hexToRgba(bg, 0.4),
      hexToRgba(bg, 0.15),
      hexToRgba(bg, 0),
    ] as const : [
      hexToRgba(bg, 1),
      hexToRgba(bg, 0.85),
      hexToRgba(bg, 0.6),
      hexToRgba(bg, 0.3),
      hexToRgba(bg, 0),
    ] as const;
  }, [colors.background, colors.oledWhite, colors.oledBlack, isLightMode, useOled]);

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={[styles.gradient, { height: insets.top + Layout.topGradientExtension }]}
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
