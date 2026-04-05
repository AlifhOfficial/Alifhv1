/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import { HapticPressable, EmptyState, RequireAuthSheet } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Package2, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';

import { Colors, Shadows, Sizes, Spacing, Layout, ZIndex, BorderWidths } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { SavedList } from '@/components/saved';
import { CarCardListSkeleton } from '@/components/cards';
import type { SavedTab } from '@/components/saved/types';
import { useSaved } from '@/hooks/use-saved';
import { consumeDataReady, scheduleRenderPerf } from '@/lib/config';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SavedScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);

  const initialTab = useMemo<SavedTab>(() => {
    if (tab === 'favorites' || tab === 'superlikes') {
      return tab;
    }
    return 'favorites';
  }, [tab]);

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

  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, activeTab, setActiveTab]);

  // Get current listings based on active tab
  const currentListings = activeTab === 'favorites' ? favorites : superlikes;

  const openFilterSheet = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/saved-filters',
      params: {
        activeTab,
        favoritesCount: String(favorites.length),
        superlikesCount: String(superlikes.length),
      },
    });
  }, [activeTab, favorites.length, router, superlikes.length]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsHeaderTitleHidden(event.nativeEvent.contentOffset.y > Spacing.lg);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoading || currentListings.length === 0) return;
    const readyAt = consumeDataReady('saved:listings') ?? consumeDataReady('saved:status') ?? performance.now();
    scheduleRenderPerf('saved.screen', readyAt, {
      activeTab,
      count: currentListings.length,
    });
  }, [isAuthenticated, isLoading, currentListings.length, activeTab]);

  const nativeHeaderOptions = {
    headerShown: false,
  };

  if (!isAuthLoading && !isAuthenticated) {
    return <RequireAuthSheet context="saved" />;
  }

  // Loading state
  if ((isAuthLoading || isLoading) && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
        <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} />
        <View style={[styles.skeletonContainer, { paddingTop: headerInset }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CarCardListSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (error && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
        <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} />
        <View style={{ flex: 1, paddingTop: headerInset }}>
          <EmptyState
            icon={AlertCircle}
            title="Something went wrong."
            subtitle="We couldn't load your saved cars."
            action={{ label: 'Retry', onPress: refresh }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
      <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} />

      {/* List */}
      <SavedList
        colors={colors}
        listings={currentListings}
        activeTab={activeTab}
        isRefreshing={isLoading}
        onRefresh={refresh}
        onScroll={handleScroll}
        quota={quota}
      />

      {/* ── Bottom Filter Bubble ─────────────────────────────────────── */}
      <View
        style={[styles.bottomBar, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        <View style={styles.bottomBarContent}>
          <HapticPressable
            onPress={openFilterSheet}
            style={[
              styles.fabButton,
              {
                backgroundColor: activeTab !== 'favorites' ? colors.primary : colors.surfaceSecondary,
                borderColor: activeTab !== 'favorites' ? colors.primary : colors.border,
              },
            ]}
          >
            <Package2
              size={Sizes.iconSm}
              color={activeTab !== 'favorites' ? colors.primaryForeground : colors.label}
              strokeWidth={2}
            />
          </HapticPressable>
        </View>
      </View>
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

  // ── Bottom action bar (centered) ───────────────────────────────────
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
  },
  bottomBarContent: {
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  fabButton: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    borderWidth: BorderWidths.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  } as any,

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
