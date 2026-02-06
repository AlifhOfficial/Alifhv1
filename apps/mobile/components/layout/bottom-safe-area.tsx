/**
 * Bottom Safe Area Gradient
 * Linear gradient overlay for bottom safe area extending up to tab bar
 * Matches the top safe area vignette style
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/context/theme-context';

export function BottomSafeAreaGradient() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[
          isDark ? 'rgba(13,13,13,0)' : 'rgba(250,250,250,0)',
          isDark ? '#0D0D0D' : '#FAFAFA',
        ]}
        style={[styles.gradient, { height: insets.bottom + 70 }]}
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
    zIndex: 10,
  },
  gradient: {
    width: '100%',
  },
});
