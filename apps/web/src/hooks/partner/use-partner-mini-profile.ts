"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PartnerMiniProfile {
  // Identity & Legal
  id: string;
  companyNameLegal: string;
  brandName: string;
  tradeLicense: string;
  
  // Status & Tier
  status: string;
  tier: string;
  
  // Contact & Location
  website: string | null;
  address: string | null;
  emirate: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number; // default: 1
  
  // Branding & Media
  logo: string | null;
  heroImage: string | null;
  
  // Business Information
  description: string | null;
  specialties: string[]; // default: []
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
  
  // Trust & Tags
  isVerified: boolean;
  badges: string[]; // default: []
  tags: string[]; // default: []
}

interface UpdatePartnerMiniProfileData {
  // Basic Information
  companyNameLegal?: string;
  brandName?: string;
  website?: string;
  
  // Location
  address?: string;
  emirate?: string;
  city?: string;
  locationLat?: number;
  locationLng?: number;
  showroomCount?: number;
  
  // Branding & Media
  logo?: string;
  heroImage?: string;
  
  // Business Information
  description?: string;
  specialties?: string[];
  experienceYears?: number;
  foundedYear?: number;
  
  // External Ratings
  googleReviewUrl?: string;
  
  // Trust & Tags
  badges?: string[];
  tags?: string[];
}

/**
 * Fetch partner mini profile
 */
async function fetchPartnerMiniProfile(partnerId: string): Promise<PartnerMiniProfile> {
  const response = await fetch(`/api/partners/${partnerId}/mini-profile`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch partner mini profile');
  }
  
  const data = await response.json();
  
  // Data is already normalized from the backend
  return data;
}

/**
 * Update partner mini profile
 */
async function updatePartnerMiniProfileApi(
  partnerId: string,
  data: UpdatePartnerMiniProfileData
): Promise<PartnerMiniProfile> {
  const response = await fetch(`/api/partners/${partnerId}/mini-profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update partner mini profile');
  }
  
  return response.json();
}

/**
 * Hook to fetch partner mini profile
 */
export function usePartnerMiniProfile(partnerId: string | null | undefined) {
  return useQuery({
    queryKey: ['partner', 'mini-profile', partnerId],
    queryFn: () => fetchPartnerMiniProfile(partnerId!),
    enabled: !!partnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for fresher data)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to update partner mini profile with optimistic updates
 */
export function useUpdatePartnerMiniProfile(partnerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePartnerMiniProfileData) =>
      updatePartnerMiniProfileApi(partnerId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['partner', 'mini-profile', partnerId] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<PartnerMiniProfile>(
        ['partner', 'mini-profile', partnerId]
      );

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<PartnerMiniProfile>(
          ['partner', 'mini-profile', partnerId],
          { ...previousProfile, ...newData }
        );
      }

      return { previousProfile };
    },
    onError: (_error, _newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ['partner', 'mini-profile', partnerId],
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['partner', 'mini-profile', partnerId] });
    },
  });
}
