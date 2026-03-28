/**
 * Archived hook for the removed BLK home section.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { searchApi, type ListingCard } from '@/lib/search-api';
import { type BlkListingItem } from '@/archive/components/home/blk-grid-card';

async function fetchBlkListings(): Promise<BlkListingItem[]> {
  const response = await searchApi.search({
    isBlkListing: true,
    sortBy: 'relevance',
    limit: 8,
  });

  return response.listings.map((l: ListingCard) => ({
    id: l.id,
    make: l.make,
    model: l.model,
    year: l.year,
    price: l.price,
    thumbnail: l.thumbnail,
  }));
}

export function useHomeBlk() {
  const queryClient = useQueryClient();

  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.homeGrids(),
    queryFn: fetchBlkListings,
    staleTime: 2 * 60 * 1000,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.homeGrids() });
    await refetch();
  }, [queryClient, refetch]);

  return {
    listings,
    isLoading,
    refresh,
    error: error instanceof Error ? error : null,
  };
}
