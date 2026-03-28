/**
 * Saved Screen - Favorites & Superlikes (Stack Screen with swipe back)
 * Native-feeling, modular saved screen connected to API
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Sparkles, ListFilter, Check } from 'lucide-react-native';
import { Skeleton, AuthRequiredEmptyState, Body, Text, HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Sizes, Spacing, Radius, Layout, ZIndex } from '@/constants/theme';
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

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const openFilterDrawer = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterDrawer(true);
  }, []);

  const closeFilterDrawer = useCallback(() => {
    setShowFilterDrawer(false);
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

  const SAVED_TABS: { key: SavedTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'favorites',
      label: 'Favorites',
      icon: <Heart size={Sizes.iconSm} color={activeTab === 'favorites' ? colors.primary : colors.label} strokeWidth={2} />,
    },
    {
      key: 'superlikes',
      label: 'Superlikes',
      icon: <Sparkles size={Sizes.iconSm} color={activeTab === 'superlikes' ? colors.primary : colors.label} strokeWidth={2} />,
    },
  ];

  const FAB_SIZE = Sizes.bubbleMd + Spacing.xs;

  // Unauthenticated - show auth required empty state
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
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
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
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
        <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />
        <View style={styles.emptyContainer}>
          <Body size="bodySm" tone="secondary">Something went wrong</Body>
          <Text variant="bodySm" tone="primary" onPress={refresh}>Tap to retry</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ ...nativeHeaderOptions, title: 'Saved', headerTintColor: colors.label }} />

      {/* List */}
      <SavedList
        colors={colors}
        listings={currentListings}
        activeTab={activeTab}
        isRefreshing={isLoading}
        onRefresh={refresh}
        quota={quota}
      />

      {/* ── Filter Drawer Bubble ─────────────────────────────────────── */}
      <View
        style={[styles.fabCluster, { bottom: insets.bottom + Spacing.xl }]}
        pointerEvents="box-none"
      >
        {showFilterDrawer && (
          <TouchableWithoutFeedback onPress={closeFilterDrawer}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        )}

        {showFilterDrawer && (
          <View style={[styles.drawerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                            <Check size={Sizes.iconSm} color={colors.primary} strokeWidth={2.5} />
                          ) : (
                            <View style={{ width: Sizes.iconSm }} />
                          )}
                          {t.icon}
                          <Body
                            size="body"
                            style={{
                              color: isActive ? colors.primary : colors.label,
                              fontWeight: isActive ? '600' : '400',
                            }}
                          >
                            {t.label}
                          </Body>
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
          </View>
        )}

        <HapticPressable
          onPress={showFilterDrawer ? closeFilterDrawer : openFilterDrawer}
          style={[
            styles.fab,
            {
              width: FAB_SIZE,
              height: FAB_SIZE,
              backgroundColor: showFilterDrawer ? colors.primary : colors.glassBg,
              borderColor: showFilterDrawer ? colors.primary : colors.glassBorder,
            },
          ]}
        >
          {({ pressed }) => (
            <ListFilter
              size={Sizes.iconSm}
              color={showFilterDrawer ? colors.primaryForeground : colors.label}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
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
  fab: {
    borderRadius: Sizes.bubbleMd,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  } as any,

  // ── Filter Drawer ───────────────────────────────────────────────────
  drawerContainer: {
    marginBottom: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 200,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  } as any,
  drawerItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
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
