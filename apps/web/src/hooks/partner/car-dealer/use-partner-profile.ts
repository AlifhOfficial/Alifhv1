/**
 * Partner Profile Hook - Unified with React Query
 * 
 * Clean implementation following user profile pattern
 * UI/UX → Hook → API → Query → DB
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';

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
  
  // Branding & Media (storage keys)
  logo: string | null;
  heroImage: string | null;
  // Cache-busted URLs (computed from storage keys + updatedAt)
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  
  // Timestamps
  updatedAt?: Date | string | null;
  
  // Business Information
  description: string | null;
  specialties: string[];
  experienceYears: number | null;
  foundedYear: number | null;
  
  // External Ratings
  googleReviewUrl: string | null;
  googlePlaceId: string | null;
  googleReviewsSyncedAt: Date | string | null;
  googleRating: number | null;
  googleReviewCount: number;
  
  // Platform Performance
  platformRating: number | null;
  platformReviewCount: number;
  
  // Trust & Verification
  isVerified: boolean;
  badges: string[]; // e.g., ["Revvup Certified", "BLK Member", "ISO 9001"]
  tags: string[];
  
  // ❌ Removed - Now in usePartnerStats() with 5min cache:
  // inventoryCount, totalSales, responseTime, responseRate
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

async function fetchPartnerProfile(partnerId: string, fresh = false): Promise<PartnerProfile> {
  const url = fresh 
    ? `/api/partners/${partnerId}/dealer-profile?fresh=true`
    : `/api/partners/${partnerId}/dealer-profile`;
  
  const res = await fetch(url, {
    credentials: 'include',
    // Skip browser cache when fetching fresh
    cache: fresh ? 'no-store' : 'default',
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
    cache: 'no-store', // Never cache PATCH
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update partner profile');
  }

  const result = await res.json();
  console.warn('[updatePartnerProfileAPI] Response:', { 
    logo: result.logo, 
    heroImage: result.heroImage,
    logoUrl: result.logoUrl,
    heroImageUrl: result.heroImageUrl 
  });
  return result;
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePartnerProfile(
  partnerId: string | null | undefined,
  initialData?: PartnerProfile | null
) {
  const queryClient = useQueryClient();
  const { session, setSessionUser } = useAuth();

  const query = useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: () => fetchPartnerProfile(partnerId!),
    enabled: !!partnerId,
    initialData: initialData ?? undefined,
    staleTime: initialData ? Infinity : 0,
    gcTime: initialData ? Infinity : undefined,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (updates: PartnerProfileUpdate) => updatePartnerProfileAPI(partnerId!, updates),
    onSuccess: (updatedProfile, variables) => {
      // Update local cache directly - no refetch needed
      queryClient.setQueryData(['partner-profile', partnerId], updatedProfile);
      
      // If logo or brandName changed, refresh session so sidebar updates
      const touchesSession = 'logo' in variables || 'brandName' in variables;
      if (touchesSession && session?.partnerMemberships?.length) {
        setSessionUser({
          ...session,
          partnerMemberships: session.partnerMemberships.map((membership) =>
            membership.partnerId === partnerId
              ? {
                  ...membership,
                  partnerName: updatedProfile.brandName,
                  partnerLogo: updatedProfile.logo,
                }
              : membership
          ),
        });
      }
    },
  });

  // Force refetch with fresh=true (bypasses server cache)
  const refetchFresh = async () => {
    if (!partnerId) return;
    const freshData = await fetchPartnerProfile(partnerId, true);
    queryClient.setQueryData(['partner-profile', partnerId], freshData);
    return freshData;
  };

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    refetchFresh,
  };
}
