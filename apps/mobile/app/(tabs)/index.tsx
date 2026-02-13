/**
 * Home Tab Screen
 * 
 * Features:
 * - Persistent header with gradient
 * - Bookings quick-access card
 * - Lazy-loaded widget feed (German, Dealer, Hot, New, etc.)
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopSafeAreaGradient } from '@/components/layout';

import { HomeHeader, HomeWidgetsFeed } from '@/components/home';
import { Layout, Spacing } from '@/constants/theme';

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const topInset = insets.top + Layout.headerPadding + Layout.hitTarget + Spacing.md + Spacing.md;
  const bottomInset = insets.bottom + Layout.tabBarHeight;

  return (
    <View style={styles.container}>
      <TopSafeAreaGradient />
      <HomeHeader />
      <HomeWidgetsFeed
        topInset={topInset}
        bottomInset={bottomInset}
      />
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
