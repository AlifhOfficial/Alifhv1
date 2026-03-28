/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Sparkles } from 'lucide-react-native';
import { Skeleton, AuthRequiredEmptyState, Body, Text, HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Sizes, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { SavedList } from '@/components/saved';
import type { SavedTab } from '@/components/saved/types';
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

  const handleTabChange = (tab: SavedTab) => {
    if (tab === activeTab) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading || currentListings.length === 0) return;
    const readyAt = consumeDataReady('saved:listings') ?? consumeDataReady('saved:status') ?? performance.now();
    scheduleRenderPerf('saved.screen', readyAt, {
      activeTab,
      count: currentListings.length,
    });
  }, [isAuthenticated, isLoading, currentListings.length, activeTab]);

  const nativeHeaderOptions = Platform.OS === 'ios'
    ? {
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal' as const,
        headerBackTitle: '',
      }
    : {
        headerStyle: { backgroundColor: colors.background },
      };

  const TabToggle = () => (
    <View style={styles.headerRight}>
      <HapticPressable
        onPress={() => handleTabChange('favorites')}
        style={[styles.headerActionButton, { borderColor: colors.glassBorder, backgroundColor: colors.fill }]}
        accessibilityRole="button"
        accessibilityLabel="Favorites"
      >
        <Heart
          size={Sizes.iconSm}
          color={activeTab === 'favorites' ? colors.label : colors.labelTertiary}
          strokeWidth={activeTab === 'favorites' ? 2.5 : 2}
        />
      </HapticPressable>
      <HapticPressable
        onPress={() => handleTabChange('superlikes')}
        style={[styles.headerActionButton, { borderColor: colors.glassBorder, backgroundColor: colors.fill }]}
        accessibilityRole="button"
        accessibilityLabel="Superlikes"
      >
        <Sparkles
          size={Sizes.iconSm}
          color={activeTab === 'superlikes' ? colors.label : colors.labelTertiary}
          strokeWidth={activeTab === 'superlikes' ? 2.5 : 2}
        />
      </HapticPressable>
    </View>
  );

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label, headerRight: () => <TabToggle /> }} />
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label, headerRight: () => <TabToggle /> }} />
        <View style={[styles.skeletonContainer, { paddingTop: insets.top + Spacing.lg }]}>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label, headerRight: () => <TabToggle /> }} />
        <View style={styles.emptyContainer}>
          <Body size="bodySm" tone="secondary">Something went wrong</Body>
          <Text variant="bodySm" tone="primary" onPress={refresh}>Tap to retry</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label, headerRight: () => <TabToggle /> }} />

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerActionButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
