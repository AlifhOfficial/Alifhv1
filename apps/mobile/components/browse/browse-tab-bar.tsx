/**
 * BrowseTabBar - Tab bar for browse screen
 * Shows: back + search + amna + sort + filters
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';
import { Search, ArrowUpDown, Zap } from 'lucide-react-native';

import { TabBarContainer, BackBubble, ActionBubble } from '@/components/layout/tab-bar';
import { ConfettiBurst, useConfettiBurst, Body } from '@/components/ui';
import { SearchSheet, SortSheet, AmnaSheet, ActiveFiltersSheet } from '@/components/sheets';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Sizes, Shadows, Spacing } from '@/constants/theme';
import type { SearchSortOption } from '@/lib/search-api';

const GAP = Spacing.sm;

export function BrowseTabBar() {
  const { colorScheme } = useTheme();
  const { applySearch, sortBy, applySort, updateFilterParams, getSearchChips } = useSearch();
  const colors = Colors[colorScheme];

  // Sheet states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isAmnaOpen, setIsAmnaOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Active filter count
  const chips = getSearchChips();
  const activeFilterCount = chips.length;
  const hasFilters = activeFilterCount > 0;

  // Confetti for Amna AI
  const amnaConfetti = useConfettiBurst();

  // Handlers
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
    
    const filterUpdates: Record<string, any> = {};
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

  const handleAmnaPress = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    amnaConfetti.fire({ colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED', '#6D28D9', '#DDD6FE'], count: 12 });
    setIsAmnaOpen(true);
  }, [amnaConfetti]);

  const handleAmnaClose = useCallback(() => {
    setIsAmnaOpen(false);
  }, []);

  const handleAmnaSearch = useCallback((params: Record<string, any>) => {
    const { make, model, trim, tags, extras, q, ...filterLevel } = params;
    
    const searchLevel: Record<string, any> = {};
    if (make?.length) searchLevel.make = make;
    if (model?.length) searchLevel.model = model;
    if (trim?.length) searchLevel.trim = trim;
    if (tags?.length) searchLevel.tags = tags;
    if (extras?.length) searchLevel.extras = extras;
    if (q) searchLevel.q = q;
    
    if (Object.keys(searchLevel).length > 0) {
      applySearch(searchLevel);
    }
    
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
    
    if (Object.keys(filterUpdates).length > 0) {
      updateFilterParams(filterUpdates);
    }
    
    if (filterLevel.sortBy) {
      applySort(filterLevel.sortBy);
    }
  }, [applySearch, updateFilterParams, applySort]);

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

  return (
    <>
      <TabBarContainer>
        <BackBubble visible={true} />

        {/* Search bubble */}
        <ActionBubble
          icon={Search}
          onPress={handleSearchPress}
          marginLeft
        />

        {/* Amna AI bubble with confetti */}
        <View style={{ overflow: 'visible', marginLeft: GAP }}>
          <MotiPressable
            onPress={handleAmnaPress}
            animate={({ pressed }) => {
              'worklet';
              return {
                scale: pressed ? 0.92 : 1,
              };
            }}
            transition={{
              type: 'timing',
              duration: 120,
            }}
            style={[
              styles.bubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
              },
            ]}
          >
            <Zap
              size={Sizes.iconMd}
              color="#8B5CF6"
              strokeWidth={2}
            />
          </MotiPressable>
          <ConfettiBurst ref={amnaConfetti.ref} />
        </View>

        {/* Sort bubble */}
        <ActionBubble
          icon={ArrowUpDown}
          onPress={handleSortPress}
          marginLeft
        />

        {/* Filter count bubble */}
        <MotiView
          animate={{
            scale: hasFilters ? 1 : 0,
            width: hasFilters ? Sizes.actionButtonLg : 0,
            marginLeft: hasFilters ? GAP : 0,
            opacity: hasFilters ? 1 : 0,
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
          style={styles.filterWrapper}
        >
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
              duration: 120,
            }}
            style={[
              styles.bubble,
              styles.glass,
              {
                borderColor: colors.glassBorder,
                backgroundColor: colorScheme === 'dark' ? colors.oledBlack : colors.oledWhite,
              },
            ]}
            disabled={!hasFilters}
          >
            <Body tone="secondary">
              {activeFilterCount > 9 ? '9+' : activeFilterCount}
            </Body>
          </MotiPressable>
        </MotiView>
      </TabBarContainer>

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

      <AmnaSheet
        visible={isAmnaOpen}
        onClose={handleAmnaClose}
        onSearch={handleAmnaSearch}
      />

      <ActiveFiltersSheet
        visible={isFiltersOpen}
        onClose={handleFiltersClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Sizes.actionButtonLg / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterWrapper: {
    overflow: 'hidden',
  },
  glass: {
    borderWidth: 1,
    ...Shadows.md,
  },
});
