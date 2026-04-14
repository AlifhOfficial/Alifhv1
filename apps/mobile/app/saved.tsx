/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import { HapticPressable, EmptyState, RequireAuthSheet, Text } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, AlertCircle, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileHeader, getMobileHeaderContentInset, getTabBarContentInset } from '@/components/layout';

import { Colors, Shadows, Sizes, Spacing, Layout, ZIndex, BorderWidths } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { SavedList } from '@/components/saved';
import { CarCardMSkeleton } from '@/components/cards';
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
  const bottomInset = getTabBarContentInset(insets.bottom);
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

  const fabBackground = colors.surfaceSecondary;
  const fabForeground = colors.label;

  const headerRight = useMemo(() => {
    if (activeTab !== 'superlikes' || !quota) return null;

    return (
      <View style={[styles.superlikeQuota, { backgroundColor: colors.surfaceSecondary }]}> 
        <Zap size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
        <Text variant="subhead" style={{ color: colors.label }}>
          {quota.remaining}/{quota.maxSuperlikesPerMonth}
        </Text>
      </View>
    );
  }, [activeTab, quota, colors.surfaceSecondary, colors.label]);

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
        <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} right={headerRight} sideSlotWidth={activeTab === 'superlikes' && quota ? 120 : undefined} />
        <ScrollView
          contentContainerStyle={[styles.skeletonContainer, { paddingTop: headerInset, paddingBottom: bottomInset }]}
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <CarCardMSkeleton key={i} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error && currentListings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
        <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} right={headerRight} sideSlotWidth={activeTab === 'superlikes' && quota ? 120 : undefined} />
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
      <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} right={headerRight} sideSlotWidth={activeTab === 'superlikes' && quota ? 120 : undefined} />

      {/* List */}
      <SavedList
        colors={colors}
        listings={currentListings}
        activeTab={activeTab}
        isRefreshing={isLoading}
        onRefresh={refresh}
        onScroll={handleScroll}
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
                backgroundColor: fabBackground,
                borderColor: colors.border,
                borderWidth: BorderWidths.thin,
              },
            ]}
          >
            {activeTab === 'superlikes' ? (
              <Zap size={Sizes.iconSm} color={fabForeground} strokeWidth={2.8} />
            ) : (
              <Heart size={Sizes.iconSm} color={fabForeground} strokeWidth={2.8} />
            )}
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
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  superlikeQuota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Sizes.actionButtonLg / 2,
    borderWidth: 0,
  },
});
