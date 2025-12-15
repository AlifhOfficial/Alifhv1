'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Listing {
  // Primary identification
  id: string;
  vin?: string | null;
  
  // Ownership & Seller
  partnerId?: string | null;
  userId?: string | null;
  sellerType?: string;
  isConsignment?: boolean;
  
  // Basic Vehicle Information
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  
  // Vehicle Specifications
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  specs?: string | null;
  steeringSide?: string | null;
  
  // Engine & Performance
  engineSize?: string | null;
  engineType?: string | null;
  cylinders?: number | null;
  power?: string | null;
  torque?: string | null;
  fuelEconomy?: string | null;
  
  // Physical Details
  doors?: number | null;
  seatingCapacity?: number | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  
  // Condition & Mileage
  mileage: number;
  
  // Pricing
  price: number;
  currency?: string;
  isNegotiable?: boolean;
  
  // AI Valuation & Market Intelligence
  fairValue?: number | null;
  estimateMin?: number | null;
  estimateMax?: number | null;
  priceTrend?: string | null;
  qiScore?: number | null;
  
  // Location
  emirate: string;
  city?: string | null;
  
  // Media & Content
  thumbnail?: string | null;
  images?: string[];
  videoUrl?: string | null;
  description?: string | null;
  
  // Features & Extras
  technicalFeatures?: Record<string, any>;
  extras?: string[];
  specialNotes?: Record<string, any>;
  warranty?: string | null;
  
  // Status & Publication
  status?: string;
  exportStatus?: string;
  
  // Badges & Tags
  badges?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isBlackMember?: boolean;
  
  // Engagement Metrics
  viewCount?: number;
  favouriteCount?: number;
  superlikeCount?: number;
  shareCount?: number;
  
  // Lead Generation Metrics
  inquiryCount?: number;
  bookingCount?: number;
  callCount?: number;
  whatsappCount?: number;
  
  // SEO & Discovery
  slug?: string | null;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  
  // Partner data (from join)
  partnerName?: string | null;
  partnerVerified?: boolean | null;
  partnerLogo?: string | null;
  partnerTier?: string | null;
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

      const response = await fetch(`/api/listings?status=published&limit=${LIMIT}&offset=${currentOffset}`, {
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

export function usePartnerListings(partnerId: string): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!partnerId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/listings/partner/${partnerId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch partner listings: ${response.status}`);
      }

      const data = await response.json();
      setListings(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[usePartnerListings] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    isLoadingMore: false,
    error,
    hasMore: false,
    totalCount: listings.length,
    refresh: fetchListings,
    loadMore: async () => {},
  };
}

// ==================== RESERVATION HOOKS ====================

interface UseReservationResult {
  isReserving: boolean;
  isUnreserving: boolean;
  error: string | null;
  reserveListing: (listingId: string) => Promise<boolean>;
  unreserveListing: (listingId: string) => Promise<boolean>;
}

export function useReservation(): UseReservationResult {
  const [isReserving, setIsReserving] = useState(false);
  const [isUnreserving, setIsUnreserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reserveListing = useCallback(async (listingId: string): Promise<boolean> => {
    try {
      setIsReserving(true);
      setError(null);

      const response = await fetch(`/api/listings/${listingId}/reserve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to reserve listing');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reserve listing';
      setError(errorMessage);
      console.error('[useReservation] Reserve error:', err);
      return false;
    } finally {
      setIsReserving(false);
    }
  }, []);

  const unreserveListing = useCallback(async (listingId: string): Promise<boolean> => {
    try {
      setIsUnreserving(true);
      setError(null);

      const response = await fetch(`/api/listings/${listingId}/reserve`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to cancel reservation');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reservation';
      setError(errorMessage);
      console.error('[useReservation] Unreserve error:', err);
      return false;
    } finally {
      setIsUnreserving(false);
    }
  }, []);

  return {
    isReserving,
    isUnreserving,
    error,
    reserveListing,
    unreserveListing,
  };
}

// ==================== WORKFLOW HOOKS ====================

interface UseListingWorkflowResult {
  isProcessing: boolean;
  error: string | null;
  publishListing: (listingId: string) => Promise<boolean>;
  submitForReview: (listingId: string) => Promise<boolean>;
  approveListing: (listingId: string) => Promise<boolean>;
  rejectListing: (listingId: string, reason: string) => Promise<boolean>;
  archiveListing: (listingId: string) => Promise<boolean>;
  markAsSold: (listingId: string, soldToUserId: string, soldPrice?: number) => Promise<boolean>;
}

export function useListingWorkflow(): UseListingWorkflowResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(async (
    url: string,
    method: string = 'POST',
    body?: any
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Action failed');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      console.error('[useListingWorkflow] Action error:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const publishListing = useCallback((listingId: string) => 
    performAction(`/api/listings/${listingId}/workflow`, 'POST', { action: 'publish' }), 
    [performAction]
  );

  const submitForReview = useCallback((listingId: string) => 
    performAction(`/api/listings/${listingId}/workflow`, 'POST', { action: 'submit_for_review' }), 
    [performAction]
  );

  const approveListing = useCallback((listingId: string) => 
    performAction(`/api/listings/${listingId}/workflow`, 'POST', { action: 'approve' }), 
    [performAction]
  );

  const rejectListing = useCallback((listingId: string, rejectionReason: string) => 
    performAction(`/api/listings/${listingId}/workflow`, 'POST', { action: 'reject', rejectionReason }), 
    [performAction]
  );

  const archiveListing = useCallback((listingId: string) => 
    performAction(`/api/listings/${listingId}/archive`, 'POST'), 
    [performAction]
  );

  const markAsSold = useCallback((listingId: string, soldToUserId: string, soldPrice?: number) => 
    performAction(`/api/listings/${listingId}/mark-sold`, 'POST', { soldToUserId, soldPrice }), 
    [performAction]
  );

  return {
    isProcessing,
    error,
    publishListing,
    submitForReview,
    approveListing,
    rejectListing,
    archiveListing,
    markAsSold,
  };
}

// ==================== ADMIN HOOKS ====================

interface UseAdminListingsResult {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminListings(type: 'pending' | 'reserved' | 'sold' = 'pending'): UseAdminListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/listings/admin?type=${type}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch admin listings');
      }

      const data = await response.json();
      setListings(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(errorMessage);
      console.error('[useAdminListings] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    refresh: fetchListings,
  };
}
