/**
 * Custom Bootup Screen - Branded loading screen for app startup
 * Replaces native splash screen with consistent UX across iOS and Android
 * Shows while app initializes (fonts, auth, theme, etc.)
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface CustomBootupScreenProps {
  isVisible: boolean;
  onHide?: () => void;
}

export function CustomBootupScreen({ isVisible }: CustomBootupScreenProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
      pointerEvents="none"
    >
      {/* Background */}
      <View style={styles.background} />

      {/* Wordmark Logo */}
      <Image
        source={require('@/assets/images/Revvup-wordmark-white.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.black,
  },
  logo: {
    width: 220,
    height: undefined,
    aspectRatio: 1656 / 600,
  },
});

