/**
 * Home Tab Screen
 * 
 * Shows greeting and quick actions.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions } from 'react-native';

import {
  GreetingNote,
  QuickActions,
  UserDashboardStatsCard,
} from '@/components/home';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { useUserDashboardStats } from '@/hooks/use-user-dashboard';

// ============================================================================
// CONSTANTS
// ============================================================================

// Ghost spacer height — breathing room above the greeting
const GHOST_SPACER_HEIGHT = Dimensions.get('window').height * 0.15;

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [refreshing, setRefreshing] = useState(false);
  const { stats, isLoading, refresh } = useUserDashboardStats();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.label}
        />
      }
    >
      <View style={styles.ghostSpacer} />
      <View style={styles.greetingContainer}>
        <GreetingNote />
      </View>
      <QuickActions />
      <UserDashboardStatsCard stats={stats} isLoading={isLoading} />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  scrollContent: {
    gap: Spacing.lg,
  },
  ghostSpacer: {
    height: GHOST_SPACER_HEIGHT,
  },
  greetingContainer: {
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Layout.tabBarHeight + Spacing['3xl'],
  },
});
