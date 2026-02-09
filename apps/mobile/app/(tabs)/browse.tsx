/**
 * Browse Screen
 * Header + Listings Results
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DisplayArea, ACTIVE_CHIPS_HEIGHT, TopSafeAreaGradient } from '@/components/layout';
import { FilterPills, type FilterPillType } from '@/components/home';
import { 
  PriceFilterSheet, 
  YearMileageFilterSheet, 
  LocationFilterSheet, 
  MoreFiltersSheet,
  type ViewMode,
  type MoreFiltersState,
} from '@/components/sheets';
import { CarCardM, CarCardMSkeleton, CarCardList, CarCardListSkeleton } from '@/components/cards';
import { LogoLoader, Heading } from '@/components/ui';
import { api, type ListingCard, type SearchParams, type SearchFacets, type SearchSortOption } from '@/lib/api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';

// ============================================================================
// TYPES
// ============================================================================

type Filters = {
  make?: string[];
  model?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  emirate?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  sellerType?: 'dealer' | 'private';
  [key: string]: string | string[] | number | boolean | undefined;
};

// Convert local filters to API params
const filtersToParams = (f: Filters, q?: string): SearchParams => ({
  q,
  make: f.make?.join(','),
  model: f.model?.join(','),
  yearMin: f.yearMin,
  yearMax: f.yearMax,
  priceMin: f.priceMin,
  priceMax: f.priceMax,
  mileageMax: f.mileageMax,
  emirate: f.emirate?.join(','),
  bodyType: f.bodyType?.join(','),
  fuelType: f.fuelType?.join(','),
  transmission: f.transmission?.join(','),
  specs: f.specs?.join(','),
  condition: f.condition,
  isNegotiable: f.isNegotiable,
  isBlkListing: f.isBlkListing,
  isBlackTierPartner: f.isBlackTierPartner,
  // Note: sellerType is managed locally but may need backend support
});

// ============================================================================
// BROWSE SCREEN
// ============================================================================

export default function BrowseScreen() {
  const { colorScheme } = useTheme();
  const { subscribeToSearch, subscribeToSort, subscribeToScrollToTop, sortBy: contextSortBy, searchParams: contextSearchParams } = useSearch();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Scroll ref for auto-scroll to top
  const scrollRef = useRef<ScrollView>(null);

  // Check if we have active search chips
  const hasActiveChips = contextSearchParams !== null && Object.keys(contextSearchParams).length > 0;

  // Search
  const [query, setQuery] = useState('');

  // Filters & Sort
  const [filters, setFilters] = useState<Filters>({});
  const [facets, setFacets] = useState<SearchFacets | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SearchSortOption>(contextSortBy);

  // Results
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter sheets visibility
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);
  const [yearMileageSheetVisible, setYearMileageSheetVisible] = useState(false);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [settingsSheetVisible, setSettingsSheetVisible] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async (currentFilters: Filters, searchQuery?: string, sort?: SearchSortOption, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(1);
      }

      const response = await api.search({
        ...filtersToParams(currentFilters, searchQuery),
        sortBy: sort || sortBy,
        page: reset ? 1 : page,
        limit: 20,
      });

      setListings((prev) => {
        if (reset) return response.listings;
        // Deduplicate by ID when appending
        const existingIds = new Set(prev.map(l => l.id));
        const newListings = response.listings.filter(l => !existingIds.has(l.id));
        return [...prev, ...newListings];
      });
      setFacets(response.facets);
      setTotal(response.meta.total);
      setHasMore(response.meta.hasMore);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, sortBy]);

  // Initial load
  useEffect(() => {
    fetchListings({}, undefined, sortBy, true);
  }, []);

  // Subscribe to search from global search sheet
  useEffect(() => {
    const unsubscribe = subscribeToSearch((searchParams) => {
      // Apply search params
      const newFilters: Filters = {};
      
      // Handle array-based search params from SearchSheet
      if (searchParams.make?.length) {
        newFilters.make = searchParams.make;
      }
      if (searchParams.model?.length) {
        newFilters.model = searchParams.model;
      }
      
      setFilters(newFilters);
      setQuery(searchParams.q || '');
      fetchListings(newFilters, searchParams.q, sortBy, true);

      // Auto-scroll to top when search is applied
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [subscribeToSearch, sortBy, fetchListings]);

  // Subscribe to sort from global sort sheet
  useEffect(() => {
    const unsubscribe = subscribeToSort((newSort) => {
      setSortBy(newSort);
      // Immediately fetch with new sort
      fetchListings(filters, query, newSort, true);
    });

    return unsubscribe;
  }, [subscribeToSort, filters, query, fetchListings]);

  // Subscribe to scroll to top from tab bar double-tap
  useEffect(() => {
    const unsubscribe = subscribeToScrollToTop(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return unsubscribe;
  }, [subscribeToScrollToTop]);

  // Re-fetch when filters change (debounced)
  useEffect(() => {
    const hasFilters = Object.keys(filters).length > 0;
    if (!hasFilters && !query) return;
    
    const timer = setTimeout(() => {
      fetchListings(filters, query, sortBy, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleSearch = () => {
    fetchListings(filters, query, sortBy, true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    setQuery('');
    fetchListings({}, undefined, sortBy, true);
  };

  const handleSortChange = (newSort: SearchSortOption) => {
    setSortBy(newSort);
    fetchListings(filters, query, newSort, true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchListings(filters, query, sortBy, true);
  };

  const isLoadingMore = useRef(false);
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore.current) {
      isLoadingMore.current = true;
      setPage((p) => p + 1);
      fetchListings(filters, query, sortBy, false).finally(() => {
        isLoadingMore.current = false;
      });
    }
  }, [hasMore, isLoading, filters, query, sortBy, fetchListings]);

  const handleCardPress = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleFavoritePress = useCallback((id: string) => {
    // TODO: Wire up to favorites hook
    console.log('Favorite:', id);
  }, []);

  // Handle filter pill press
  const handleFilterPillPress = useCallback((type: FilterPillType) => {
    switch (type) {
      case 'price':
        setPriceSheetVisible(true);
        break;
      case 'yearMileage':
        setYearMileageSheetVisible(true);
        break;
      case 'location':
        setLocationSheetVisible(true);
        break;
    }
  }, []);

  // Handle price filter apply
  const handlePriceApply = useCallback((priceMin?: number, priceMax?: number) => {
    setFilters(prev => ({
      ...prev,
      priceMin,
      priceMax,
    }));
  }, []);

  // Handle year/mileage filter apply
  const handleYearMileageApply = useCallback((values: {
    yearMin?: number;
    yearMax?: number;
    mileageMin?: number;
    mileageMax?: number;
  }) => {
    setFilters(prev => ({
      ...prev,
      ...values,
    }));
  }, []);

  // Handle location filter apply
  const handleLocationApply = useCallback((emirate: string[]) => {
    setFilters(prev => ({
      ...prev,
      emirate: emirate.length > 0 ? emirate : undefined,
    }));
  }, []);

  // Handle more filters apply
  const handleMoreFiltersApply = useCallback((moreFilters: MoreFiltersState) => {
    setFilters(prev => ({
      ...prev,
      condition: moreFilters.condition,
      isBlkListing: moreFilters.isBlkListing,
      isBlackTierPartner: moreFilters.isBlackTierPartner,
      isNegotiable: moreFilters.isNegotiable,
      specs: moreFilters.specs,
      bodyType: moreFilters.bodyType,
      fuelType: moreFilters.fuelType,
      transmission: moreFilters.transmission,
      sellerType: moreFilters.sellerType,
    }));
  }, []);

  // Calculate filter counts for pills
  const filterPillConfigs = useMemo(() => {
    const priceCount = (filters.priceMin || filters.priceMax) ? 1 : 0;
    const yearMileageCount = 
      ((filters.yearMin || filters.yearMax) ? 1 : 0) + 
      ((filters.mileageMin || filters.mileageMax) ? 1 : 0);
    const locationCount = filters.emirate?.length ?? 0;

    return [
      { type: 'price' as FilterPillType, label: 'Price', activeCount: priceCount },
      { type: 'yearMileage' as FilterPillType, label: 'Year & Km', activeCount: yearMileageCount },
      { type: 'location' as FilterPillType, label: 'Location', activeCount: locationCount },
    ];
  }, [filters]);

  // Build more filters state from current filters
  const moreFiltersState: MoreFiltersState = useMemo(() => ({
    condition: filters.condition,
    isBlkListing: filters.isBlkListing,
    isBlackTierPartner: filters.isBlackTierPartner,
    isNegotiable: filters.isNegotiable,
    specs: filters.specs,
    bodyType: filters.bodyType,
    fuelType: filters.fuelType,
    transmission: filters.transmission,
    sellerType: filters.sellerType,
  }), [filters]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top safe area gradient */}
      <TopSafeAreaGradient />

      {/* Header with Filter Pills inline */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Heading size="large">Browse</Heading>
        <FilterPills 
          pills={filterPillConfigs}
          onPillPress={handleFilterPillPress}
          onSettingsPress={() => setSettingsSheetVisible(true)}
        />
      </View>

      {/* Price Filter Sheet */}
      <PriceFilterSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        onApply={handlePriceApply}
      />

      {/* Year & Mileage Filter Sheet */}
      <YearMileageFilterSheet
        visible={yearMileageSheetVisible}
        onClose={() => setYearMileageSheetVisible(false)}
        yearMin={filters.yearMin}
        yearMax={filters.yearMax}
        mileageMin={filters.mileageMin}
        mileageMax={filters.mileageMax}
        onApply={handleYearMileageApply}
      />

      {/* Location Filter Sheet */}
      <LocationFilterSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
        options={facets?.emirate ?? []}
        selected={filters.emirate ?? []}
        onApply={handleLocationApply}
      />

      {/* Settings & More Filters Sheet */}
      <MoreFiltersSheet
        visible={settingsSheetVisible}
        onClose={() => setSettingsSheetVisible(false)}
        filters={moreFiltersState}
        facets={{
          specs: facets?.specs,
          bodyType: facets?.bodyType,
          fuelType: facets?.fuelType,
          transmission: facets?.transmission,
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onApply={handleMoreFiltersApply}
      />

      {/* Listings */}
      <DisplayArea
        ref={scrollRef}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        horizontalPadding="sm"
        verticalPadding="sm"
        extraBottomPadding={hasActiveChips ? ACTIVE_CHIPS_HEIGHT + 8 : 0}
      >
        {isLoading && (!listings || listings.length === 0) ? (
          viewMode === 'grid' ? (
            <>
              <CarCardMSkeleton />
              <CarCardMSkeleton />
              <CarCardMSkeleton />
            </>
          ) : (
            <>
              <CarCardListSkeleton />
              <CarCardListSkeleton />
              <CarCardListSkeleton />
              <CarCardListSkeleton />
              <CarCardListSkeleton />
            </>
          )
        ) : !listings || listings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No cars found</Text>
          </View>
        ) : (
          <>
            {viewMode === 'grid' ? (
              // Grid View - Original Card Layout
              listings.map((listing, index) => (
                <CarCardM
                  key={`${listing.id}-${index}`}
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
                  onPress={handleCardPress}
                  onFavoritePress={handleFavoritePress}
                />
              ))
            ) : (
              // List View - Compact Layout
              listings.map((listing, index) => (
                <CarCardList
                  key={`${listing.id}-${index}`}
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
                  onPress={handleCardPress}
                  onFavoritePress={handleFavoritePress}
                />
              ))
            )}

            {hasMore && isLoading && (
              <View style={styles.loadingMore}>
                <LogoLoader size={40} />
              </View>
            )}
          </>
        )}
      </DisplayArea>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.bodyLarge,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
