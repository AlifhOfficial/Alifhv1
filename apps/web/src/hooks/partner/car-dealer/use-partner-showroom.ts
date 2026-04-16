/**
 * Partner Showroom Hook
 * 
 * React Query hook for managing showroom data
 * Black tier exclusive feature
 */

'use client';

import { useAsyncMutation } from '@/hooks/use-async-mutation';
import { useAsyncQuery } from '@/hooks/use-async-query';
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
  brandStoryImage: string | null;
  brandStoryImageUrl?: string | null;
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
  gallerySectionImage: string | null;
  gallerySectionImageUrl?: string | null;
  gallerySectionVideoUrl: string | null;
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
  teamSectionImage: string | null;
  teamSectionImageUrl?: string | null;
  teamSectionVideoUrl: string | null;
  
  // Achievements
  achievements: ShowroomAchievement[];
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  clientLogos: string[];
  achievementsSectionTitle: string;
  achievementsSectionImage: string | null;
  achievementsSectionImageUrl?: string | null;
  achievementsSectionVideoUrl: string | null;
  
  // Testimonials
  featuredTestimonials: ShowroomTestimonial[];
  testimonialsSectionTitle: string;
  testimonialsSectionImage: string | null;
  testimonialsSectionImageUrl?: string | null;
  testimonialsSectionVideoUrl: string | null;
  
  // Services
  signatureServices: ShowroomService[];
  vipPerks: string[];
  servicesSectionTitle: string;
  servicesSectionImage: string | null;
  servicesSectionImageUrl?: string | null;
  servicesSectionVideoUrl: string | null;
  
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
  'heroVideoThumbnailUrl' | 'heroImageUrl' | 'brandStoryImageUrl' | 'founderImageUrl' |
  'showroomImageUrls' | 'gallerySectionImageUrl' | 'teamSectionImageUrl' |
  'achievementsSectionImageUrl' | 'testimonialsSectionImageUrl' | 'servicesSectionImageUrl'
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
  const shouldFetch = !!partnerId && options?.initialShowroom === undefined;

  const query = useAsyncQuery({
    queryFn: () => fetchShowroom(partnerId!),
    enabled: shouldFetch,
    initialData: options?.initialShowroom ?? undefined,
  });

  const updateMutation = useAsyncMutation({
    mutationFn: (updates: ShowroomUpdateData) => updateShowroomAPI(partnerId!, updates),
    onSuccess: (data) => {
      query.setData(data);
    },
  });

  const publishMutation = useAsyncMutation({
    mutationFn: () => publishShowroomAPI(partnerId!),
    onSuccess: async () => {
      await query.refetch();
    },
  });

  const unpublishMutation = useAsyncMutation({
    mutationFn: () => unpublishShowroomAPI(partnerId!),
    onSuccess: async () => {
      await query.refetch();
    },
  });

  return {
    showroom: query.data ?? null,
    isLoading: query.isLoading,
    isError: !!query.error,
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
