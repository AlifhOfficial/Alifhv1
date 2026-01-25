/**
 * Listings Hook
 * 
 * Fetch car listings from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { apiUrl, API_ENDPOINTS } from '@/lib/api-config';

// ============================================================================
// TYPES
// ============================================================================

export interface CarCardData {
  id: string;
  slug: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  isBlkListing: boolean | null;
  sellerType: 'private' | 'dealer' | null;
  postedByRole: 'user' | 'staff' | null;
  moderationStatus: string | null;
  lifecycleStatus: string | null;
  isPublic: boolean | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
}

interface ListingsResponse {
  data: CarCardData[];
  meta: {
    returned: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface UseListingsOptions {
  limit?: number;
  partnerId?: string;
}

interface UseListingsResult {
  listings: CarCardData[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useListings(options: UseListingsOptions = {}): UseListingsResult {
  const { limit = 20, partnerId } = options;

  const [listings, setListings] = useState<CarCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchListings = useCallback(async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      
      // Build query params
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', currentOffset.toString());
      if (partnerId) {
        params.set('partnerId', partnerId);
      }

      const url = apiUrl(`${API_ENDPOINTS.listingsCarCard}?${params.toString()}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }

      const json: ListingsResponse = await response.json();

      if (reset) {
        setListings(json.data);
        setOffset(limit);
      } else {
        setListings(prev => [...prev, ...json.data]);
        setOffset(prev => prev + limit);
      }

      setHasMore(json.meta.hasMore);
      setError(null);
    } catch (err) {
      console.error('[useListings] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    }
  }, [offset, limit, partnerId]);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchListings(true);
      setIsLoading(false);
    };
    init();
  }, [partnerId]); // Re-fetch when partnerId changes

  // Refresh (pull-to-refresh)
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchListings(true);
    setIsRefreshing(false);
  }, [fetchListings]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    await fetchListings(false);
  }, [hasMore, isLoading, isRefreshing, fetchListings]);

  return {
    listings,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}
