/**
 * Inventory Query Hook
 * 
 * React Query powered hook for user's listings inventory.
 * Supports pagination, filtering by status, and cache invalidation.
 */

import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyListings,
  type MyListingCard,
  type MyListingsStats,
  type MyListingsFilter,
} from '@/lib/sell-car-user-api';
import { queryKeys } from '@/lib/query-client';

// ============================================================================
// TYPES
// ============================================================================

const PAGE_SIZE = 20;

export interface UseInventoryOptions {
  /** Filter by status */
  filter: MyListingsFilter;
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseInventoryResult {
  /** All loaded listings */
  listings: MyListingCard[];
  /** Stats for all tabs */
  stats: MyListingsStats | null;
  /** Total count for current filter */
  total: number;
  /** Whether initial load is in progress (no cached data) */
  isLoading: boolean;
  /** Whether refreshing with data visible */
  isRefreshing: boolean;
  /** Whether loading more pages */
  isLoadingMore: boolean;
  /** Whether more pages available */
  hasMore: boolean;
  /** Error message */
  error: string | null;
  /** Load more pages */
  loadMore: () => void;
  /** Refresh from scratch */
  refresh: () => Promise<void>;
  /** Invalidate cache (after mutations) */
  invalidate: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useInventory(options: UseInventoryOptions): UseInventoryResult {
  const { filter, enabled = true } = options;
  const queryClient = useQueryClient();

  // Query key includes filter
  const queryKey = useMemo(() => queryKeys.inventory(filter), [filter]);

  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
    isFetchingNextPage,
    isRefetching,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getMyListings({
        status: filter === 'all' ? undefined : filter,
        includeStats: true,
        limit: PAGE_SIZE,
        offset: pageParam,
        sort: 'newest',
      });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, page) => acc + page.listings.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute - inventory changes frequently
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Flatten all pages
  const listings = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.listings);
  }, [data?.pages]);

  // Get stats from first page (always included)
  const stats = data?.pages[0]?.stats ?? null;
  const total = data?.pages[0]?.total ?? 0;

  // Load more handler
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refresh handler
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Invalidate cache (call after mutations like mark sold, archive, etc.)
  const invalidate = useCallback(() => {
    // Invalidate all inventory queries (all filters)
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  }, [queryClient]);

  return {
    listings,
    stats,
    total,
    // Only show loading skeleton when no cached data
    isLoading: isQueryLoading && listings.length === 0,
    // Show refresh indicator when refetching with data visible
    isRefreshing: isRefetching && listings.length > 0,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load') : null,
    loadMore,
    refresh,
    invalidate,
  };
}
