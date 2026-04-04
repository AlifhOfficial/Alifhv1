/**
 * Browse Screen
 * Header + Listings Results
 * 
 * ARCHITECTURE: Uses SearchContext as single source of truth for all filters.
 * No local filter state - all updates go through context.
 */

import { Text, HapticRefreshControl, EmptyState } from '@/components/ui';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, FlatList, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchX } from 'lucide-react-native';

import { BrowseTabBar, type FilterPillType } from '@/components/browse';
import {
  ACTIVE_CHIPS_HEIGHT,
  MobileHeader,
  getMobileHeaderContentInset,
  getTabBarContentInset,
  getTabBarOverlayHeight,
} from '@/components/layout';
import { CarCardM, CarCardMSkeleton, CarCardList, CarCardListSkeleton } from '@/components/cards';
import { searchApi, type ListingCard, type SearchParams } from '@/lib/search-api';
import { queryKeys } from '@/lib/query-client';
import { consumeDataReady, markInteractionStart, scheduleRenderPerf } from '@/lib/config';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch, type FilterParams, type BrowseViewMode as ViewMode } from '@/context/search-context';

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
  const queryClient = useQueryClient();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isHeaderTitleHidden, setIsHeaderTitleHidden] = useState(false);
  const [isBrowseTabBarVisible, setIsBrowseTabBarVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const tabBarVisibleRef = useRef(true);
  const scrollDirectionRef = useRef<'up' | 'down' | null>(null);
  const directionalDistanceRef = useRef(0);
  const loadMoreLockRef = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────
  // CONTEXT - Single Source of Truth
  // ─────────────────────────────────────────────────────────────────────────
  const { 
    // Search params (make/model/q from search sheet)
    searchParams,
    // Sort
    sortBy,
    // Filters - THE source of truth
    filterParams,
    // Scroll
    subscribeToScrollToTop, 
    // Browse menu actions
    subscribeToBrowsePill,
    subscribeToBrowseSettings,
    subscribeToBrowseViewMode,
  } = useSearch();

  // Scroll ref for auto-scroll to top
  const scrollRef = useRef<FlatList<ListingCard>>(null);

  // Check if we have active search/filter chips
  const hasActiveChips = useMemo(() => {
    const hasSearch = searchParams !== null && Object.keys(searchParams).length > 0;
    const hasFilters = Object.keys(filterParams).length > 0;
    return hasSearch || hasFilters || sortBy !== 'relevance';
  }, [searchParams, filterParams, sortBy]);

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
  const searchQueryHash = useMemo(() => JSON.stringify(searchQueryKey), [searchQueryKey]);
  const previousSearchQueryHashRef = useRef<string | null>(null);
  const [isRevalidatingWarmSearch, setIsRevalidatingWarmSearch] = useState(false);

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
    // Match the server-side search cache. Query key changes still create a new
    // cache entry, but revisiting the same filter set within 2 minutes can reuse
    // the cached cursor pages instead of immediately refetching.
    staleTime: 2 * 60 * 1000,
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
  }, [data]);

  const hasMore = hasNextPage ?? false;
  const isRefreshing = (isRefetching && !isFetchingNextPage) || isRevalidatingWarmSearch;
  const visibleListings = useMemo(
    () => (isRevalidatingWarmSearch ? [] : listings),
    [isRevalidatingWarmSearch, listings]
  );
  const showInitialLoading = (isLoading && visibleListings.length === 0) || isRevalidatingWarmSearch;

  // View mode (persisted across tab switches via module-level variable)
  const [viewMode, setViewModeState] = useState<ViewMode>(persistedViewMode);
  const setViewMode = useCallback((mode: ViewMode) => {
    persistedViewMode = mode;
    setViewModeState(mode);
  }, []);

  // Reset scroll instantly when search/filters change (no animation)
  useEffect(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
    loadMoreLockRef.current = false;
  }, [searchQueryKey]);

  useEffect(() => {
    const previousHash = previousSearchQueryHashRef.current;
    previousSearchQueryHashRef.current = searchQueryHash;

    if (previousHash === null || previousHash === searchQueryHash) {
      return;
    }

    const cachedState = queryClient.getQueryState(searchQueryKey);
    if (!cachedState?.data) {
      queueMicrotask(() => {
        setIsRevalidatingWarmSearch(false);
      });
      return;
    }

    queueMicrotask(() => {
      setIsRevalidatingWarmSearch(true);
    });

    refetch()
      .catch(() => undefined)
      .finally(() => {
        setIsRevalidatingWarmSearch(false);
      });
  }, [queryClient, refetch, searchQueryHash, searchQueryKey]);

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
    if (!hasMore || isFetchingNextPage || loadMoreLockRef.current) return;

    loadMoreLockRef.current = true;
    fetchNextPage().catch(() => {
      loadMoreLockRef.current = false;
    });
  }, [fetchNextPage, hasMore, isFetchingNextPage]);

  const handleCardPress = useCallback((id: string) => {
    markInteractionStart(`listing:${id}`);
    router.push(`/listing/${id}`);
  }, [router]);

  useEffect(() => {
    if (showInitialLoading || visibleListings.length === 0) return;
    const readyAt = consumeDataReady('browse:results') ?? performance.now();
    scheduleRenderPerf('browse.results', readyAt, {
      count: visibleListings.length,
      hasMore,
    });
  }, [showInitialLoading, visibleListings.length, hasMore]);

  // Handle long-press on card — show AI info sheet
  const handleCardLongPress = useCallback((id: string) => {
    const listing = visibleListings.find(l => l.id === id);
    router.push({
      pathname: '/car-info',
      params: {
        listingId: id,
        make: listing?.make,
        model: listing?.model,
        year: listing?.year ? String(listing.year) : undefined,
        price: listing?.price ? String(listing.price) : undefined,
        sellerName: listing?.partnerName || listing?.sellerName || undefined,
      },
    });
  }, [router, visibleListings]);

  // Handle filter pill press
  const handleFilterPillPress = useCallback((type: FilterPillType) => {
    switch (type) {
      case 'make':
        router.push('/(tabs)/(browse)/filter-make');
        break;
      case 'model':
        router.push('/(tabs)/(browse)/filter-model');
        break;
      case 'price':
        router.push('/(tabs)/(browse)/filter-price');
        break;
      case 'yearMileage':
        router.push('/(tabs)/(browse)/filter-year-mileage');
        break;
      case 'location':
        router.push('/(tabs)/(browse)/filter-location');
        break;
    }
  }, [router]);

  // Stable callbacks for FilterPills (prevents ScrollView scroll-reset)
  const handleSettingsPress = useCallback(() => {
    router.push({ pathname: '/(tabs)/(browse)/more-filters', params: { viewMode } });
  }, [router, viewMode]);

  // Subscribe to native browse menu actions.
  useEffect(() => {
    const unsubscribePill = subscribeToBrowsePill((type) => {
      handleFilterPillPress(type);
    });
    const unsubscribeSettings = subscribeToBrowseSettings(() => {
      router.push({ pathname: '/(tabs)/(browse)/more-filters', params: { viewMode } });
    });
    const unsubscribeViewMode = subscribeToBrowseViewMode((mode) => {
      setViewMode(mode);
    });

    return () => {
      unsubscribePill();
      unsubscribeSettings();
      unsubscribeViewMode();
    };
  }, [handleFilterPillPress, router, setViewMode, subscribeToBrowsePill, subscribeToBrowseSettings, subscribeToBrowseViewMode, viewMode]);

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
  const browseTabBarOffset = getTabBarOverlayHeight(insets.bottom);

  const bottomPadding =
    tabBarInset +
    (hasActiveChips ? ACTIVE_CHIPS_HEIGHT + Spacing.sm : 0) +
    Layout.tabBarHeight +
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
    if (showInitialLoading && visibleListings.length === 0) {
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
      <EmptyState
        icon={SearchX}
        title="No cars found."
        subtitle="Try adjusting your filters or search terms."
        style={styles.empty}
      />
    );
  }, [showInitialLoading, viewMode, visibleListings.length]);

  const renderFooter = useCallback(() => {
    if (!hasMore || !isFetchingNextPage) return <View style={styles.bottomSpacer} />;

    return (
      <View style={styles.loadingMore}>
        <Text variant="subhead" tone="secondary">Loading...</Text>
      </View>
    );
  }, [hasMore, isFetchingNextPage]);

  const headerInset = getMobileHeaderContentInset(insets.top);

  const setBrowseTabBarVisibility = useCallback((visible: boolean) => {
    if (tabBarVisibleRef.current === visible) return;
    tabBarVisibleRef.current = visible;
    setIsBrowseTabBarVisible(visible);
  }, []);

  const resetScrollTracking = useCallback(() => {
    scrollDirectionRef.current = null;
    directionalDistanceRef.current = 0;
  }, []);

  const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    loadMoreLockRef.current = false;
    lastScrollYRef.current = Math.max(0, event.nativeEvent.contentOffset.y);
    resetScrollTracking();
  }, [resetScrollTracking]);

  const handleMomentumScrollBegin = useCallback(() => {
    loadMoreLockRef.current = false;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
    const deltaY = offsetY - lastScrollYRef.current;
    lastScrollYRef.current = offsetY;

    setIsHeaderTitleHidden(offsetY > Spacing.lg);

    const jitterThreshold = 1;
    const hideAfterOffset = Spacing['3xl'];
    const showNearTopOffset = Spacing.xl;
    const hideTravelDistance = Spacing.lg;
    const showTravelDistance = Spacing.md;

    if (offsetY <= showNearTopOffset) {
      setBrowseTabBarVisibility(true);
      resetScrollTracking();
      return;
    }

    if (Math.abs(deltaY) <= jitterThreshold) {
      return;
    }

    const direction: 'up' | 'down' = deltaY > 0 ? 'down' : 'up';

    if (scrollDirectionRef.current !== direction) {
      scrollDirectionRef.current = direction;
      directionalDistanceRef.current = 0;
    }

    directionalDistanceRef.current += Math.abs(deltaY);

    if (
      direction === 'down' &&
      offsetY > hideAfterOffset &&
      directionalDistanceRef.current >= hideTravelDistance
    ) {
      setBrowseTabBarVisibility(false);
      directionalDistanceRef.current = 0;
      return;
    }

    if (
      direction === 'up' &&
      directionalDistanceRef.current >= showTravelDistance
    ) {
      setBrowseTabBarVisibility(true);
      directionalDistanceRef.current = 0;
    }
  }, [resetScrollTracking, setBrowseTabBarVisibility]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MobileHeader
        title="Browse"
        titleHidden={isHeaderTitleHidden}
        fadeHeight={insets.top + Spacing.xs}
      />
      <FlatList
        ref={scrollRef}
        data={visibleListings}
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
          flexGrow: visibleListings.length === 0 ? 1 : undefined,
        }}
        contentInsetAdjustmentBehavior="never"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        initialNumToRender={6}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        refreshControl={
          <HapticRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      <BrowseTabBar
        bottomOffset={browseTabBarOffset}
        visible={isBrowseTabBarVisible}
        pills={filterPillConfigs}
        onPillPress={handleFilterPillPress}
        onSettingsPress={handleSettingsPress}
        settingsCount={moreFiltersCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
    flex: 1,
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
