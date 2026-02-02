/**
 * Search Screen
 * Dynamic Island search (contains filter pills) + Results
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisplayArea } from '@/components/layout';
import { CarCardM, CarCardMSkeleton } from '@/components/cards';
import {
  DynamicIsland,
  AdvancedFiltersSheet,
  ISLAND_CONFIG,
  type ActivePill,
} from '@/components/search';
import { api, type ListingCard, type SearchParams, type SearchFacets, type Suggestion } from '@/lib/api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ============================================================================
// TYPES
// ============================================================================

type Filters = {
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  emirate?: string;
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  mileageMax?: number;
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  [key: string]: string | number | string[] | boolean | undefined;
};

// Convert local filters to API params
const filtersToParams = (f: Filters, q?: string): SearchParams => ({
  q,
  make: f.make,
  model: f.model,
  yearMin: f.yearMin,
  yearMax: f.yearMax,
  priceMin: f.priceMin,
  priceMax: f.priceMax,
  mileageMax: f.mileageMax,
  emirate: f.emirate,
  bodyType: f.bodyType?.join(','),
  fuelType: f.fuelType?.join(','),
  transmission: f.transmission?.join(','),
  specs: f.specs?.join(','),
});

// ============================================================================
// SEARCH SCREEN
// ============================================================================

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  // Estimate collapsed dynamic island height for content offset
  // This is approximate since container is now adaptive
  const dynamicIslandHeight = insets.top + Spacing.sm + 120; // ~safe area + margin + search + pills

  // Search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Active pill (for dynamic island dropdown)
  const [activePill, setActivePill] = useState<ActivePill>(null);

  // Filters
  const [filters, setFilters] = useState<Filters>({});
  const [facets, setFacets] = useState<SearchFacets | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Results
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // ──────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async (currentFilters: Filters, searchQuery?: string, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(1);
      }

      const response = await api.search({
        ...filtersToParams(currentFilters, searchQuery),
        page: reset ? 1 : page,
        limit: 20,
      });

      setListings((prev) => (reset ? response.listings : [...prev, ...response.listings]));
      setFacets(response.facets);
      setTotal(response.meta.total);
      setHasMore(response.meta.hasMore);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      try {
        setLoadingSuggestions(true);
        const response = await api.popularMakes(5);
        setSuggestions(response.suggestions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSuggestions(false);
      }
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await api.suggest(q, { make: filters.make, model: filters.model });
      setSuggestions(response.suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [filters.make, filters.model]);

  // Initial load
  useEffect(() => {
    fetchListings({}, undefined, true);
  }, []);

  // Re-fetch when filters change (debounced)
  useEffect(() => {
    // Skip initial render
    const hasFilters = Object.keys(filters).length > 0;
    if (!hasFilters && !query) return;
    
    const timer = setTimeout(() => {
      fetchListings(filters, query, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // Debounced suggestions
  useEffect(() => {
    if (activePill === 'search') {
      const timer = setTimeout(() => fetchSuggestions(query), 300);
      return () => clearTimeout(timer);
    }
  }, [query, activePill, fetchSuggestions]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleSearch = () => {
    setActivePill(null);
    fetchListings(filters, query, true);
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    setActivePill(null);

    if (suggestion.type === 'make') {
      const newFilters = { ...filters, make: suggestion.make, model: undefined };
      setFilters(newFilters);
      setQuery(suggestion.text);
      fetchListings(newFilters, suggestion.text, true);
    } else if (suggestion.type === 'model' || suggestion.type === 'make_model') {
      const newFilters = { ...filters, make: suggestion.make, model: suggestion.model };
      setFilters(newFilters);
      setQuery(suggestion.text);
      fetchListings(newFilters, suggestion.text, true);
    } else if (suggestion.type === 'make_model_trim') {
      const newFilters = { ...filters, make: suggestion.make, model: suggestion.model };
      setFilters(newFilters);
      setQuery(suggestion.text);
      fetchListings(newFilters, suggestion.text, true);
    } else if (suggestion.type === 'partner') {
      setQuery(suggestion.text);
      fetchListings({}, suggestion.text, true);
    }
  };

  const handleFilterSelect = (key: string, value: any) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === '') {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleClearAdvancedFilters = () => {
    setFilters((prev) => ({
      make: prev.make,
      model: prev.model,
      priceMin: prev.priceMin,
      priceMax: prev.priceMax,
      yearMin: prev.yearMin,
      yearMax: prev.yearMax,
      emirate: prev.emirate,
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchListings(filters, query, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((p) => p + 1);
      fetchListings(filters, query, false);
    }
  };

  // Count advanced filters
  const advancedFilterCount =
    (filters.bodyType?.length || 0) +
    (filters.fuelType?.length || 0) +
    (filters.transmission?.length || 0) +
    (filters.specs?.length || 0) +
    (filters.mileageMax ? 1 : 0) +
    (filters.condition ? 1 : 0) +
    (filters.isNegotiable ? 1 : 0);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic Island Search */}
      <DynamicIsland
        searchValue={query}
        onSearchChange={setQuery}
        onSearchSubmit={handleSearch}
        suggestions={suggestions}
        loadingSuggestions={loadingSuggestions}
        onSuggestionPress={handleSuggestionPress}
        activePill={activePill}
        onActivePillChange={setActivePill}
        facets={facets}
        filters={filters}
        onFilterSelect={handleFilterSelect}
        onFilterPress={() => setShowAdvancedFilters(true)}
        hasActiveFilters={advancedFilterCount > 0}
        colors={colors}
      />

      {/* Content - offset by dynamic island height */}
      <View style={[styles.contentWrapper, { paddingTop: dynamicIslandHeight }]}>
        {/* Results count */}
        {!isLoading && (
          <View style={styles.resultsRow}>
            <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
              {total.toLocaleString()} results
            </Text>
          </View>
        )}

        {/* Listings */}
        <DisplayArea
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          horizontalPadding="lg"
          verticalPadding="sm"
        >
          {isLoading && (!listings || listings.length === 0) ? (
            <>
              <CarCardMSkeleton />
              <CarCardMSkeleton />
              <CarCardMSkeleton />
            </>
          ) : !listings || listings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No cars found</Text>
            </View>
          ) : (
            <>
              {listings.map((listing) => (
                <CarCardM
                  key={listing.id}
                  id={listing.id}
                  make={listing.make}
                  model={listing.model}
                  year={listing.year}
                  trim={listing.trim}
                  price={listing.price}
                  mileage={listing.mileage}
                  emirate={listing.emirate}
                  specs={listing.specs}
                  thumbnail={listing.thumbnail}
                  isBlkListing={listing.isBlkListing}
                  partnerName={listing.partnerName}
                  partnerLogo={listing.partnerLogo}
                  partnerVerified={listing.partnerVerified}
                  isBlackTierPartner={listing.isBlackTierPartner}
                  sellerName={listing.sellerName}
                  sellerAvatarUrl={listing.sellerAvatarUrl}
                  kycVerified={listing.sellerKycVerified}
                  onPress={(id) => console.log('View:', id)}
                  onFavoritePress={(id) => console.log('Fav:', id)}
                  onSuperlikePress={(id) => console.log('Super:', id)}
                />
              ))}

              {hasMore && (
                <TouchableOpacity style={styles.loadMore} onPress={handleLoadMore}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load more</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </DisplayArea>
      </View>

      {/* Advanced Filters Sheet */}
      <AdvancedFiltersSheet
        visible={showAdvancedFilters}
        onClose={() => {
          setShowAdvancedFilters(false);
          fetchListings(filters, query, true);
        }}
        filters={filters}
        facets={facets}
        onFilterChange={handleFilterSelect}
        onClearAll={handleClearAdvancedFilters}
        colors={colors}
      />
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
  contentWrapper: {
    flex: 1,
  },
  resultsRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  resultsText: {
    ...Typography.footnote,
    fontFamily: 'Inter_500Medium',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.body,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  loadMoreText: {
    ...Typography.buttonMedium,
    fontFamily: 'Inter_600SemiBold',
  },
});
