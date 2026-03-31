/**
 * BrowseTabBar - Tab bar for browse screen
 * Shows: back + search + sort + filters
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { Search, ArrowUpDown, Package2 } from 'lucide-react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SearchSheet, SortSheet, ActiveFiltersSheet } from '@/components/sheets';
import { Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { BorderWidths, Colors, Layout, Sizes, Spacing, Timing, ZIndex } from '@/constants/theme';
import type { SearchSortOption } from '@/lib/search-api';
import { BrowseDrawerSheet, type FilterPillType, type ViewMode } from '@/components/browse/browse-drawer-sheet';

interface BrowseTabBarProps {
  bottomOffset?: number;
  visible?: boolean;
  pills?: { type: FilterPillType; label: string; activeCount: number }[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

const AnimatedView = Animated.View;

export function BrowseTabBar({
  bottomOffset = 0,
  visible = true,
  pills = [],
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
}: BrowseTabBarProps) {
  const { colorScheme } = useTheme();
  const { applySearch, sortBy, applySort, updateFilterParams, getActiveFilterCount } = useSearch();
  const colors = Colors[colorScheme];
  const visibilityProgress = useSharedValue(visible ? 1 : 0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFilterCount = getActiveFilterCount();
  const hasFilters = activeFilterCount > 0;

  const handleSearchPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSearchSubmit = useCallback((params: { q?: string; make?: string[]; model?: string[]; trim?: string[]; tags?: string[]; extras?: string[]; partnerId?: string; partnerName?: string; bodyType?: string[]; fuelType?: string[]; transmission?: string[]; specs?: string[]; condition?: string; sellerType?: string }) => {
    const { bodyType, fuelType, transmission, specs, condition, sellerType, ...searchLevel } = params;

    applySearch(searchLevel);

    const filterUpdates: Record<string, unknown> = {};
    if (bodyType?.length) filterUpdates.bodyType = bodyType;
    if (fuelType?.length) filterUpdates.fuelType = fuelType;
    if (transmission?.length) filterUpdates.transmission = transmission;
    if (specs?.length) filterUpdates.specs = specs;
    if (condition) filterUpdates.condition = condition;
    if (sellerType) filterUpdates.sellerType = sellerType;

    if (Object.keys(filterUpdates).length > 0) {
      updateFilterParams(filterUpdates);
    }
  }, [applySearch, updateFilterParams]);

  const handleSortPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSortOpen(true);
  }, []);

  const handleSortClose = useCallback(() => {
    setIsSortOpen(false);
  }, []);

  const handleSortChange = useCallback((sort: SearchSortOption) => {
    applySort(sort);
  }, [applySort]);

  const handleFiltersPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFiltersOpen(true);
  }, []);

  const handleFiltersClose = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  const handleDrawerPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    visibilityProgress.value = withSpring(visible ? 1 : 0, {
      damping: 18,
      stiffness: 180,
      mass: 0.9,
      overshootClamping: false,
      energyThreshold: 0.01,
    });
  }, [visible, visibilityProgress]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const progress = visibilityProgress.value;

    return {
      opacity: progress,
      transform: [
        { translateY: interpolate(progress, [0, 1], [Spacing['2xl'], 0]) },
        { scale: 0.96 + progress * 0.04 },
      ],
    };
  });

  return (
    <>
      <AnimatedView
        style={[styles.container, { bottom: bottomOffset }, containerAnimatedStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={styles.content}>
          <View style={styles.navGroup}>
            <MotiPressable
              onPress={handleDrawerPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Package2 size={Sizes.iconMd} color={colors.label} strokeWidth={2} />
            </MotiPressable>

            <MotiPressable
              onPress={handleSearchPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Search size={Sizes.iconMd} color={colors.label} strokeWidth={2} />
            </MotiPressable>

            <MotiPressable
              onPress={handleSortPress}
              animate={({ pressed }) => {
                'worklet';
                return {
                  scale: pressed ? 0.92 : 1,
                };
              }}
              transition={{
                type: 'timing',
                duration: Timing.imageTransition,
              }}
              style={[
                styles.bubble,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <ArrowUpDown size={Sizes.iconMd} color={colors.label} strokeWidth={2} />
            </MotiPressable>

            {hasFilters ? (
              <MotiPressable
                onPress={handleFiltersPress}
                animate={({ pressed }) => {
                  'worklet';
                  return {
                    scale: pressed ? 0.92 : 1,
                  };
                }}
                transition={{
                  type: 'timing',
                  duration: Timing.imageTransition,
                }}
                style={[
                  styles.bubble,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Text variant="subhead" tone="secondary">
                  {activeFilterCount > 9 ? '9+' : activeFilterCount}
                </Text>
              </MotiPressable>
            ) : null}
          </View>
        </View>
      </AnimatedView>

      <SearchSheet
        visible={isSearchOpen}
        onClose={handleSearchClose}
        onSearch={handleSearchSubmit}
      />

      <SortSheet
        visible={isSortOpen}
        onClose={handleSortClose}
        currentSort={sortBy}
        onSortChange={handleSortChange}
      />

      <ActiveFiltersSheet
        visible={isFiltersOpen}
        onClose={handleFiltersClose}
      />

      <BrowseDrawerSheet
        visible={isDrawerOpen}
        onClose={handleDrawerClose}
        pills={pills}
        onPillPress={onPillPress}
        onSettingsPress={onSettingsPress}
        settingsCount={settingsCount}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        bottomOffset={bottomOffset}
      />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.headerPadding + Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bubble: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidths.thin,
  },
});
