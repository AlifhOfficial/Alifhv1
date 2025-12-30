/**
 * Listing Detail Hook - Fetch Single Listing with Seller Data
 * 
 * React Query hook for fetching comprehensive listing details
 * including seller information (partner or user profile).
 * 
 * Usage:
 * ```tsx
 * const { listing, sellerData, isLoading, error } = useListingDetail(listingId);
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { CACHE_STALE_TIME } from '@/lib/cache-config';
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

export interface PartnerSellerData {
  type: 'partner';
  partner: {
    id: string;
    companyNameLegal: string;
    brandName: string;
    tradeLicense: string;
    status: string;
    tier: string;
    email: string;
    phone: string;
    website: string | null;
    address: string | null;
    emirate: string | null;
    city: string | null;
    locationLat: number | null;
    locationLng: number | null;
    showroomCount: number;
    logo: string | null;
    heroImage: string | null;
    description: string | null;
    specialties: string[] | null;
    experienceYears: number | null;
    foundedYear: number | null;
    googleReviewUrl: string | null;
    googleRating: number | null;
    googleReviewCount: number | null;
    platformRating: number | null;
    platformReviewCount: number | null;
    isVerified: boolean;
    badges: string[] | null;
    tags: string[] | null;
  } | null;
  partnerStats?: {
    inventoryCount: number;
    totalSales: number;
    responseTime: number | null;
    responseRate: number | null;
  };
}

export interface UserSellerData {
  type: 'user';
  userProfile: {
    id: string;
    userId: string;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    description: string | null;
    kycVerified: boolean;
    badges: string[] | null;
    tags: string[] | null;
    locationLat: number | null;
    locationLng: number | null;
    locationCity: string | null;
    locationEmirate: string | null;
    inventoryCount: number;
    rating: number | null;
    platformRating: number | null;
    platformReviewCount: number;
    avgResponseTime: number | null;
    privacySettings: { showPhone?: boolean; showEmail?: boolean };
    memberSince: Date | string;
    emailVerified: boolean;
    phoneVerified: boolean;
    userName: string | null;
    userImage: string | null;
    userCreatedAt: Date | string;
  } | null;
}

export type SellerData = PartnerSellerData | UserSellerData;

export interface ListingDetailResponse {
  listing: CarDetailedData;
  sellerData: SellerData;
}

// ============================================================================
// API Function
// ============================================================================

async function fetchListingDetail(id: string): Promise<ListingDetailResponse> {
  const res = await fetch(`/api/listings/${id}/detailed`, {
    credentials: 'include',
  });

  if (res.status === 404) {
    throw new Error('Listing not found');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch listing');
  }

  return res.json();
}

// ============================================================================
// Hook
// ============================================================================

export interface UseListingDetailOptions {
  enabled?: boolean;
}

export function useListingDetail(
  id: string | null | undefined,
  options: UseListingDetailOptions = {}
) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['listing', 'detail', id],
    queryFn: () => fetchListingDetail(id!),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    listing: query.data?.listing ?? null,
    sellerData: query.data?.sellerData ?? null,
    isLoading: query.isLoading,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
