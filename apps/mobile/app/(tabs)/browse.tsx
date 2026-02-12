/**
 * Browse Screen
 * Header + Listings Results
 * 
 * ARCHITECTURE: Uses SearchContext as single source of truth for all filters.
 * No local filter state - all updates go through context.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DisplayArea, ACTIVE_CHIPS_HEIGHT, TopSafeAreaGradient } from '@/components/layout';
import { BrowseHeader, type FilterPillType } from '@/components/browse';
import { 
  MakeFilterSheet,
  ModelFilterSheet,
  PriceFilterSheet, 
  YearMileageFilterSheet, 
  LocationFilterSheet, 
  MoreFiltersSheet,
  type ViewMode,
  type MoreFiltersState,
} from '@/components/sheets';
import { CarCardM, CarCardMSkeleton, CarCardList, CarCardListSkeleton } from '@/components/cards';
import { LogoLoader, Body } from '@/components/ui';
import { searchApi, type ListingCard, type SearchParams, type SearchFacets, type SearchSortOption } from '@/lib/search-api';
import { Colors, Spacing, Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type FilterParams } from '@/context/search-context';
import { getModelsForMake } from '@/lib/filter-constants';

// ============================================================================
// HELPERS
// ============================================================================

// Convert context filter params to API params
// Note: Mobile uses string[] for filter arrays, cast to database literal types
const filtersToParams = (f: FilterParams, searchParams: { make?: string[]; model?: string[]; trim?: string[]; tags?: string[]; extras?: string[]; q?: string; partnerId?: string; partnerName?: string; sellerId?: string; sellerName?: string } | null): SearchParams => ({
  q: searchParams?.q,
  make: searchParams?.make,
  model: searchParams?.model,
  trim: searchParams?.trim,
  tags: searchParams?.tags,
  extras: searchParams?.extras,
  partnerId: searchParams?.partnerId,
  sellerId: searchParams?.sellerId,
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
  exteriorColor: f.exteriorColor as SearchParams['exteriorColor'],
  interiorColor: f.interiorColor as SearchParams['interiorColor'],
  engineSize: f.engineSize as SearchParams['engineSize'],
  condition: f.condition,
  sellerType: f.sellerType,
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
    applySearch,
    clearSearch,
    subscribeToSearch,
    // Sort
    sortBy,
    applySort,
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

  // Build filter context for dynamic facet fetching in sheets
  const filterContext = useMemo(() => filtersToParams(filterParams, searchParams), [filterParams, searchParams]);

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
  const [makeSheetVisible, setMakeSheetVisible] = useState(false);
  const [modelSheetVisible, setModelSheetVisible] = useState(false);
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



  // Handle filter pill press
  const handleFilterPillPress = useCallback((type: FilterPillType) => {
    switch (type) {
      case 'make':
        setMakeSheetVisible(true);
        break;
      case 'model':
        setModelSheetVisible(true);
        break;
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

  // Stable callbacks for FilterPills (prevents ScrollView scroll-reset)
  const handleSettingsPress = useCallback(() => setSettingsSheetVisible(true), []);

  // Handle make filter apply — updates searchParams in context
  const handleMakeApply = useCallback((makes: string[]) => {
    const current = searchParams ?? {};
    if (makes.length > 0) {
      // If makes changed, clear models that no longer belong
      const currentModels = current.model ?? [];
      const validModels = currentModels.filter((m: string) =>
        makes.some((mk: string) => (getModelsForMake(mk) as readonly string[]).includes(m))
      );
      applySearch({ ...current, make: makes, model: validModels.length > 0 ? validModels : undefined });
    } else {
      // Clear make + model + trim
      const { make, model, trim, ...rest } = current;
      if (Object.keys(rest).length > 0) {
        applySearch(rest);
      } else {
        clearSearch();
      }
    }
  }, [searchParams, applySearch, clearSearch]);

  // Handle model filter apply — updates searchParams in context
  const handleModelApply = useCallback((models: string[]) => {
    const current = searchParams ?? {};
    if (models.length > 0) {
      applySearch({ ...current, model: models });
    } else {
      const { model, trim, ...rest } = current;
      if (Object.keys(rest).length > 0) {
        applySearch(rest);
      } else {
        clearSearch();
      }
    }
  }, [searchParams, applySearch, clearSearch]);

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
    const makeCount = searchParams?.make?.length ?? 0;
    const modelCount = searchParams?.model?.length ?? 0;
    const priceCount = (filterParams.priceMin || filterParams.priceMax) ? 1 : 0;
    const yearMileageCount = 
      ((filterParams.yearMin || filterParams.yearMax) ? 1 : 0) + 
      ((filterParams.mileageMin || filterParams.mileageMax) ? 1 : 0);
    const locationCount = filterParams.emirate?.length ?? 0;

    return [
      { type: 'make' as FilterPillType, label: 'Make', activeCount: makeCount },
      { type: 'model' as FilterPillType, label: 'Model', activeCount: modelCount },
      { type: 'price' as FilterPillType, label: 'Price', activeCount: priceCount },
      { type: 'yearMileage' as FilterPillType, label: 'Year & Km', activeCount: yearMileageCount },
      { type: 'location' as FilterPillType, label: 'Location', activeCount: locationCount },
    ];
  }, [filterParams, searchParams]);

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
    exteriorColor: filterParams.exteriorColor,
    interiorColor: filterParams.interiorColor,
    engineSize: filterParams.engineSize,
    sellerType: filterParams.sellerType,
  }), [filterParams]);

  const moreFiltersCount = useMemo(() => {
    let count = 0;
    if (filterParams.condition) count++;
    if (filterParams.isBlkListing) count++;
    if (filterParams.isBlackTierPartner) count++;
    if (filterParams.isNegotiable) count++;
    count += filterParams.specs?.length ?? 0;
    count += filterParams.bodyType?.length ?? 0;
    count += filterParams.fuelType?.length ?? 0;
    count += filterParams.transmission?.length ?? 0;
    count += filterParams.exteriorColor?.length ?? 0;
    count += filterParams.interiorColor?.length ?? 0;
    count += filterParams.engineSize?.length ?? 0;
    if (filterParams.sellerType) count++;
    return count;
  }, [filterParams]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Top safe area gradient behind pills */}
      <TopSafeAreaGradient />

      {/* Browse Header with Filter Pills */}
      <BrowseHeader 
        pills={filterPillConfigs}
        onPillPress={handleFilterPillPress}
        onSettingsPress={handleSettingsPress}
        settingsCount={moreFiltersCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Make Filter Sheet - reads from searchParams */}
      <MakeFilterSheet
        visible={makeSheetVisible}
        onClose={() => setMakeSheetVisible(false)}
        selected={searchParams?.make ?? []}
        filterContext={filterContext}
        onApply={handleMakeApply}
      />

      {/* Model Filter Sheet - reads from searchParams */}
      <ModelFilterSheet
        visible={modelSheetVisible}
        onClose={() => setModelSheetVisible(false)}
        selectedMakes={searchParams?.make ?? []}
        selected={searchParams?.model ?? []}
        filterContext={filterContext}
        onApply={handleModelApply}
      />

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
        selected={filterParams.emirate ?? []}
        filterContext={filterContext}
        onApply={handleLocationApply}
      />

      {/* Settings & More Filters Sheet - reads from context */}
      <MoreFiltersSheet
        visible={settingsSheetVisible}
        onClose={() => setSettingsSheetVisible(false)}
        filters={moreFiltersState}
        filterContext={filterContext}
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
            <Body size="large" tone="secondary">No cars found</Body>
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
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
