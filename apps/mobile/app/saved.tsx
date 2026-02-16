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
import { Skeleton } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography, Layout, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import {
  SavedHeader,
  SavedList,
} from '@/components/saved';
import { useSaved } from '@/hooks/use-saved';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SavedScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated, showAuthSheet } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Account for absolute header: safe area + headerPadding + pill height + bottom padding
  const contentTopPadding = insets.top + Layout.headerPadding + Sizes.pillHeight + Spacing.md;

  // Show auth sheet when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Small delay to ensure sheet modal is mounted
      const timer = setTimeout(() => showAuthSheet('saved'), 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showAuthSheet]);

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

  // Unauthenticated - show header only (sheet comes from context)
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopSafeAreaGradient />
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
    );
  }

  // Loading state
  if (isLoading && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopSafeAreaGradient />
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={[styles.skeletonContainer, { paddingTop: contentTopPadding }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Skeleton width={120} height={100} borderRadius={8} />
              <View style={styles.skeletonCardContent}>
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={12} />
                <Skeleton width={80} height={16} />
                <Skeleton width={110} height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (error && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopSafeAreaGradient />
        <SavedHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <View style={[styles.errorContainer, { paddingTop: contentTopPadding }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopSafeAreaGradient />
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
    gap: Spacing.sm,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  skeletonCardContent: {
    flex: 1,
    gap: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  retryText: {},
});
