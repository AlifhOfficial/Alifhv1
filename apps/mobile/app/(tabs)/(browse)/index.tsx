/**
 * Browse Screen
 * Header + Listings Results
 * 
 * ARCHITECTURE: Uses SearchContext as single source of truth for all filters.
 * No local filter state - all updates go through context.
 */

import { Text } from '@/components/ui';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BROWSE_TOOLBAR_HEIGHT, BrowseToolbar, type FilterPillType } from '@/components/browse';
import { ACTIVE_CHIPS_HEIGHT } from '@/components/layout/active-search-chips';
import {
  MobileHeader,
  getMobileHeaderContentInset,
  getTabBarContentInset,
  getTabBarOverlayHeight,
} from '@/components/layout';
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
import { CarInfoSheet } from '@/components/sheets';
import { CarCardM, CarCardMSkeleton, CarCardList, CarCardListSkeleton } from '@/components/cards';
import { searchApi, type ListingCard, type SearchParams } from '@/lib/search-api';
import { queryKeys } from '@/lib/query-client';
import { consumeDataReady, markInteractionStart, scheduleRenderPerf } from '@/lib/config';
import { Colors, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type FilterParams } from '@/context/search-context';
import { getModelsForMake } from '@/lib/filter-constants';

// ============================================================================
// MODULE-LEVEL PERSISTENCE (survives tab switches, no async/race conditions)
// ============================================================================
let persistedViewMode: ViewMode = 'grid';

// Header height removed — native Stack header handles top inset

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
  exportStatus: f.exportStatus as SearchParams['exportStatus'],
  isNegotiable: f.isNegotiable,
  isBlkListing: f.isBlkListing,
  isBlackTierPartner: f.isBlackTierPartner,
});

function compactSearchParams(params: SearchParams): SearchParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  ) as SearchParams;
}

// ============================================================================
// BROWSE SCREEN
// ============================================================================

