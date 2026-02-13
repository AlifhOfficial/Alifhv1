/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TopSafeAreaGradient } from '@/components/layout';

import { HomeHeader } from '@/components/home';

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
