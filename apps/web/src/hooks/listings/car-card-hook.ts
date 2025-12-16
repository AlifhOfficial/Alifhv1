'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal Listing type - only fields actually used in car card UI
 */
export interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: string | null;
  images?: string[];
  qiScore?: number | null;
  isBlackMember?: boolean;
  status?: string;
  partnerName?: string | null;
  partnerVerified?: boolean | null;
}

interface UseListingsResult {
  listings: Listing[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useListings(): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const fetchListings = useCallback(async (currentOffset = 0, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/listings/car-card?status=published&limit=${LIMIT}&offset=${currentOffset}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch listings: ${response.status}`);
      }

      const data = await response.json();
      const newListings = data.data || [];
      
      if (append) {
        setListings(prev => [...prev, ...newListings]);
      } else {
        setListings(newListings);
      }
      
      setTotalCount(data.meta?.total || newListings.length);
      setHasMore(newListings.length === LIMIT);
      setOffset(currentOffset + newListings.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[useListings] Error:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await fetchListings(offset, true);
    }
  }, [offset, isLoadingMore, hasMore, fetchListings]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    refresh: () => fetchListings(),
    loadMore,
  };
}