export default function BrowseScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT - Single Source of Truth
  // ─────────────────────────────────────────────────────────────────────────
  const { 
    // Search params (make/model/q from search sheet)
    searchParams,
    applySearch,
    clearSearch,
    // Sort
    sortBy,
    // Filters - THE source of truth
    filterParams,
    updateFilterParams,
    // Scroll
    subscribeToScrollToTop, 
  } = useSearch();

  // Scroll ref for auto-scroll to top
  const scrollRef = useRef<FlatList<ListingCard>>(null);

  // Check if we have active search/filter chips
  const hasActiveChips = useMemo(() => {
    const hasSearch = searchParams !== null && Object.keys(searchParams).length > 0;
    const hasFilters = Object.keys(filterParams).length > 0;
    return hasSearch || hasFilters || sortBy !== 'relevance';
  }, [searchParams, filterParams, sortBy]);

  // Build filter context for dynamic facet fetching in sheets
  const filterContext = useMemo(() => filtersToParams(filterParams, searchParams), [filterParams, searchParams]);

  const searchQueryParams = useMemo(
    () => compactSearchParams({
      ...filtersToParams(filterParams, searchParams),
      sortBy,
    }),
    [filterParams, searchParams, sortBy]
  );

  const searchQueryKey = useMemo(
    () => queryKeys.searchInfinite({ ...searchQueryParams, limit: 20 }),
    [searchQueryParams]
  );

  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: searchQueryKey,
    queryFn: ({ pageParam = undefined, signal }) => {
      return searchApi.search({
        ...searchQueryParams,
        cursor: pageParam,
        limit: 20,
      }, signal);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,

  });

  const listings = useMemo(() => {
    if (!data?.pages) return [];

    const seenIds = new Set<string>();
    const merged: ListingCard[] = [];

    for (const page of data.pages) {
      for (const listing of page.listings) {
        if (seenIds.has(listing.id)) continue;
        seenIds.add(listing.id);
        merged.push(listing);
      }
    }

    return merged;
  }, [data?.pages]);

  const hasMore = hasNextPage ?? false;
  const isRefreshing = isRefetching && !isFetchingNextPage;

  // View mode (persisted across tab switches via module-level variable)
  const [viewMode, setViewModeState] = useState<ViewMode>(persistedViewMode);
  const setViewMode = useCallback((mode: ViewMode) => {
    persistedViewMode = mode;
    setViewModeState(mode);
  }, []);

  // Filter sheets visibility
  const [makeSheetVisible, setMakeSheetVisible] = useState(false);
  const [modelSheetVisible, setModelSheetVisible] = useState(false);
  const [priceSheetVisible, setPriceSheetVisible] = useState(false);
  const [yearMileageSheetVisible, setYearMileageSheetVisible] = useState(false);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [settingsSheetVisible, setSettingsSheetVisible] = useState(false);

  // Car info sheet state (AI summary on long-press)
  const [infoSheetVisible, setInfoSheetVisible] = useState(false);
  const [infoSheetListingId, setInfoSheetListingId] = useState<string | null>(null);
  const [infoSheetMeta, setInfoSheetMeta] = useState<{ make?: string; model?: string; year?: number; price?: number; sellerName?: string }>({});

  // Reset scroll instantly when search/filters change (no animation)
  useEffect(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchQueryKey]);

  // Subscribe to scroll to top from tab bar double-tap
  useEffect(() => {
    const unsubscribe = subscribeToScrollToTop(() => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    return unsubscribe;
  }, [subscribeToScrollToTop]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasMore, isFetchingNextPage]);

  const handleCardPress = useCallback((id: string) => {
    markInteractionStart(`listing:${id}`);
    router.push(`/listing/${id}`);
  }, [router]);

  useEffect(() => {
    if (isLoading || listings.length === 0) return;
    const readyAt = consumeDataReady('browse:results') ?? performance.now();
    scheduleRenderPerf('browse.results', readyAt, {
      count: listings.length,
      hasMore,
    });
  }, [isLoading, listings.length, hasMore]);

  // Handle long-press on card — show AI info sheet
  const handleCardLongPress = useCallback((id: string) => {
    const listing = listings.find(l => l.id === id);
    setInfoSheetListingId(id);
    setInfoSheetMeta({
      make: listing?.make,
      model: listing?.model,
      year: listing?.year,
      price: listing?.price,
      sellerName: listing?.partnerName || listing?.sellerName || undefined,
    });
    setInfoSheetVisible(true);
  }, [listings]);

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

  // Handle Browse pill press - scroll to top
  const handleBrowsePress = useCallback(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

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
    exportStatus: filterParams.exportStatus,
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
    count += filterParams.exportStatus?.length ?? 0;
    return count;
  }, [filterParams]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  const tabBarInset = getTabBarContentInset(insets.bottom);
  const toolbarBottomOffset = getTabBarOverlayHeight(insets.bottom) + (hasActiveChips ? ACTIVE_CHIPS_HEIGHT + Spacing.sm : 0);

  const bottomPadding =
    tabBarInset +
    (hasActiveChips ? ACTIVE_CHIPS_HEIGHT + Spacing.sm : 0) +
    BROWSE_TOOLBAR_HEIGHT +
    Spacing['3xl'];

  const renderListing = useCallback(({ item }: { item: ListingCard }) => {
    if (viewMode === 'grid') {
      return (
        <CarCardM
          id={item.id}
          make={item.make}
          model={item.model}
          year={item.year}
          trim={item.trim}
          price={item.price}
          mileage={item.mileage}
          emirate={item.emirate}
          specs={item.specs}
          thumbnail={item.thumbnail}
          isBlkListing={item.isBlkListing}
          partnerName={item.partnerName}
          partnerLogo={item.partnerLogo}
          partnerVerified={item.partnerVerified}
          isBlackTierPartner={item.isBlackTierPartner}
          sellerName={item.sellerName}
          sellerAvatarUrl={item.sellerAvatarUrl}
          kycVerified={item.sellerKycVerified}
          onPress={handleCardPress}
          onLongPress={handleCardLongPress}
        />
      );
    }

    return (
      <CarCardList
        id={item.id}
        make={item.make}
        model={item.model}
        year={item.year}
        trim={item.trim}
        price={item.price}
        mileage={item.mileage}
        emirate={item.emirate}
        specs={item.specs}
        thumbnail={item.thumbnail}
        isBlkListing={item.isBlkListing}
        partnerName={item.partnerName}
        partnerLogo={item.partnerLogo}
        partnerVerified={item.partnerVerified}
        isBlackTierPartner={item.isBlackTierPartner}
        sellerName={item.sellerName}
        sellerAvatarUrl={item.sellerAvatarUrl}
        kycVerified={item.sellerKycVerified}
        onPress={handleCardPress}
      />
    );
  }, [handleCardLongPress, handleCardPress, viewMode]);

  const keyExtractor = useCallback((item: ListingCard) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (isLoading && listings.length === 0) {
      return viewMode === 'grid' ? (
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
      );
    }

    return (
      <View style={styles.empty}>
        <Text variant="body" tone="secondary">No cars found</Text>
      </View>
    );
  }, [isLoading, listings.length, viewMode]);

  const renderFooter = useCallback(() => {
    if (!hasMore || !isFetchingNextPage) return <View style={styles.bottomSpacer} />;

    return (
      <View style={styles.loadingMore}>
        <Text variant="subhead" tone="secondary">Loading...</Text>
      </View>
    );
  }, [hasMore, isFetchingNextPage]);

  const headerInset = getMobileHeaderContentInset(insets.top);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader title="Browse" />
      <FlatList
        ref={scrollRef}
        data={listings}
        key={viewMode}
        renderItem={renderListing}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingTop: headerInset,
          paddingBottom: bottomPadding,
          paddingHorizontal: Spacing.sm,
          flexGrow: listings.length === 0 ? 1 : undefined,
        }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        initialNumToRender={6}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
      />

      {/* Filter Sheets (modals — don't affect layout) */}
      <MakeFilterSheet
        visible={makeSheetVisible}
        onClose={() => setMakeSheetVisible(false)}
        selected={searchParams?.make ?? []}
        filterContext={filterContext}
        onApply={handleMakeApply}
      />
      <ModelFilterSheet
        visible={modelSheetVisible}
        onClose={() => setModelSheetVisible(false)}
        selectedMakes={searchParams?.make ?? []}
        selected={searchParams?.model ?? []}
        filterContext={filterContext}
        onApply={handleModelApply}
      />
      <PriceFilterSheet
        visible={priceSheetVisible}
        onClose={() => setPriceSheetVisible(false)}
        priceMin={filterParams.priceMin}
        priceMax={filterParams.priceMax}
        onApply={handlePriceApply}
      />
      <YearMileageFilterSheet
        visible={yearMileageSheetVisible}
        onClose={() => setYearMileageSheetVisible(false)}
        yearMin={filterParams.yearMin}
        yearMax={filterParams.yearMax}
        mileageMin={filterParams.mileageMin}
        mileageMax={filterParams.mileageMax}
        onApply={handleYearMileageApply}
      />
      <LocationFilterSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
        selected={filterParams.emirate ?? []}
        filterContext={filterContext}
        onApply={handleLocationApply}
      />
      <MoreFiltersSheet
        visible={settingsSheetVisible}
        onClose={() => setSettingsSheetVisible(false)}
        filters={moreFiltersState}
        filterContext={filterContext}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onApply={handleMoreFiltersApply}
      />
      <CarInfoSheet
        visible={infoSheetVisible}
        onClose={() => setInfoSheetVisible(false)}
        listingId={infoSheetListingId}
        make={infoSheetMeta.make}
        model={infoSheetMeta.model}
        year={infoSheetMeta.year}
        price={infoSheetMeta.price}
        sellerName={infoSheetMeta.sellerName}
      />

      <BrowseToolbar
        pills={filterPillConfigs}
        onPillPress={handleFilterPillPress}
        onSettingsPress={handleSettingsPress}
        settingsCount={moreFiltersCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        bottomOffset={toolbarBottomOffset}
      />
    </View>
  );
}
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
  bottomSpacer: {
    height: Spacing.lg,
  },
});
