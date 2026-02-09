/**
 * Browse Screen
 * Header + Listings Results
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DisplayArea, ACTIVE_CHIPS_HEIGHT } from '@/components/layout';
import { BrowseHeader } from '@/components/home';
import { CarCardM, CarCardMSkeleton } from '@/components/cards';
import { LogoLoader } from '@/components/ui';
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
  emirate?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  mileageMax?: number;
  condition?: 'new' | 'used';
  isNegotiable?: boolean;
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
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
});

// ============================================================================
// BROWSE SCREEN
// ============================================================================

export default function BrowseScreen() {
  const { colorScheme } = useTheme();
  const { subscribeToSearch, subscribeToSort, sortBy: contextSortBy, searchParams: contextSearchParams } = useSearch();
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

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <BrowseHeader />

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
            {listings.map((listing, index) => (
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
            ))}

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
  emptyText: {
    ...Typography.bodyLarge,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
