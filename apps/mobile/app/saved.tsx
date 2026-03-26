/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Skeleton, AuthRequiredEmptyState } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import {
  SavedHeader,
  SavedList,
} from '@/components/saved';
import { useSaved } from '@/hooks/use-saved';
import { consumeDataReady, scheduleRenderPerf } from '@/lib/config';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SavedScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Account for absolute header: safe area + headerPadding + pill height + bottom padding
  const contentTopPadding = insets.top + Layout.headerPadding + Sizes.pillHeight + Spacing.md;

  // Saved data from hook (pass isAuthenticated like profile does)
  const {
    favorites,
    superlikes,
    quota,
    activeTab,
    isLoading,
    error,
    setActiveTab,
    refresh,
  } = useSaved({ isAuthenticated });

  // Get current listings based on active tab
  const currentListings = activeTab === 'favorites' ? favorites : superlikes;

  useEffect(() => {
    if (!isAuthenticated || isLoading || currentListings.length === 0) return;
    const readyAt = consumeDataReady('saved:listings') ?? consumeDataReady('saved:status') ?? performance.now();
    scheduleRenderPerf('saved.screen', readyAt, {
      activeTab,
      count: currentListings.length,
    });
  }, [isAuthenticated, isLoading, currentListings.length, activeTab]);

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <AuthRequiredEmptyState
          title="Sign in to save"
          subtitle="Keep track of your favorite cars on Revvup"
        />
      </View>
    );
  }

  // Loading state
  if (isLoading && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={[styles.skeletonContainer, { paddingTop: contentTopPadding }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={12} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (error && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text2 }]}>
            Something went wrong
          </Text>
          <Text
            style={[styles.retryText, { color: colors.primary }]}
            onPress={refresh}
          >
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <SavedHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* List */}
      <SavedList
        colors={colors}
        listings={currentListings}
        activeTab={activeTab}
        isRefreshing={isLoading}
        onRefresh={refresh}
        quota={quota}
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
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
