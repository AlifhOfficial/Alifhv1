/**
 * BrowseHeader - Mobile
 * 
 * Revolut-inspired dynamic island header for Browse screen
 * Clean, premium design with buttery smooth animations
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from '@/theme/globals';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react-native';
import { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInRight,
  SlideOutRight,
  Layout,
} from 'react-native-reanimated';
import { SortSheet } from '@/components/search/sort-sheet';
import { FilterSheet } from '@/components/search/filter-sheet';
import { 
  SearchParams, 
  SearchFacets, 
  SearchSortOption,
  SORT_OPTIONS,
  getActiveFilterChips,
} from '@/lib/search-utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// TYPES
// ============================================================================

interface BrowseHeaderProps {
  params: SearchParams;
  facets: SearchFacets | null;
  meta: { total: number } | null;
  activeFilterCount: number;
  isLoading: boolean;
  onSearch: (q: string) => void;
  onFiltersChange: (filters: Partial<SearchParams>) => void;
  onSort: (sort: SearchSortOption) => void;
  onClearFilters: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BrowseHeader({
  params,
  facets,
  meta,
  activeFilterCount,
  isLoading,
  onSearch,
  onFiltersChange,
  onSort,
  onClearFilters,
}: BrowseHeaderProps) {
  // States
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(params.q || '');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const searchWidth = useSharedValue(0);

  // Theme colors
  const card = useColor('card');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const primary = useColor('primary');
  const accent = useColor('accent');

  // Active chips
  const activeChips = useMemo(() => getActiveFilterChips(params), [params]);
  const sortLabel = SORT_OPTIONS.find(s => s.value === (params.sortBy || 'relevance'))?.label || 'Default';

  // Handlers
  const expandSearch = useCallback(() => {
    setSearchExpanded(true);
    searchWidth.value = withSpring(1, SPRING_CONFIG);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const collapseSearch = useCallback(() => {
    Keyboard.dismiss();
    setSearchExpanded(false);
    searchWidth.value = withSpring(0, SPRING_CONFIG);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    onSearch(searchValue);
    collapseSearch();
  }, [searchValue, onSearch, collapseSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onSearch('');
    searchInputRef.current?.focus();
  }, [onSearch]);

  const handleChipRemove = useCallback((chipKey: string) => {
    if (chipKey === 'priceMin') {
      onFiltersChange({ priceMin: undefined, priceMax: undefined });
    } else if (chipKey === 'yearMin') {
      onFiltersChange({ yearMin: undefined, yearMax: undefined });
    } else if (chipKey === 'sortBy') {
      onSort('relevance');
    } else if (chipKey === 'model') {
      onFiltersChange({ model: undefined, trim: undefined });
    } else if (chipKey === 'make') {
      onFiltersChange({ make: undefined, model: undefined, trim: undefined });
    } else {
      onFiltersChange({ [chipKey]: undefined });
    }
  }, [onFiltersChange, onSort]);

  // Animated styles
  const searchContainerStyle = useAnimatedStyle(() => ({
    flex: interpolate(searchWidth.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    opacity: searchWidth.value,
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(searchWidth.value, [0, 0.3], [1, 0], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(searchWidth.value, [0, 0.5], [1, 0.8], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Dynamic Island Card */}
      <View style={[styles.island, { backgroundColor: card }]}>
        
        {/* Main Control Row */}
        <View style={styles.controlRow}>
          
          {/* Left: Filter Button */}
          <AnimatedPressable
            onPress={() => setFilterSheetVisible(true)}
            style={[styles.iconBtn, controlsStyle]}
          >
            <View style={[styles.iconBtnInner, { backgroundColor: accent }]}>
              <SlidersHorizontal size={18} color={fg} strokeWidth={1.5} />
              {activeFilterCount > 0 && (
                <View style={[styles.badge, { backgroundColor: primary }]}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
          </AnimatedPressable>

          {/* Center: Search Bar (expandable) */}
          {searchExpanded ? (
            <Animated.View 
              style={[styles.searchExpanded, searchContainerStyle]}
              entering={FadeIn.duration(150)}
            >
              <View style={[styles.searchInputContainer, { backgroundColor: accent }]}>
                <Search size={16} color={mutedFg} strokeWidth={1.5} />
                <TextInput
                  ref={searchInputRef}
                  style={[styles.searchInput, { color: fg }]}
                  placeholder="Search cars..."
                  placeholderTextColor={mutedFg}
                  value={searchValue}
                  onChangeText={setSearchValue}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchValue.length > 0 && (
                  <Pressable onPress={handleClearSearch} hitSlop={8}>
                    <View style={[styles.clearBtn, { backgroundColor: mutedFg + '30' }]}>
                      <X size={12} color={mutedFg} strokeWidth={2} />
                    </View>
                  </Pressable>
                )}
              </View>
              <Pressable onPress={collapseSearch} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: primary }]}>Cancel</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable onPress={expandSearch} style={styles.searchCollapsed}>
              <View style={[styles.searchPill, { backgroundColor: accent }]}>
                <Search size={15} color={mutedFg} strokeWidth={1.5} />
                <Text 
                  style={[styles.searchPlaceholder, { color: params.q ? fg : mutedFg }]}
                  numberOfLines={1}
                >
                  {params.q || 'Search cars...'}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Right: Sort Button */}
          <AnimatedPressable
            onPress={() => setSortSheetVisible(true)}
            style={[styles.iconBtn, controlsStyle]}
          >
            <View style={[styles.sortBtnInner, { backgroundColor: accent }]}>
              <ArrowUpDown size={14} color={mutedFg} strokeWidth={1.5} />
              <Text 
                style={[styles.sortLabel, { color: fg }]} 
                numberOfLines={1}
              >
                {sortLabel.split(' ')[0]}
              </Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* Results Count Bar */}
        <View style={styles.resultsRow}>
          <View style={[styles.countChip, { backgroundColor: accent }]}>
            {isLoading ? (
              <Animated.View 
                style={[styles.countSkeleton, { backgroundColor: border }]}
                entering={FadeIn}
              />
            ) : (
              <Text style={[styles.countText, { color: fg }]}>
                {(meta?.total ?? 0).toLocaleString()} cars
              </Text>
            )}
          </View>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContent}
              style={styles.chipsScroll}
            >
              {activeChips.map((chip, index) => (
                <Animated.View
                  key={chip.key}
                  entering={SlideInRight.delay(index * 30).springify()}
                  exiting={SlideOutRight.springify()}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() => handleChipRemove(chip.key)}
                    style={[styles.filterChip, { backgroundColor: primary + '15', borderColor: primary + '30' }]}
                  >
                    <Text style={[styles.chipText, { color: primary }]} numberOfLines={1}>
                      {chip.label}
                    </Text>
                    <X size={12} color={primary} strokeWidth={2} />
                  </Pressable>
                </Animated.View>
              ))}
              
              <Pressable onPress={onClearFilters} style={styles.clearAllBtn}>
                <Text style={[styles.clearAllText, { color: mutedFg }]}>Clear all</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Sheets */}
      <SortSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        currentSort={params.sortBy || 'relevance'}
        onSelect={onSort}
      />

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        params={params}
        facets={facets}
        isLoading={isLoading}
        onApply={onFiltersChange}
        onClear={onClearFilters}
        activeFilterCount={activeFilterCount}
      />
    </View>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

