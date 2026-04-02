/**
 * BrowseToolbar — Floating search trigger for the Browse screen.
 * Opens native formSheet routes for search/sort flows.
 */

import { HapticPressable, Text } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Layout, Sizes, Spacing, Shadows, ZIndex } from '@/constants/theme';
import type { FilterPillType, BrowseViewMode as ViewMode } from '@/context/search-context';

const SEARCH_BAR_HEIGHT = Sizes.actionButtonLg + Spacing.xs;
const SEARCH_ROW_WIDTH = Sizes.actionButtonLg * 4 + Spacing['3xl'];

export const BROWSE_TOOLBAR_HEIGHT = SEARCH_BAR_HEIGHT + Spacing.xs;

interface BrowseToolbarProps {
  pills?: { type: FilterPillType; label: string; activeCount: number }[];
  onPillPress?: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
  settingsCount?: number;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  bottomOffset?: number;
}

export function BrowseToolbar({
  pills = [],
  onPillPress,
  onSettingsPress,
  settingsCount = 0,
  viewMode = 'grid',
  onViewModeChange,
  bottomOffset = Layout.tabBarHeight,
}: BrowseToolbarProps) {
  const { colorScheme } = useTheme();
  const { filterParams, searchParams, subscribeToBrowseDrawer, subscribeToBrowseSort } = useSearch();
  const colors = Colors[colorScheme];

  const handleSearchPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(browse)/search');
  }, []);

  const handleSortPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/(browse)/sort');
  }, []);

  const handleDrawerPress = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/(tabs)/(browse)/menu', params: { viewMode } });
  }, [viewMode]);

  useEffect(() => subscribeToBrowseDrawer(handleDrawerPress), [handleDrawerPress, subscribeToBrowseDrawer]);
  useEffect(() => subscribeToBrowseSort(handleSortPress), [handleSortPress, subscribeToBrowseSort]);

  const searchLabel = useMemo(() => {
    if (searchParams?.q?.trim()) return searchParams.q.trim();
    if (searchParams?.partnerName) return searchParams.partnerName;
    if (searchParams?.make?.length && searchParams?.model?.length) {
      return `${searchParams.make[0]} ${searchParams.model[0]}`;
    }
    if (searchParams?.make?.length) return searchParams.make[0];

    const filterCount =
      (filterParams.bodyType?.length ?? 0) +
      (filterParams.fuelType?.length ?? 0) +
      (filterParams.transmission?.length ?? 0) +
      (filterParams.specs?.length ?? 0) +
      (filterParams.condition ? 1 : 0) +
      (filterParams.sellerType ? 1 : 0);

    if (filterCount > 0) return `${filterCount} filters`;
    return 'Search';
  }, [filterParams, searchParams]);

  return (
    <>
      <View style={[styles.container, { bottom: bottomOffset + Spacing.sm }]}>
        <HapticPressable
          onPress={handleSearchPress}
          style={[
            styles.searchBar,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              shadowColor: colors.black,
            },
          ]}
        >
          <Search size={Sizes.iconXs} color={colors.labelSecondary} strokeWidth={2} />
          <Text
            variant="subhead"
            numberOfLines={1}
            style={{ flex: 1, color: searchLabel === 'Search' ? colors.labelSecondary : colors.label }}
          >
            {searchLabel}
          </Text>
        </HapticPressable>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    alignItems: 'center',
  },
  searchBar: {
    width: SEARCH_ROW_WIDTH,
    maxWidth: '92%',
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SEARCH_BAR_HEIGHT / 2,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.md,
  },
});
