/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import { AuthGate, Text, HapticPressable, EmptyState } from '@/components/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Pressable, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Sparkles, ListFilter, Check, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';

import { Colors, Shadows, Sizes, Spacing, Radius, Layout, ZIndex, Stroke, BorderWidths } from '@/constants/theme';
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
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const drawerProgress = useSharedValue(0);

  const drawerAnimStyle = useAnimatedStyle(() => ({
    opacity: drawerProgress.value,
    transform: [
      { scale: interpolate(drawerProgress.value, [0, 1], [0.96, 1]) },
      { translateY: interpolate(drawerProgress.value, [0, 1], [6, 0]) },
    ],
    pointerEvents: drawerProgress.value > 0.01 ? 'box-none' : 'none',
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: drawerProgress.value,
    pointerEvents: drawerProgress.value > 0.01 ? 'box-none' : 'none',
  }));

  const openFilterDrawer = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterDrawer(true);
    drawerProgress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
  }, []);

  const closeFilterDrawer = useCallback(() => {
    drawerProgress.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) runOnJS(setShowFilterDrawer)(false);
    });
  }, []);

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

  const SAVED_TABS: { key: SavedTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'favorites',
      label: 'Favorites',
      icon: <Heart size={Sizes.iconSm} color={activeTab === 'favorites' ? colors.primary : colors.labelSecondary} strokeWidth={Stroke.icon} />,
    },
    {
      key: 'superlikes',
      label: 'Superlikes',
      icon: <Sparkles size={Sizes.iconSm} color={activeTab === 'superlikes' ? colors.primary : colors.labelSecondary} strokeWidth={Stroke.icon} />,
    },
  ];

  const FAB_SIZE = Sizes.actionButtonLg;

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
        <MobileHeader title="Saved" showBackButton titleHidden={isHeaderTitleHidden} />
        <View style={{ flex: 1, paddingTop: headerInset }}>
        <AuthGate
          icon={Heart}
          title="Sign in to save."
          subtitle="Keep track of your favorite cars on Revvup."
        />
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading && currentListings.length === 0) {
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

      {showFilterDrawer && (
        <Pressable
          style={[styles.drawerBackdrop, { backgroundColor: colors.overlay }]}
          onPress={closeFilterDrawer}
        />
      )}

      {/* ── Filter Drawer Bubble ─────────────────────────────────────── */}
      <View
        style={[styles.fabCluster, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        {/* Drawer menu */}
        <Animated.View
          style={[
            styles.drawerContainer,
            drawerAnimStyle,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
        >
            {SAVED_TABS.map((t, index) => {
              const isActive = t.key === activeTab;
              const isLast = index === SAVED_TABS.length - 1;
              return (
                <View key={t.key}>
                  <HapticPressable
                    onPress={() => {
                      handleTabChange(t.key);
                      closeFilterDrawer();
                    }}
                    style={styles.drawerItem}
                  >
                    {({ pressed }) => (
                      <View style={[styles.drawerItemInner, { opacity: pressed ? 0.6 : 1 }]}>
                        <View style={styles.drawerItemLeft}>
                          {isActive ? (
                            <Check size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
                          ) : (
                            <View style={{ width: Sizes.iconSm }} />
                          )}
                          <Text
                            variant="body"
                            style={{ color: isActive ? colors.primary : colors.label, fontWeight: isActive ? '600' : '400' }}
                          >
                            {t.label}
                          </Text>
                        </View>
                      </View>
                    )}
                  </HapticPressable>
                  {!isLast && (
                    <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </Animated.View>

        {/* FAB button */}
        <HapticPressable
          onPress={showFilterDrawer ? closeFilterDrawer : openFilterDrawer}
          style={[
            styles.fabButton,
            {
              backgroundColor: showFilterDrawer ? colors.primary : colors.surfaceSecondary,
              borderColor: showFilterDrawer ? colors.primary : colors.border,
            },
          ]}
        >
          {({ pressed }) => (
            <ListFilter
              size={Sizes.iconSm}
              color={showFilterDrawer ? colors.primaryForeground : colors.label}
              strokeWidth={Stroke.icon}
              style={{ opacity: pressed ? 0.6 : 1 }}
            />
          )}
        </HapticPressable>
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

  // ── FAB cluster ─────────────────────────────────────────────────────
  fabCluster: {
    position: 'absolute',
    right: Layout.screenPadding,
    alignItems: 'flex-end',
    zIndex: ZIndex.overlay,
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
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: ZIndex.overlay,
  },

  // ── Filter Drawer ───────────────────────────────────────────────────
  drawerContainer: {
    marginBottom: Spacing.sm,
    borderRadius: Radius['3xl'],
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minWidth: 200,
    ...Shadows.lg,
  } as any,
  drawerItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  drawerItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
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
