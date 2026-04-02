/**
 * useHomeFeed
 *
 * Fetches three curated sections for the home screen feed:
 * - blk:       BLK premium listings (popular sort)
 * - justListed: newest listings (recently added)
 * - hiddenGems: low mileage, competitive price
 *
 * All three queries run in parallel using React Query.
 * Stale time is 10 minutes — fresh enough without hammering the API on every visit.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchApi, type ListingCard } from '@/lib/search-api';
import { queryKeys } from '@/lib/query-client';

// ============================================================================
// CONSTANTS
// ============================================================================

const FEED_LIMIT = 10;
const STALE_TIME = 10 * 60 * 1000;
const BLK_PARAMS = { isBlkListing: true, sortBy: 'popular', limit: FEED_LIMIT } as const;
const JUST_LISTED_PARAMS = { sortBy: 'newest', limit: FEED_LIMIT } as const;
const HIDDEN_GEMS_PARAMS = { sortBy: 'price_low', mileageMax: 60000, limit: FEED_LIMIT } as const;

// ============================================================================
// HOOK
// ============================================================================

export interface UseHomeFeedResult {
  blk: ListingCard[];
  justListed: ListingCard[];
  hiddenGems: ListingCard[];
  isLoadingBlk: boolean;
  isLoadingJustListed: boolean;
  isLoadingHiddenGems: boolean;
  refresh: () => Promise<void>;
}

export function useHomeFeed(): UseHomeFeedResult {
  const queryClient = useQueryClient();

  const { data: blkData, isLoading: isLoadingBlk } = useQuery({
    queryKey: queryKeys.search(BLK_PARAMS),
    queryFn: () => searchApi.search(BLK_PARAMS),
    staleTime: STALE_TIME,
  });

  const { data: justListedData, isLoading: isLoadingJustListed } = useQuery({
    queryKey: queryKeys.search(JUST_LISTED_PARAMS),
    queryFn: () => searchApi.search(JUST_LISTED_PARAMS),
    staleTime: STALE_TIME,
  });

  const { data: hiddenGemsData, isLoading: isLoadingHiddenGems } = useQuery({
    queryKey: queryKeys.search(HIDDEN_GEMS_PARAMS),
    queryFn: () => searchApi.search(HIDDEN_GEMS_PARAMS),
    staleTime: STALE_TIME,
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.search(BLK_PARAMS) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.search(JUST_LISTED_PARAMS) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.search(HIDDEN_GEMS_PARAMS) }),
    ]);
  }, [queryClient]);

  return {
    blk: blkData?.listings ?? [],
    justListed: justListedData?.listings ?? [],
    hiddenGems: hiddenGemsData?.listings ?? [],
    isLoadingBlk,
    isLoadingJustListed,
    isLoadingHiddenGems,
    refresh,
  };
}
