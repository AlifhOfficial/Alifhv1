/**
 * My Listings Hook - User's Own Listings Management
 * 
 * React Query hook for fetching and managing user's listings.
 * Provides caching, pagination, and real-time stats.
 * 
 * Usage:
 * ```tsx
 * const { listings, stats, isLoading, refetch } = useMyListings({ status: 'active' });
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type ListingType = 'personal' | 'work';

export type ModerationStatus = 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';

export type LifecycleStatus = 'active' | 'archived' | 'sold' | 'expired' | 'deleted';

export type ListingsSort = 'newest' | 'oldest' | 'updated' | 'expiring';

export type LegacyStatus =
  | 'all'
  | 'public'
  | 'published'
  | 'pending'
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'archived'
  | 'suspended'
  | 'sold'
  | 'expired'
  | 'deleted'
  | 'deep_inventory'
  | 'in_review';

export interface ListingData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  postedByRole: 'user' | 'staff';
  moderationStatus: ModerationStatus;
  lifecycleStatus: LifecycleStatus;
  isPublic: boolean;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  expiresAt?: Date | string | null;
  extensionCount?: number;
  lastExtendedAt?: Date | string | null;
  thumbnail: string | null;
  viewCount: number;
  favouriteCount: number;
  partnerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface ListingStats {
  all: number;
  active: number;
  public: number;
  inReview: number;
  draft: number;
  rejected: number;
  archived: number;
  suspended: number;
  sold: number;
  expired: number;
  deleted: number;
  deepInventory: number;
}

export interface ListingsResponse {
  success: boolean;
  data: ListingData[];
  listings: ListingData[]; // backwards compat
  stats?: ListingStats;
  meta: {
    count: number;
    limit: number;
    offset: number;
  };
}

export interface UseMyListingsOptions {
  /** Legacy status filter */
  status?: LegacyStatus;
  /** Filter by moderation status */
  moderationStatus?: ModerationStatus;
  /** Filter by lifecycle status */
  lifecycleStatus?: LifecycleStatus;
  /** 'personal' for user listings, 'work' for partner listings */
  listingType?: ListingType;
  /** For work listings - filter to specific staff member */
  staffMemberUserId?: string;
  /** Search query */
  q?: string;
  /** Sort order */
  sort?: ListingsSort;
  /** Include stats in response */
  includeStats?: boolean;
  /** Results per page (max 100) */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Partner ID for work listings */
  partnerId?: string;
  /** Enable/disable the query */
  enabled?: boolean;
}

// ============================================================================
// API Function
// ============================================================================

async function fetchMyListings(options: UseMyListingsOptions): Promise<ListingsResponse> {
  const params = new URLSearchParams();

  if (options.status) params.set('status', options.status);
  if (options.moderationStatus) params.set('moderationStatus', options.moderationStatus);
  if (options.lifecycleStatus) params.set('lifecycleStatus', options.lifecycleStatus);
  if (options.listingType) params.set('listingType', options.listingType);
  if (options.staffMemberUserId) params.set('staffMemberUserId', options.staffMemberUserId);
  if (options.partnerId) params.set('partnerId', options.partnerId);
  if (options.q) params.set('q', options.q);
  if (options.sort) params.set('sort', options.sort);
  if (options.includeStats !== false) params.set('includeStats', '1');
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.offset) params.set('offset', options.offset.toString());

  const res = await fetch(`/api/listings/my-listings?${params}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch listings');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function useMyListings(options: UseMyListingsOptions = {}) {
  const {
    status,
    moderationStatus,
    lifecycleStatus,
    listingType = 'personal',
    staffMemberUserId,
    partnerId,
    q,
    sort = 'newest',
    includeStats = true,
    limit = 50,
    offset = 0,
    enabled = true,
  } = options;

  // Build query key from all filter params
  const queryKey = [
    'my-listings',
    {
      status,
      moderationStatus,
      lifecycleStatus,
      listingType,
      staffMemberUserId,
      partnerId,
      q,
      sort,
      limit,
      offset,
    },
  ] as const;

  const query = useQuery<ListingsResponse, Error>({
    queryKey,
    queryFn: () =>
      fetchMyListings({
        status,
        moderationStatus,
        lifecycleStatus,
        listingType,
        staffMemberUserId,
        partnerId,
        q,
        sort,
        includeStats,
        limit,
        offset,
      }),
    staleTime: 0, // Always fetch fresh - server handles caching
    gcTime: 0, // No client-side caching
    enabled,
    refetchOnWindowFocus: true,
  });

  return {
    // Data
    listings: query.data?.data ?? [],
    stats: query.data?.stats ?? null,
    meta: query.data?.meta ?? null,

    // Query state
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,

    // Actions
    refetch: query.refetch,
  };
}

// ============================================================================
// Partner Listings Hook (convenience wrapper)
// ============================================================================

export interface UsePartnerListingsOptions extends Omit<UseMyListingsOptions, 'listingType'> {
  partnerId: string;
}

export function usePartnerListings(options: UsePartnerListingsOptions) {
  return useMyListings({
    ...options,
    listingType: 'work',
  });
}
