/**
 * BrowseToolbar — Floating action bar for the Browse screen.
 * Search, Amna AI, Sort, Active-filter count + their sheets.
 * Rendered inside the browse screen, NOT globally.
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { HapticPressable, ConfettiBurst, useConfettiBurst, Body } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, ArrowUpDown, Zap } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Layout, Sizes, Spacing, Shadows } from '@/constants/theme';
import { SearchSheet, SortSheet, AmnaSheet, ActiveFiltersSheet } from '@/components/sheets';
import type { SearchSortOption } from '@/lib/search-api';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const GAP = Spacing.sm;

export function BrowseToolbar() {
  const { colorScheme } = useTheme();
  const { applySearch, sortBy, applySort, updateFilterParams, getSearchChips } = useSearch();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];

  // Sheet visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAmnaOpen, setIsAmnaOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const chips = getSearchChips();
  const activeFilterCount = chips.length;

  // Filter badge animation
  const filterProgress = useSharedValue(activeFilterCount > 0 ? 1 : 0);
  React.useEffect(() => {
    filterProgress.value = withTiming(activeFilterCount > 0 ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [activeFilterCount]);

  const filterBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(filterProgress.value, [0, 1], [0, 1]) }],
    width: interpolate(filterProgress.value, [0, 1], [0, Sizes.bubbleMd]),
    marginLeft: interpolate(filterProgress.value, [0, 1], [0, GAP]),
  }));

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

  // Confetti for Amna
  const amnaConfetti = useConfettiBurst();

  const handleAmnaPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    amnaConfetti.fire({ colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#6D28D9', '#DDD6FE'], count: 12 });
    setIsAmnaOpen(true);
  }, [amnaConfetti]);

  const handleAmnaSearch = useCallback((params: Record<string, any>) => {
    const { make, model, trim, tags, extras, q, ...filterLevel } = params;
    const searchLevel: Record<string, any> = {};
    if (make?.length) searchLevel.make = make;
    if (model?.length) searchLevel.model = model;
    if (trim?.length) searchLevel.trim = trim;
    if (tags?.length) searchLevel.tags = tags;
    if (extras?.length) searchLevel.extras = extras;
    if (q) searchLevel.q = q;
    if (Object.keys(searchLevel).length > 0) applySearch(searchLevel);
    const filterUpdates: Record<string, any> = {};
    if (filterLevel.bodyType?.length) filterUpdates.bodyType = filterLevel.bodyType;
    if (filterLevel.fuelType?.length) filterUpdates.fuelType = filterLevel.fuelType;
    if (filterLevel.transmission?.length) filterUpdates.transmission = filterLevel.transmission;
    if (filterLevel.specs?.length) filterUpdates.specs = filterLevel.specs;
    if (filterLevel.exteriorColor?.length) filterUpdates.exteriorColor = filterLevel.exteriorColor;
    if (filterLevel.interiorColor?.length) filterUpdates.interiorColor = filterLevel.interiorColor;
    if (filterLevel.engineSize?.length) filterUpdates.engineSize = filterLevel.engineSize;
    if (filterLevel.emirate?.length) filterUpdates.emirate = filterLevel.emirate;
    if (filterLevel.priceMin) filterUpdates.priceMin = filterLevel.priceMin;
    if (filterLevel.priceMax) filterUpdates.priceMax = filterLevel.priceMax;
    if (filterLevel.yearMin) filterUpdates.yearMin = filterLevel.yearMin;
    if (filterLevel.yearMax) filterUpdates.yearMax = filterLevel.yearMax;
    if (filterLevel.mileageMax) filterUpdates.mileageMax = filterLevel.mileageMax;
    if (filterLevel.condition) filterUpdates.condition = filterLevel.condition;
    if (filterLevel.sellerType) filterUpdates.sellerType = filterLevel.sellerType;
    if (Object.keys(filterUpdates).length > 0) updateFilterParams(filterUpdates);
    if (filterLevel.sortBy) applySort(filterLevel.sortBy);
  }, [applySearch, updateFilterParams, applySort]);

  const handleSortPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSortOpen(true);
  }, []);

  const handleSortChange = useCallback((sort: SearchSortOption) => {
    applySort(sort);
  }, [applySort]);

  const handleFiltersPress = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFiltersOpen(true);
  }, []);

  return (
    <>
      {/* Floating action row */}
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <View style={styles.row}>
          <HapticPressable
            onPress={handleSearchPress}
            style={[styles.bubble, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}
          >
            <Search size={Sizes.iconMd} color={colors.text} strokeWidth={2} />
          </HapticPressable>

          <View style={{ overflow: 'visible', marginLeft: GAP }}>
            <HapticPressable
              onPress={handleAmnaPress}
              style={[styles.bubble, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }]}
            >
              <Zap size={Sizes.iconMd} color="#8B5CF6" strokeWidth={2} />
            </HapticPressable>
            <ConfettiBurst ref={amnaConfetti.ref} />
          </View>

          <HapticPressable
            onPress={handleSortPress}
            style={[styles.bubble, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg, marginLeft: GAP }]}
          >
            <ArrowUpDown size={Sizes.iconMd} color={colors.text} strokeWidth={2} />
          </HapticPressable>

          <AnimatedPressable
            onPress={handleFiltersPress}
            style={[styles.bubble, styles.glass, { borderColor: colors.glassBorder, backgroundColor: colors.glassBg }, filterBubbleStyle]}
            pointerEvents={activeFilterCount > 0 ? 'auto' : 'none'}
          >
            <Body tone="secondary">{activeFilterCount > 9 ? '9+' : activeFilterCount}</Body>
          </AnimatedPressable>
        </View>
      </View>

      {/* Sheets */}
      <SearchSheet visible={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearchSubmit} />
      <SortSheet visible={isSortOpen} onClose={() => setIsSortOpen(false)} currentSort={sortBy} onSortChange={handleSortChange} />
      <AmnaSheet visible={isAmnaOpen} onClose={() => setIsAmnaOpen(false)} onSearch={handleAmnaSearch} />
      <ActiveFiltersSheet visible={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
  bubble: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
