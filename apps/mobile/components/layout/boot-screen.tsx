/**
 * Boot Screen
 * Full-screen branded boot-up state - Revolut-style minimal design
 * 
 * IMPORTANT: This screen renders BEFORE providers/fonts are loaded.
 * Uses system font for instant, consistent rendering.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { BootLogo } from './boot-logo';

// Pure black OLED background
const BOOT_BG = '#000000';

export function BootScreen() {
  return (
    <View style={styles.container}>
      <BootLogo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOOT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
