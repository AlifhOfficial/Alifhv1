/**
 * Boot Logo - Clean Revvup Wordmark
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Simple text-based wordmark using Geom Black (900 weight).
 * Font loaded at runtime via useFonts hook.
 * Falls back to system font while loading. Black OLED background + white text.
 * 
 * Scales proportionally based on screen size (iPhone 15 Pro Max as reference).
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';

// iPhone 15 Pro Max reference dimensions (design baseline)
const REFERENCE_WIDTH = 430;

// Base font size at reference width
const BASE_FONT_SIZE = 64;
const BASE_LETTER_SPACING = -2;

// Get current screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale factor relative to iPhone 15 Pro Max
// Clamp between 0.75 and 1.15 to prevent extremes on very small/large devices
const SCALE = Math.min(1.15, Math.max(0.75, SCREEN_WIDTH / REFERENCE_WIDTH));

interface BootLogoProps {
  /** Override text color (default: white) */
  color?: string;
}

export function BootLogo({ color = '#FFFFFF' }: BootLogoProps) {
  const [fontsLoaded] = useFonts({
    'Geom-Black': require('@/assets/fonts/Geom/static/Geom-Black.ttf'),
  });

  return (
    <Text style={[styles.wordmark, { color }, !fontsLoaded && styles.fallback]}>
      Revvup
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: BASE_FONT_SIZE * SCALE,
    letterSpacing: BASE_LETTER_SPACING * SCALE,
    // Geom Black 900 - loaded at runtime
    fontFamily: 'Geom-Black',
  },
  fallback: {
    // System font fallback while Geom loads
    fontFamily: undefined,
    fontWeight: '900',
  },
});

export default BootLogo;
