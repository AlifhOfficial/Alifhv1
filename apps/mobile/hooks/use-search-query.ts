/**
 * Search Query Hooks
 * 
 * React Query hooks for search/browse functionality.
 * Replaces manual fetch + useState + useEffect pattern with:
 * - Automatic caching and deduplication
 * - stale-while-revalidate for instant UI updates
 * - Built-in pagination with useInfiniteQuery
 * - Prefetching support
 */

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { queryKeys } from '@/lib/query-client';
import { searchApi, type SearchParams, type SearchResponse, type SearchFacets, type ListingCard } from '@/lib/search-api';

// ============================================================================
// TYPES
// ============================================================================

export interface UseSearchListingsOptions {
  /** Search/filter params */
  params: SearchParams;
  /** Whether to enable the query (useful for conditional fetching) */
  enabled?: boolean;
  /** Items per page */
  limit?: number;
}

export interface UseSearchListingsResult {
  /** Flattened list of all loaded listings */
  listings: ListingCard[];
  /** Facets from the first page (filters data) */
  facets: SearchFacets | undefined;
  /** Total count of matching listings */
  total: number;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Whether loading more pages */
  isFetchingNextPage: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Fetch next page of results */
  fetchNextPage: () => void;
  /** Refresh (refetch from page 1) */
  refresh: () => void;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Infinite query hook for browse/search listings.
 * 
 * Replaces the entire manual pagination system in browse.tsx:
 * - No more requestIdRef for race conditions
 * - No more manual page state
 * - No more manual deduplication
 * - Automatic caching between filter changes
 * 
 * @example
 * ```tsx
 * const { listings, isLoading, fetchNextPage, hasMore, refresh } = useSearchListings({
 *   params: { make: ['Toyota'], priceMax: 100000 },
 * });
 * ```
 */
export function useSearchListings(options: UseSearchListingsOptions): UseSearchListingsResult {
  const { params, enabled = true, limit = 20 } = options;
  
  // Create stable query key from params (excluding page which is handled internally)
  const queryKey = useMemo(() => {
    const { page, ...stableParams } = params;
    return queryKeys.searchInfinite({ ...stableParams, limit });
  }, [params, limit]);
  
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isRefetching,
    error,
    fetchNextPage: fetchNextPageInternal,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await searchApi.search({
        ...params,
        page: pageParam,
        limit,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined;
    },
    enabled,
    // Keep previous data while loading new filters (prevents flash to skeleton)
    placeholderData: (previousData) => previousData,
  });
  
  // Flatten all pages into a single listings array
  const listings = useMemo(() => {
    if (!data?.pages) return [];
    
    const allListings: ListingCard[] = [];
    const seenIds = new Set<string>();
    
    for (const page of data.pages) {
      for (const listing of page.listings) {
        // Deduplicate (in case of race conditions or duplicate data)
        if (!seenIds.has(listing.id)) {
          seenIds.add(listing.id);
          allListings.push(listing);
        }
      }
    }
    
    return allListings;
  }, [data?.pages]);
  
  // Get facets from first page
  const facets = data?.pages[0]?.facets;
  
  // Get total from first page
  const total = data?.pages[0]?.meta.total ?? 0;
  
  // Stable callbacks
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPageInternal();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPageInternal]);
  
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  return {
    listings,
    facets,
    total,
    hasMore: hasNextPage ?? false,
    isLoading: isLoading && !data,
    isRefreshing: isRefetching && !isFetchingNextPage,
    isFetchingNextPage,
    error: error as Error | null,
    fetchNextPage,
    refresh,
  };
}

// ============================================================================
// FACETS HOOK (for filter sheets)
// ============================================================================

export interface UseFacetsOptions {
  /** Current filter context (to get dynamic facets) */
  filterContext?: Record<string, unknown>;
  /** Whether to enable the query */
  enabled?: boolean;
}

/**
 * Hook for fetching facets (filter counts).
 * Cached aggressively since facet counts change slowly.
 * 
 * @example
 * ```tsx
 * const { facets, isLoading } = useFacets({
 *   filterContext: { make: ['Toyota'] },
 *   enabled: sheetVisible,
 * });
 * ```
 */
export function useFacets(options: UseFacetsOptions = {}) {
  const { filterContext = {}, enabled = true } = options;
  
  const queryKey = queryKeys.facets(filterContext);
  
  const { data: facets, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      return searchApi.getFacets(filterContext as SearchParams);
    },
    enabled,
    // Facets change slowly - cache for 1 hour (matches web)
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
  
  return {
    facets,
    isLoading,
    error: error as Error | null,
  };
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Prefetch listings for a search query.
 * Call this before navigation to warm the cache.
 */
export function usePrefetchSearch() {
  const queryClient = useQueryClient();
  
  return useCallback(
    (params: SearchParams) => {
      const queryKey = queryKeys.searchInfinite({ ...params, limit: 20 });
      
      queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: async () => {
          return searchApi.search({ ...params, page: 1, limit: 20 });
        },
        initialPageParam: 1,
      });
    },
    [queryClient]
  );
}
