/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TopSafeAreaGradient } from '@/components/layout';

import { HomeHeader } from '@/components/home';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopSafeAreaGradient />
      <HomeHeader />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
