/**
 * Dynamic Island Search Component
 * 
 * A clean, floating search interface with:
 * - Search bar with suggestions
 * - Filter pills (Make, Model, Price, Year, Mileage, Location, More)
 * - Expandable dropdown panels
 * 
 * Properly handles safe area insets and avoids overlap with status bar.
 * Container is adaptive - grows with content up to max dropdown height.
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/constants/theme';

// Components
import { SearchBar } from './SearchBar';
import { FilterPillsRow } from './FilterPillsRow';
import { SearchDropdown, OptionDropdown, PresetDropdown, MoreFiltersDropdown } from './dropdowns';

// Utils & Constants
import { ISLAND_CONFIG, PRICE_PRESETS, YEAR_PRESETS, MILEAGE_PRESETS, EMIRATES } from './constants';
import { formatPriceRange, formatYearRange, formatMileage } from './utils';

// Types
import type { DynamicIslandProps, ActivePill } from './types';

export function DynamicIsland({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  suggestions,
  loadingSuggestions,
  onSuggestionPress,
  activePill,
  onActivePillChange,
  facets,
  filters,
  onFilterSelect,
  onFilterPress,
  hasActiveFilters,
  colors,
}: DynamicIslandProps) {
  const insets = useSafeAreaInsets();
  const isExpanded = activePill !== null;

  // Handlers
  const handlePillPress = useCallback((pill: ActivePill) => {
    onActivePillChange(activePill === pill ? null : pill);
  }, [activePill, onActivePillChange]);

  const handleBackdropPress = useCallback(() => {
    onActivePillChange(null);
  }, [onActivePillChange]);

  const handleClearFilter = useCallback((key: string) => {
    onFilterSelect(key, undefined);
  }, [onFilterSelect]);

  // Pill label helpers
  const getPillLabel = useCallback((pill: ActivePill): string => {
    switch (pill) {
      case 'make':
        const makeCount = filters.make?.length || 0;
        return makeCount > 0 ? (makeCount === 1 ? filters.make![0] : `${makeCount} Makes`) : 'Make';
      case 'model':
        const modelCount = filters.model?.length || 0;
        return modelCount > 0 ? (modelCount === 1 ? filters.model![0] : `${modelCount} Models`) : 'Model';
      case 'price':
        return formatPriceRange(filters.priceMin, filters.priceMax);
      case 'year':
        return formatYearRange(filters.yearMin, filters.yearMax);
      case 'mileage':
        return filters.mileageMax ? formatMileage(filters.mileageMax) : 'Mileage';
      case 'location':
        const locCount = filters.emirate?.length || 0;
        return locCount > 0 ? (locCount === 1 ? filters.emirate![0] : `${locCount} Locations`) : 'Location';
      case 'more':
        const moreCount = [
          filters.condition,
          filters.isBlkListing,
          filters.isBlackTierPartner,
          filters.isNegotiable,
          filters.specs?.length,
        ].filter(Boolean).length;
        return moreCount > 0 ? `More (${moreCount})` : 'More';
      default:
        return '';
    }
  }, [filters]);

  const isPillActive = useCallback((pill: ActivePill): boolean => {
    switch (pill) {
      case 'make':
        return (filters.make?.length || 0) > 0;
      case 'model':
        return (filters.model?.length || 0) > 0;
      case 'price':
        return !!(filters.priceMin || filters.priceMax);
      case 'year':
        return !!(filters.yearMin || filters.yearMax);
      case 'mileage':
        return !!filters.mileageMax;
      case 'location':
        return (filters.emirate?.length || 0) > 0;
      case 'more':
        return !!(filters.condition || filters.isBlkListing || filters.isBlackTierPartner || filters.isNegotiable || (filters.specs?.length || 0) > 0);
      default:
        return false;
    }
  }, [filters]);

  // Render dropdown content based on active pill
  const renderDropdownContent = () => {
    switch (activePill) {
      case 'search':
        return (
          <SearchDropdown
            suggestions={suggestions}
            loading={loadingSuggestions}
            searchValue={searchValue}
            onSuggestionPress={onSuggestionPress}
            colors={colors}
          />
        );

      case 'make':
        return (
          <OptionDropdown
            options={facets?.make || []}
            selectedValues={filters.make || []}
            onToggle={(makes) => {
              onFilterSelect('make', makes.length > 0 ? makes : undefined);
              // Clear models if makes changed
              if (makes.length === 0) {
                onFilterSelect('model', undefined);
              }
            }}
            onClear={() => {
              onFilterSelect('make', undefined);
              onFilterSelect('model', undefined);
            }}
            searchPlaceholder="Search makes..."
            emptyMessage="No makes available"
            colors={colors}
          />
        );

      case 'model':
        return filters.make && filters.make.length > 0 ? (
          <OptionDropdown
            options={facets?.model || []}
            selectedValues={filters.model || []}
            onToggle={(models) => {
              onFilterSelect('model', models.length > 0 ? models : undefined);
            }}
            onClear={() => {
              onFilterSelect('model', undefined);
            }}
            searchPlaceholder="Search models..."
            emptyMessage="No models available"
            colors={colors}
          />
        ) : (
          <View style={styles.emptyState} />
        );

      case 'price':
        return (
          <PresetDropdown
            presets={PRICE_PRESETS}
            currentMin={filters.priceMin}
            currentMax={filters.priceMax}
            onSelect={(min, max) => {
              onFilterSelect('priceMin', min);
              onFilterSelect('priceMax', max);
            }}
            onClear={() => {
              onFilterSelect('priceMin', undefined);
              onFilterSelect('priceMax', undefined);
            }}
            title="Price Range"
            clearLabel="Clear Price Filter"
            colors={colors}
          />
        );

      case 'year':
        return (
          <PresetDropdown
            presets={YEAR_PRESETS}
            currentMin={filters.yearMin}
            currentMax={filters.yearMax}
            onSelect={(min, max) => {
              onFilterSelect('yearMin', min);
              onFilterSelect('yearMax', max);
            }}
            onClear={() => {
              onFilterSelect('yearMin', undefined);
              onFilterSelect('yearMax', undefined);
            }}
            title="Year Range"
            clearLabel="Clear Year Filter"
            colors={colors}
          />
        );

      case 'location':
        return (
          <OptionDropdown
            options={facets?.emirate || EMIRATES.map((e) => ({ value: e, count: 0 }))}
            selectedValues={filters.emirate || []}
            onToggle={(emirates) => {
              onFilterSelect('emirate', emirates.length > 0 ? emirates : undefined);
            }}
            onClear={() => {
              onFilterSelect('emirate', undefined);
            }}
            searchPlaceholder="Search locations..."
            emptyMessage="No locations available"
            colors={colors}
          />
        );

      case 'mileage':
        return (
          <PresetDropdown
            presets={MILEAGE_PRESETS}
            currentMin={undefined}
            currentMax={filters.mileageMax}
            onSelect={(_, max) => {
              onFilterSelect('mileageMax', max);
            }}
            onClear={() => {
              onFilterSelect('mileageMax', undefined);
            }}
            title="Max Mileage"
            clearLabel="Clear Mileage Filter"
            colors={colors}
          />
        );

      case 'more':
        return (
          <MoreFiltersDropdown
            filters={filters}
            specs={facets?.specs || []}
            onFilterChange={onFilterSelect}
            colors={colors}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={handleBackdropPress}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        pointerEvents="box-none"
      >
        {/* Safe area spacer - transparent */}
        <View style={{ height: insets.top }} />
        
        {/* Floating Container Box */}
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Row 1: Search Bar + Filters Button */}
          <View style={styles.searchRow}>
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onSubmit={onSearchSubmit}
              onClear={() => onSearchChange('')}
              isExpanded={activePill === 'search'}
              onPress={() => handlePillPress('search')}
              colors={colors}
            />

            {/* Advanced Filters Button */}
            <TouchableOpacity
              style={[
                styles.filtersButton,
                { backgroundColor: hasActiveFilters ? colors.backgroundTertiary : colors.backgroundSecondary },
              ]}
              onPress={onFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={hasActiveFilters ? colors.text : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Filter Pills */}
          <FilterPillsRow
            filters={filters}
            activePill={activePill}
            onPillPress={handlePillPress}
            onClearFilter={handleClearFilter}
            getPillLabel={getPillLabel}
            isPillActive={isPillActive}
            colors={colors}
          />

          {/* Dropdown Content */}
          {isExpanded && (
            <View
              style={[
                styles.dropdownContainer,
                { borderTopColor: colors.border },
                // Fixed height for list-based dropdowns (facets load async)
                (activePill === 'make' || activePill === 'model' || activePill === 'location' || activePill === 'search') && styles.dropdownFixed,
              ]}
            >
              {renderDropdownContent()}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  keyboardView: {
    zIndex: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  filtersButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dropdownFixed: {
    height: ISLAND_CONFIG.DROPDOWN_HEIGHT,
  },
  dropdownContent: {
    flexShrink: 1,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
