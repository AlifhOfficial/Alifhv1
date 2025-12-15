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
