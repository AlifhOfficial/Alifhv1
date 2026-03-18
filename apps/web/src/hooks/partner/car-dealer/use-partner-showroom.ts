/**
 * Partner Showroom Hook
 * 
 * React Query hook for managing showroom data
 * Black tier exclusive feature
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ShowroomTeamMember,
  ShowroomAchievement,
  ShowroomTestimonial,
  ShowroomService,
  ShowroomPressFeature,
} from '@alifh/database';

// ============================================================================
// Types
// ============================================================================

export interface PartnerShowroom {
  id: string;
  partnerId: string;
  
  // Hero Section
  heroVideoUrl: string | null;
  heroVideoFile: string | null;
  heroVideoThumbnail: string | null;
  heroImage: string | null;
  heroTagline: string | null;
  heroBackgroundType: 'video' | 'image' | 'gradient';
  heroCtaText: string;
  heroCtaLink: string | null;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string | null;
  
  // URLs (computed from storage keys)
  heroVideoFileUrl?: string | null;
  heroVideoThumbnailUrl?: string | null;
  heroImageUrl?: string | null;
  
  // Brand Story
  brandStoryTitle: string;
  brandStoryContent: string | null;
  brandStoryVideoUrl: string | null;
  brandStoryVideoFile: string | null;
  brandStoryVideoFileUrl?: string | null;
  brandPhilosophy: string | null;
  
  // Founder
  founderName: string | null;
  founderTitle: string | null;
  founderImage: string | null;
  founderImageUrl?: string | null;
  founderQuote: string | null;
  
  // Gallery
  showroomImages: string[];
  showroomImageUrls?: string[];
  showroomVideoTourUrl: string | null;
  showroomVideoTourFile: string | null;
  showroomVideoTourFileUrl?: string | null;
  ambientStyle: 'modern' | 'classic' | 'industrial' | 'luxury' | 'minimal';
  
  // Signature Collection
  signatureVehicleIds: string[];
  collectionTitle: string;
  collectionDescription: string | null;
  
  // Team
  teamMembers: ShowroomTeamMember[];
  teamSectionTitle: string;
  
  // Achievements
  achievements: ShowroomAchievement[];
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  clientLogos: string[];
  achievementsSectionTitle: string;
  
  // Testimonials
  featuredTestimonials: ShowroomTestimonial[];
  testimonialsSectionTitle: string;
  
  // Services
  signatureServices: ShowroomService[];
  vipPerks: string[];
  servicesSectionTitle: string;
  
  // Contact & Location
  showroomAddress: string | null;
  showroomMapEmbedUrl: string | null;
  showroomExteriorImages: string[];
  parkingInfo: string | null;
  appointmentCtaText: string;
  
  // Social
  instagramHandle: string | null;
  instagramFeedEnabled: boolean;
  youtubeChannelUrl: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  pressFeatures: ShowroomPressFeature[];
  
  // Theming
  primaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  customCss: string | null;
  
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  slug: string | null;
  
  // Publishing
  isPublished: boolean;
  publishedAt: string | null;
  lastEditedAt: string | null;
  
  // Analytics
  viewCount: number;
  uniqueVisitors: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type ShowroomUpdateData = Partial<Omit<
  PartnerShowroom,
  'id' | 'partnerId' | 'createdAt' | 'updatedAt' | 'viewCount' | 'uniqueVisitors' |
  'heroVideoThumbnailUrl' | 'heroImageUrl' | 'founderImageUrl' | 'showroomImageUrls'
>>;

// ============================================================================
// API Functions
// ============================================================================

async function fetchShowroom(partnerId: string): Promise<PartnerShowroom> {
  const res = await fetch('/api/partner/showroom', {
    credentials: 'include',
    headers: { 'x-partner-id': partnerId },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch showroom');
  }

  const data = await res.json();
  return data.showroom;
}

async function updateShowroomAPI(partnerId: string, updates: ShowroomUpdateData): Promise<PartnerShowroom> {
  const res = await fetch('/api/partner/showroom', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      'x-partner-id': partnerId,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update showroom');
  }

  const data = await res.json();
  return data.showroom;
}

async function publishShowroomAPI(partnerId: string): Promise<{ success: boolean; isPublished: boolean; publishedAt?: string; slug?: string }> {
  const res = await fetch('/api/partner/showroom/publish', {
    method: 'POST',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      'x-partner-id': partnerId,
    },
    body: JSON.stringify({ action: 'publish' }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to publish showroom');
  }

  return res.json();
}

async function unpublishShowroomAPI(partnerId: string): Promise<{ success: boolean; isPublished: boolean }> {
  const res = await fetch('/api/partner/showroom/publish', {
    method: 'POST',
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      'x-partner-id': partnerId,
    },
    body: JSON.stringify({ action: 'unpublish' }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to unpublish showroom');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePartnerShowroom(
  partnerId: string | null | undefined,
  options?: {
    initialShowroom?: PartnerShowroom | null;
  }
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['partner-showroom', partnerId],
    queryFn: () => fetchShowroom(partnerId!),
    enabled: !!partnerId,
    initialData: options?.initialShowroom ?? undefined,
    staleTime: options?.initialShowroom ? Infinity : 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: ShowroomUpdateData) => updateShowroomAPI(partnerId!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['partner-showroom', partnerId], data);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishShowroomAPI(partnerId!),
    onSuccess: () => {
      // Refetch to get latest data with resolved URLs
      queryClient.invalidateQueries({ queryKey: ['partner-showroom', partnerId] });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishShowroomAPI(partnerId!),
    onSuccess: () => {
      // Refetch to get latest data
      queryClient.invalidateQueries({ queryKey: ['partner-showroom', partnerId] });
    },
  });

  return {
    showroom: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Update
    updateShowroom: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    // Publish/Unpublish
    publish: publishMutation.mutateAsync,
    unpublish: unpublishMutation.mutateAsync,
    isPublishing: publishMutation.isPending || unpublishMutation.isPending,
    
    // Refetch
    refetch: query.refetch,
  };
}
