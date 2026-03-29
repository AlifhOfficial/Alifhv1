/**
 * BrowseToolbar — Floating search trigger for the Browse screen.
 * Uses the existing SearchSheet for the full search flow.
 */

import { HapticPressable, Text } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Layout, Sizes, Spacing, Shadows, ZIndex } from '@/constants/theme';
import { SearchSheet, SortSheet } from '@/components/sheets';
import { type SearchSortOption } from '@/lib/search-api';
import { BrowseDrawerSheet, type FilterPillConfig, type FilterPillType, type ViewMode } from './browse-drawer-sheet';

const SEARCH_BAR_HEIGHT = Sizes.actionButtonLg + Spacing.xs;
const SEARCH_ROW_WIDTH = Sizes.actionButtonLg * 4 + Spacing['3xl'];

export const BROWSE_TOOLBAR_HEIGHT = SEARCH_BAR_HEIGHT + Spacing.xs;

interface BrowseToolbarProps {
  pills?: FilterPillConfig[];
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
  const {
    applySearch,
    filterParams,
    sortBy,
    applySort,
    searchParams,
    updateFilterParams,
    subscribeToBrowseDrawer,
    subscribeToBrowseSort,
  } = useSearch();
  const colors = Colors[colorScheme];

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchOpen(true);
  }, []);

  const handleSearchSubmit = useCallback(
    (params: {
      q?: string;
      make?: string[];
      model?: string[];
      trim?: string[];
      tags?: string[];
      extras?: string[];
      partnerId?: string;
      partnerName?: string;
      bodyType?: string[];
      fuelType?: string[];
      transmission?: string[];
      specs?: string[];
      condition?: string;
      sellerType?: string;
    }) => {
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
    },
    [applySearch, updateFilterParams],
  );

  const handleSortPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSortOpen(true);
  }, []);

  const handleSortChange = useCallback(
    (sort: SearchSortOption) => {
      applySort(sort);
    },
    [applySort],
  );

  const handleDrawerPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDrawerOpen(true);
  }, []);

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

      <SearchSheet
        visible={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearchSubmit}
      />
      <SortSheet
        visible={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={sortBy}
        onSortChange={handleSortChange}
      />
      <BrowseDrawerSheet
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        pills={pills}
        onPillPress={onPillPress}
        onSettingsPress={onSettingsPress}
        settingsCount={settingsCount}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
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
