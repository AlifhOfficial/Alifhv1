/**
 * Similar Listings Hook
 * 
 * Fetches comparable vehicles for a listing detail page.
 * Non-blocking - loads after main listing is ready.
 * Returns empty array if no quality matches (intentional).
 * 
 * Usage:
 * ```tsx
 * const { listings, isLoading } = useSimilarListings(listingId, {
 *   enabled: !!listing, // Only fetch after main listing loads
 * });
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface SimilarListingCard {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string | null;
  thumbnail: string | null;
  qiScore: number | null;
  isBlkListing: boolean;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  isBlackTierPartner: boolean;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  sellerUseGeneratedAvatar: boolean | null;
}

interface SimilarListingsResponse {
  listings: SimilarListingCard[];
  cached: boolean;
}

export interface UseSimilarListingsOptions {
  /** Only fetch when true (e.g., after main listing loads) */
  enabled?: boolean;
  initialData?: SimilarListingCard[];
}

// ============================================================================
// API Function
// ============================================================================

async function fetchSimilarListings(listingId: string): Promise<SimilarListingCard[]> {
  const res = await fetch(`/api/listings/${listingId}/similar`, {
    credentials: 'include',
  });

  if (!res.ok) {
    // Don't throw - just return empty (graceful degradation)
    return [];
  }

  const data: SimilarListingsResponse = await res.json();
  return data.listings ?? [];
}

// ============================================================================
// Hook
// ============================================================================

export function useSimilarListings(
  listingId: string | null | undefined,
  options: UseSimilarListingsOptions = {}
) {
  const { enabled = true, initialData } = options;

  const query = useQuery({
    queryKey: ['listing', 'similar', listingId],
    queryFn: () => fetchSimilarListings(listingId!),
    enabled: !!listingId && enabled,
    // Don't retry - if it fails, just don't show the section
    retry: false,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: initialData ? Infinity : 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: initialData ?? [],
  });

  return {
    listings: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
