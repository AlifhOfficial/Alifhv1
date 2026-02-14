/**
 * Boot Logo - Clean Revvup Wordmark
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Simple text-based wordmark using Inter ExtraBold.
 * Font is pre-bundled via expo-font plugin - loads instantly with the binary.
 * No async loading required. Black OLED background + white text.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface BootLogoProps {
  /** Override text color (default: white) */
  color?: string;
}

export function BootLogo({ color = '#FFFFFF' }: BootLogoProps) {
  return (
    <Text style={[styles.wordmark, { color }]}>
      Revvup
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 48,
    letterSpacing: -1.5,
    // Inter ExtraBold - pre-bundled via expo-font plugin (instant load)
    fontFamily: 'Inter-ExtraBold',
  },
});

export default BootLogo;
