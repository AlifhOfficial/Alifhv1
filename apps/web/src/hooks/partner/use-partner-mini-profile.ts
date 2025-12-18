/**
 * Partner Mini Profile Hook
 * 
 * Manages partner profile data fetching and updates with React Query.
 * Implements optimistic updates for better UX.
 * 
 * @returns Partner profile data and update mutation
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PartnerMiniProfile {
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
  
  // Inventory
  totalInventory: number;
  activeListings: number;
  
  // Response Metrics
  avgResponseTime: number | null;
  responseRate: number | null;
  
  // Trust & Verification
  isVerified: boolean;
  badges: string[];
  tags: string[];
}

export interface UpdatePartnerMiniProfileData {
  companyNameLegal?: string;
  brandName?: string;
  website?: string;
  address?: string;
  emirate?: string;
  city?: string;
  locationLat?: number;
  locationLng?: number;
  showroomCount?: number;
  logo?: string;
  heroImage?: string;
  description?: string;
  specialties?: string[];
  experienceYears?: number;
  foundedYear?: number;
  googleReviewUrl?: string;
  badges?: string[];
  tags?: string[];
}

async function fetchPartnerMiniProfile(partnerId: string): Promise<PartnerMiniProfile> {
  const response = await fetch(`/api/partners/${partnerId}/mini-profile`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch partner mini profile');
  }
  
  return response.json();
}

async function updatePartnerMiniProfile(
  partnerId: string,
  data: UpdatePartnerMiniProfileData
): Promise<PartnerMiniProfile> {
  const response = await fetch(`/api/partners/${partnerId}/mini-profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update partner mini profile');
  }
  
  return response.json();
}

export function usePartnerMiniProfile(partnerId: string | null | undefined) {
  return useQuery({
    queryKey: ['partner', 'mini-profile', partnerId],
    queryFn: () => fetchPartnerMiniProfile(partnerId!),
    enabled: !!partnerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUpdatePartnerMiniProfile(partnerId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['partner', 'mini-profile', partnerId];

  return useMutation({
    mutationFn: (data: UpdatePartnerMiniProfileData) =>
      updatePartnerMiniProfile(partnerId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });

      const previousProfile = queryClient.getQueryData<PartnerMiniProfile>(queryKey);

      if (previousProfile) {
        queryClient.setQueryData<PartnerMiniProfile>(queryKey, {
          ...previousProfile,
          ...newData,
        });
      }

      return { previousProfile };
    },
    onError: (_error, _newData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKey, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
