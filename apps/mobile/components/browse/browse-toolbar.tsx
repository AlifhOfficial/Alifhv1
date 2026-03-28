/**
 * BrowseToolbar — Floating action bar for the Browse screen.
 * Search, Amna AI, Sort, Active-filter count + their sheets.
 * Rendered inside the browse screen, NOT globally.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable, Body, Label } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { Search } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Layout, Sizes, Spacing, Shadows, ZIndex} from '@/constants/theme';
import { SearchSheet, SortSheet } from '@/components/sheets';
import type { SearchSortOption } from '@/lib/search-api';
import { BrowseDrawerSheet, type FilterPillConfig, type FilterPillType, type ViewMode } from './browse-drawer-sheet';

export const BROWSE_TOOLBAR_HEIGHT = Sizes.bubbleMd + Spacing.sm;

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
  const { applySearch, sortBy, applySort, updateFilterParams, getSearchChips } = useSearch();
  const colors = Colors[colorScheme];

  // Sheet visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const chips = getSearchChips();
  const activeFilterCount = chips.length;

  // ── Handlers ────────────────────────────────────────────────────

  const handleSearchPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchOpen(true);
  }, []);

  const handleSearchSubmit = useCallback((params: { q?: string; make?: string[]; model?: string[]; trim?: string[]; tags?: string[]; extras?: string[]; partnerId?: string; partnerName?: string; bodyType?: string[]; fuelType?: string[]; transmission?: string[]; specs?: string[]; condition?: string; sellerType?: string }) => {
    const { bodyType, fuelType, transmission, specs, condition, sellerType, ...searchLevel } = params;
    applySearch(searchLevel);
    const filterUpdates: Record<string, any> = {};
    if (bodyType?.length) filterUpdates.bodyType = bodyType;
    if (fuelType?.length) filterUpdates.fuelType = fuelType;
    if (transmission?.length) filterUpdates.transmission = transmission;
    if (specs?.length) filterUpdates.specs = specs;
    if (condition) filterUpdates.condition = condition;
    if (sellerType) filterUpdates.sellerType = sellerType;
    if (Object.keys(filterUpdates).length > 0) updateFilterParams(filterUpdates);
  }, [applySearch, updateFilterParams]);

  const handleSortPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSortOpen(true);
  }, []);

  const handleSortChange = useCallback((sort: SearchSortOption) => {
    applySort(sort);
  }, [applySort]);

  const handleDrawerPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDrawerOpen(true);
  }, []);

  return (
    <>
      <View style={[styles.container, { bottom: bottomOffset + Spacing.sm }]}> 
        <View style={styles.row}>
          <HapticPressable
            onPress={handleSearchPress}
            style={[styles.control, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}
          >
            <View style={styles.labelRow}>
              <Search size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
              <Body size="bodySm">Search</Body>
            </View>
          </HapticPressable>

          <HapticPressable
            onPress={handleSortPress}
            style={[styles.control, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}
          >
            <Body size="bodySm">Sort</Body>
          </HapticPressable>

          <HapticPressable
            onPress={handleDrawerPress}
            style={[styles.control, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}
          >
            <View style={styles.labelRow}>
              <Body size="bodySm">Drawer</Body>
              {activeFilterCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.label }]}> 
                  <Label size="caption" uppercase={false} style={{ color: colors.background }}>
                    {activeFilterCount > 9 ? '9+' : activeFilterCount}
                  </Label>
                </View>
              )}
            </View>
          </HapticPressable>
        </View>
      </View>

      {/* Sheets */}
      <SearchSheet visible={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearchSubmit} />
      <SortSheet visible={isSortOpen} onClose={() => setIsSortOpen(false)} currentSort={sortBy} onSortChange={handleSortChange} />
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
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
  control: {
    minWidth: 92,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    minWidth: Sizes.iconSm,
    height: Sizes.iconSm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Sizes.iconSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