export function BrowseHeaderSkeleton() {
  const card = useColor('card');
  const accent = useColor('accent');
  const border = useColor('border');

  return (
    <View style={styles.container}>
      <View style={[styles.island, { backgroundColor: card }]}>
        <View style={styles.controlRow}>
          <View style={[styles.iconBtnInner, { backgroundColor: accent, width: 44, height: 44 }]} />
          <View style={[styles.searchPill, { backgroundColor: accent, flex: 1 }]} />
          <View style={[styles.sortBtnInner, { backgroundColor: accent, width: 80 }]} />
        </View>
        <View style={styles.resultsRow}>
          <View style={[styles.countChip, { backgroundColor: accent, width: 80 }]}>
            <View style={[styles.countSkeleton, { backgroundColor: border }]} />
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  
  // Dynamic Island
  island: {
    borderRadius: 24,
    padding: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Control Row
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Icon Button
  iconBtn: {
    zIndex: 1,
  },
  iconBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONT_FAMILY_BOLD,
  },

  // Sort Button
  sortBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  sortLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.3,
  },

  // Search Collapsed
  searchCollapsed: {
    flex: 1,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONT_FAMILY,
    letterSpacing: -0.3,
  },

  // Search Expanded
  searchExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    letterSpacing: -0.3,
    padding: 0,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.3,
  },

  // Results Row
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
  },
  countChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    letterSpacing: -0.3,
  },
  countSkeleton: {
    width: 50,
    height: 14,
    borderRadius: 7,
  },

  // Chips
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    gap: 6,
    alignItems: 'center',
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_MEDIUM,
    letterSpacing: -0.3,
    maxWidth: 100,
  },
  clearAllBtn: {
    paddingHorizontal: 10,
    height: 32,
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_MEDIUM,
    letterSpacing: -0.3,
  },
});
