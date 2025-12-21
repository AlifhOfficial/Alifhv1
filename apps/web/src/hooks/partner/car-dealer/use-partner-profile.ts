/**
 * Partner Profile Hook - Unified with React Query
 * 
 * Clean implementation following user profile pattern
 * UI/UX → Hook → API → Query → DB
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface PartnerProfile {
  // Identity & Legal
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  status: string;
  tier: string;
  
  // Contact & Location
  website: string | null;
  address: string | null;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number;
  
  // Branding & Media
  logo: string | null;
  heroImage: string | null;
  
  // Business Information
  description: string | null;
  specialties: string[];
  experienceYears: number | null;
  foundedYear: number | null;
  
  // External Ratings
  googleReviewUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number;
  
  // Platform Performance
  platformRating: number | null;
  platformReviewCount: number;
  
  // ❌ Removed denormalized fields (calculate on-demand with 5min cache):
  // totalInventory, activeListings, avgResponseTime, responseRate
  
  // Trust & Verification
  isVerified: boolean;
  badges: string[];
  tags: string[];
}

export interface PartnerProfileUpdate {
  companyNameLegal?: string;
  brandName?: string;
  website?: string;
  address?: string;
  emirate?: string;
  city?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  showroomCount?: number;
  logo?: string | null;
  heroImage?: string | null;
  description?: string;
  specialties?: string[];
  experienceYears?: number;
  foundedYear?: number;
  googleReviewUrl?: string;
  badges?: string[];
  tags?: string[];
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchPartnerProfile(partnerId: string): Promise<PartnerProfile> {
  const res = await fetch(`/api/partners/${partnerId}/dealer-profile`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch partner profile');
  }

  return res.json();
}

async function updatePartnerProfileAPI(partnerId: string, updates: PartnerProfileUpdate): Promise<PartnerProfile> {
  const res = await fetch(`/api/partners/${partnerId}/dealer-profile`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update partner profile');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePartnerProfile(partnerId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => fetchPartnerProfile(partnerId!),
    enabled: !!partnerId,
    staleTime: 30 * 1000, // 30s
    gcTime: 5 * 60 * 1000, // 5min
  });

  const mutation = useMutation({
    mutationFn: (updates: PartnerProfileUpdate) => updatePartnerProfileAPI(partnerId!, updates),
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['partner-profile', partnerId] });
    },
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
