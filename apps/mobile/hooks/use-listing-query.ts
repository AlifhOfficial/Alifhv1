/**
 * Listing Query Hooks
 * 
 * React Query hooks for listing detail functionality.
 * - Automatic caching (view same listing again = instant)
 * - Prefetch support (warm cache before user navigates)
 * - Shared cache between listing detail and seller contact screens
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { queryKeys } from '@/lib/query-client';
import { listingApi, type ListingDetailed, type SimilarListingCard } from '@/lib/listing-api';
import { getSellerListings, type SellerListingCard } from '@/lib/seller-api';
import { consumeInteractionStart } from '@/lib/config';

// ============================================================================
// LISTING DETAIL HOOK
// ============================================================================

export interface UseListingDetailOptions {
  /** Listing ID to fetch */
  listingId: string | undefined;
  /** Whether to enable the query */
  enabled?: boolean;
  /** Track view automatically (default: true) */
  trackView?: boolean;
}

export interface UseListingDetailResult {
  /** The listing data */
  listing: ListingDetailed | undefined;
  /** Whether doing initial load with NO cached data (show skeleton) */
  isLoading: boolean;
  /** Whether fetching in background (have data, refreshing) */
  isFetching: boolean;
  /** Whether triggered by pull-to-refresh */
  isRefreshing: boolean;
  /** Error if any */
  error: Error | null;
  /** Refresh the listing */
  refresh: () => void;
}

/**
 * Hook for fetching listing detail data.
 * 
 * Benefits over manual fetch:
 * - Cached: Navigate back to same listing = instant
 * - Shared: Seller contact screen uses same cache
 * - Deduped: Multiple components using same listing = 1 request
 * 
 * @example
 * ```tsx
 * const { listing, isLoading, refresh } = useListingDetail({
 *   listingId: id,
 *   trackView: true,
 * });
 * ```
 */
export function useListingDetail(options: UseListingDetailOptions): UseListingDetailResult {
  const { listingId, enabled = true, trackView = true } = options;
  const viewTrackedRef = useRef(false);
  
  const queryKey = listingId ? queryKeys.listingDetailed(listingId) : ['listing', 'none'];
  
  const {
    data: listing,
    isLoading: isQueryLoading,
    isFetching,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!listingId) throw new Error('No listing ID');
      return listingApi.getDetailed(listingId, {
        interactionStartAt: consumeInteractionStart(`listing:${listingId}`) ?? undefined,
      });
    },
    enabled: enabled && !!listingId,
    // Listing detail is relatively stable - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  
  // Track view when listing loads successfully (fire-and-forget)
  // Only track for live/public listings - not admin previews
  useEffect(() => {
    if (!trackView || !listing || viewTrackedRef.current) return;
    
    const isPublic = listing.listing?.isPublic ?? false;
    const isAdminPreview = listing.isAdminPreview ?? false;
    
    if (listing.listing?.id && isPublic && !isAdminPreview) {
      viewTrackedRef.current = true;
      listingApi.trackView(listing.listing.id);
    }
  }, [trackView, listing]);
  
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  return {
    listing,
    // Only show skeleton when truly no data available
    isLoading: isQueryLoading && !listing,
    // Background fetch (have data, refreshing in background)
    isFetching: isFetching && !!listing,
    isRefreshing: isRefetching,
    error: error as Error | null,
    refresh,
  };
}

// ============================================================================
// SELLER OTHER LISTINGS HOOK
// ============================================================================

export interface UseSellerListingsOptions {
  /** Seller ID (partner or user) */
  sellerId: string | undefined;
  /** Seller type */
  sellerType: 'partner' | 'user' | undefined;
  /** Listing ID to exclude */
  excludeListingId?: string;
  /** Limit results */
  limit?: number;
  /** Whether to enable */
  enabled?: boolean;
}

export interface UseSellerListingsResult {
  listings: SellerListingCard[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching other listings from a seller.
 */
export function useSellerListings(options: UseSellerListingsOptions): UseSellerListingsResult {
  const { sellerId, sellerType, excludeListingId, limit = 4, enabled = true } = options;
  
  const queryKey = sellerId && sellerType 
    ? ['seller', 'listings', sellerId, sellerType, excludeListingId, limit] as const
    : ['seller', 'listings', 'none'] as const;
  
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!sellerId || !sellerType) throw new Error('No seller');
      return getSellerListings(sellerId, sellerType, { limit, excludeListingId });
    },
    enabled: enabled && !!sellerId && !!sellerType,
    staleTime: 5 * 60 * 1000,
  });
  
  const listings = data?.listings ?? [];
  
  return {
    listings,
    total: data?.meta.total ?? listings.length,
    // Only show loading when truly no data
    isLoading: isLoading && listings.length === 0,
    error: error as Error | null,
  };
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Hook to get prefetch functions for listing detail.
 * Uses a delay to avoid triggering during scroll gestures.
 * 
 * Call `schedulePrefetch` on card press-in (touch start).
 * Call `cancelPrefetch` on press-out or when navigating.
 * 
 * @example
 * ```tsx
 * const { schedulePrefetch, cancelPrefetch } = usePrefetchListing();
 * 
 * <CarCard
 *   onPressIn={() => schedulePrefetch(listing.id)}
 *   onPressOut={cancelPrefetch}
 *   onPress={() => {
 *     cancelPrefetch(); // Cancel delay, fetch immediately
 *     router.push(`/listing/${listing.id}`);
 *   }}
 * />
 * ```
 */
export function usePrefetchListing() {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const schedulePrefetch = useCallback(
    (listingId: string) => {
      // Cancel any pending prefetch
      cancelPrefetch();
      
      // Delay prefetch by 150ms to avoid triggering during scroll
      // If user is scrolling, they'll lift finger before this fires
      timeoutRef.current = setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.listingDetailed(listingId),
          queryFn: () => listingApi.getDetailed(listingId),
          staleTime: 5 * 60 * 1000,
        });
      }, 150);
    },
    [queryClient, cancelPrefetch]
  );
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cancelPrefetch();
  }, [cancelPrefetch]);
  
  return { schedulePrefetch, cancelPrefetch };
}

/**
 * Invalidate listing detail cache (call after mutations like favorite)
 */
export function useInvalidateListing() {
  const queryClient = useQueryClient();
  
  return useCallback(
    (listingId: string) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingDetailed(listingId),
      });
    },
    [queryClient]
  );
}

// ============================================================================
// SIMILAR LISTINGS HOOK
// ============================================================================

export interface UseSimilarListingsResult {
  listings: SimilarListingCard[];
  isLoading: boolean;
}

/**
 * Hook for fetching price-similar listings.
 */
export function useSimilarListings(listingId: string | undefined): UseSimilarListingsResult {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.similarListings(listingId ?? ''),
    queryFn: () => listingApi.getSimilar(listingId!),
    enabled: !!listingId,
    staleTime: 12 * 60 * 60 * 1000, // 12h — matches server cache
    gcTime: 24 * 60 * 60 * 1000,
  });

  return {
    listings: data ?? [],
    isLoading: isLoading && !data,
  };
}
