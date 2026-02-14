/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopSafeAreaGradient } from '@/components/layout';

import {
  HomeHeader,
  BlkGridCard,
  RevvupFirstGrid,
  CategoryGrid,
  PartnerGrid,
  ShowroomsShowcaseGrid,
} from '@/components/home';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout, Sizes } from '@/constants/theme';

// ============================================================================
// HOME SCREEN
// ============================================================================

// Header height calculation: safeArea + headerPadding + bubble height + bottom padding
const HEADER_HEIGHT = Layout.headerPadding + Sizes.bubble + Spacing.md;

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // Dynamic top padding based on safe area + header
  const contentTopPadding = insets.top + HEADER_HEIGHT + Spacing.md;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopSafeAreaGradient />
      <HomeHeader />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: contentTopPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid 1: BLK Signature Collection */}
        <BlkGridCard />

        {/* Grid 2: Revvup First - Founding Partners */}
        <RevvupFirstGrid />

        {/* Sequence 1 */}
        <CategoryGrid limit={1} offset={0} />
        <PartnerGrid limit={1} offset={0} />
        <ShowroomsShowcaseGrid limit={1} offset={0} />

        {/* Sequence 2 */}
        <CategoryGrid limit={1} offset={1} />
        <PartnerGrid limit={1} offset={1} />
        <ShowroomsShowcaseGrid limit={1} offset={1} />

        {/* Sequence 3 */}
        <CategoryGrid limit={1} offset={2} />
        <PartnerGrid limit={1} offset={2} />
        <ShowroomsShowcaseGrid limit={1} offset={2} />

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingTop is set dynamically based on safe area
    gap: Spacing.lg,
  },
  bottomSpacer: {
    height: Layout.tabBarHeight + Spacing['3xl'],
  },
});
