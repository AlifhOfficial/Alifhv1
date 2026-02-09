/**
 * Browse Screen
 * Header + Listings Results
 * 
 * ARCHITECTURE: Uses SearchContext as single source of truth for all filters.
 * No local filter state - all updates go through context.
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
import { searchApi, type ListingCard, type SearchParams, type SearchFacets, type SearchSortOption } from '@/lib/search-api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type FilterParams } from '@/context/search-context';

// ============================================================================
// HELPERS
// ============================================================================

// Convert context filter params to API params
// Note: Mobile uses string[] for filter arrays, cast to database literal types
const filtersToParams = (f: FilterParams, searchParams: { make?: string[]; model?: string[]; q?: string } | null): SearchParams => ({
  q: searchParams?.q,
  make: searchParams?.make,
  model: searchParams?.model,
  yearMin: f.yearMin,
  yearMax: f.yearMax,
  priceMin: f.priceMin,
  priceMax: f.priceMax,
  mileageMax: f.mileageMax,
  emirate: f.emirate,
  bodyType: f.bodyType as SearchParams['bodyType'],
  fuelType: f.fuelType as SearchParams['fuelType'],
  transmission: f.transmission as SearchParams['transmission'],
  specs: f.specs as SearchParams['specs'],
  condition: f.condition,
  isNegotiable: f.isNegotiable,
  isBlkListing: f.isBlkListing,
  isBlackTierPartner: f.isBlackTierPartner,
});

// ============================================================================
// BROWSE SCREEN
// ============================================================================

export default function BrowseScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT - Single Source of Truth
  // ─────────────────────────────────────────────────────────────────────────
  const { 
    // Search params (make/model/q from search sheet)
    searchParams,
    subscribeToSearch,
    // Sort
    sortBy,
    subscribeToSort, 
    // Filters - THE source of truth
    filterParams,
    updateFilterParams,
    // Scroll
    subscribeToScrollToTop, 
  } = useSearch();

  // Scroll ref for auto-scroll to top
  const scrollRef = useRef<ScrollView>(null);

  // Check if we have active search/filter chips
  const hasActiveChips = useMemo(() => {
    const hasSearch = searchParams !== null && Object.keys(searchParams).length > 0;
    const hasFilters = Object.keys(filterParams).length > 0;
    return hasSearch || hasFilters || sortBy !== 'relevance';
  }, [searchParams, filterParams, sortBy]);

  // Results state (not filters - those come from context)
  const [facets, setFacets] = useState<SearchFacets | undefined>(undefined);
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const requestIdRef = useRef(0);

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

  // Fetch listings - reads from latest context values
  const fetchListingsStable = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setIsLoading(true);
      setPage(1);
      // Clear listings immediately to show skeletons (prevents stale cards)
      setListings([]);

      const params = {
        ...filtersToParams(filterParams, searchParams),
        sortBy: sortBy,
        page: 1,
        limit: 20,
      };
      
      console.log('[Browse] Fetching with params:', params);

      const response = await searchApi.search(params);

      if (requestId !== requestIdRef.current) {
        return;
      }

      console.log('[Browse] Response facets:', response.facets ? Object.keys(response.facets) : 'none');

      setListings(response.listings);
      setFacets(response.facets);
      setTotal(response.meta.total);
      setHasMore(response.meta.hasMore);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [filterParams, searchParams, sortBy]);

  // Re-fetch when filters change and scroll to top
  useEffect(() => {
    fetchListingsStable();
    // Scroll to top when filters change
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  }, [fetchListingsStable]);

  // Subscribe to scroll to top from tab bar double-tap
  useEffect(() => {
    const unsubscribe = subscribeToScrollToTop(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return unsubscribe;
  }, [subscribeToScrollToTop]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchListingsStable();
  }, [fetchListingsStable]);

  const isLoadingMore = useRef(false);
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoading && !isLoadingMore.current) {
      isLoadingMore.current = true;
      const requestId = ++requestIdRef.current;
      const nextPage = page + 1;
      
      try {
        const response = await searchApi.search({
          ...filtersToParams(filterParams, searchParams),
          sortBy: sortBy,
          page: nextPage,
          limit: 20,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setListings((prev) => {
          const existingIds = new Set(prev.map(l => l.id));
          const newListings = response.listings.filter(l => !existingIds.has(l.id));
          return [...prev, ...newListings];
        });
        setPage(nextPage);
        setHasMore(response.meta.hasMore);
      } catch (error) {
        console.error('Load more error:', error);
      } finally {
        isLoadingMore.current = false;
      }
    }
  }, [hasMore, isLoading, page, filterParams, searchParams, sortBy]);

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

  // Handle price filter apply - updates context (single source of truth)
  const handlePriceApply = useCallback((priceMin?: number, priceMax?: number) => {
    updateFilterParams({ priceMin, priceMax });
  }, [updateFilterParams]);

  // Handle year/mileage filter apply - updates context
  const handleYearMileageApply = useCallback((values: {
    yearMin?: number;
    yearMax?: number;
    mileageMin?: number;
    mileageMax?: number;
  }) => {
    updateFilterParams(values);
  }, [updateFilterParams]);

  // Handle location filter apply - updates context
  const handleLocationApply = useCallback((emirate: string[]) => {
    updateFilterParams({ emirate: emirate.length > 0 ? emirate : undefined });
  }, [updateFilterParams]);

  // Handle more filters apply - updates context
  const handleMoreFiltersApply = useCallback((moreFilters: MoreFiltersState) => {
    updateFilterParams(moreFilters);
  }, [updateFilterParams]);

  // Calculate filter counts for pills (read from context)
  const filterPillConfigs = useMemo(() => {
    const priceCount = (filterParams.priceMin || filterParams.priceMax) ? 1 : 0;
    const yearMileageCount = 
      ((filterParams.yearMin || filterParams.yearMax) ? 1 : 0) + 
      ((filterParams.mileageMin || filterParams.mileageMax) ? 1 : 0);
    const locationCount = filterParams.emirate?.length ?? 0;

    return [
      { type: 'price' as FilterPillType, label: 'Price', activeCount: priceCount },
      { type: 'yearMileage' as FilterPillType, label: 'Year & Km', activeCount: yearMileageCount },
      { type: 'location' as FilterPillType, label: 'Location', activeCount: locationCount },
    ];
  }, [filterParams]);

  // Build more filters state from context
  const moreFiltersState: MoreFiltersState = useMemo(() => ({
    condition: filterParams.condition,
    isBlkListing: filterParams.isBlkListing,
    isBlackTierPartner: filterParams.isBlackTierPartner,
    isNegotiable: filterParams.isNegotiable,
    specs: filterParams.specs,
    bodyType: filterParams.bodyType,
    fuelType: filterParams.fuelType,
    transmission: filterParams.transmission,
    sellerType: filterParams.sellerType,
  }), [filterParams]);

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

      {/* Price Filter Sheet - reads from context */}
      <PriceFilterSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        priceMin={filterParams.priceMin}
        priceMax={filterParams.priceMax}
        onApply={handlePriceApply}
      />

      {/* Year & Mileage Filter Sheet - reads from context */}
      <YearMileageFilterSheet
        visible={yearMileageSheetVisible}
        onClose={() => setYearMileageSheetVisible(false)}
        yearMin={filterParams.yearMin}
        yearMax={filterParams.yearMax}
        mileageMin={filterParams.mileageMin}
        mileageMax={filterParams.mileageMax}
        onApply={handleYearMileageApply}
      />

      {/* Location Filter Sheet - reads from context */}
      <LocationFilterSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
        options={facets?.emirate ?? []}
        selected={filterParams.emirate ?? []}
        onApply={handleLocationApply}
      />

      {/* Settings & More Filters Sheet - reads from context */}
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
