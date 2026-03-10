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
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

export interface PartnerSellerData {
  type: 'partner';
  partnerId: string;
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
  /** Stats loaded separately via useSellerStats hook */
  partnerStats: {
    inventoryCount: number;
    totalSales: number;
    responseTime: number | null;
    responseRate: number | null;
  } | null;
  /** Staff contact info if listing was posted by staff */
  staffContact?: {
    phone: string | null;
    displayName: string | null;
  } | null;
}

export interface UserSellerData {
  type: 'user';
  userId: string;
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
    rating: number | null;
    platformRating: number | null;
    platformReviewCount: number;
    privacySettings: { showPhone?: boolean; showEmail?: boolean };
    memberSince: Date | string;
    emailVerified: boolean;
    phoneNumberVerified: boolean;
    userName: string | null;
    userCreatedAt: Date | string;
  } | null;
  /** Stats loaded separately via useSellerStats hook */
  userStats?: {
    listingsCount: number;
    soldCount: number;
    responseTime: number | null;
    responseRate: number | null;
  } | null;
}

export type SellerData = PartnerSellerData | UserSellerData;

export interface ListingDetailResponse {
  listing: CarDetailedData;
  sellerData: SellerData;
  /** True if admin is viewing a non-public listing for moderation */
  isAdminPreview?: boolean;
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
  /** 
   * Initial listing data from server-side fetch.
   * When provided, images render immediately without waiting for client fetch.
   * React Query will still refetch in background if stale.
   */
  initialListing?: CarDetailedData | null;
}

export function useListingDetail(
  id: string | null | undefined,
  options: UseListingDetailOptions = {}
) {
  const { enabled = true, initialListing } = options;

  const query = useQuery({
    queryKey: ['listing', 'detail', id],
    queryFn: () => fetchListingDetail(id!),
    enabled: !!id && enabled,
    retry: 1,
    // If we have server-side data, use it immediately
    // This makes images render on first paint
    initialData: initialListing ? {
      listing: initialListing,
      sellerData: null, // Will be fetched client-side
      isAdminPreview: false,
    } : undefined,
    // Mark when initial data was set (for stale calculation)
    initialDataUpdatedAt: initialListing ? Date.now() : undefined,
    // Always refetch immediately to get seller data
    // The initial listing shows images instantly, refetch gets seller info
    staleTime: 0,
  });

  return {
    listing: query.data?.listing ?? null,
    sellerData: query.data?.sellerData ?? null,
    isAdminPreview: query.data?.isAdminPreview ?? false,
    isLoading: query.isLoading,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
