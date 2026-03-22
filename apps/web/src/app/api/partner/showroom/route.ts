/**
 * API: Partner Showroom (Black Tier Exclusive)
 * GET/PATCH /api/partner/showroom
 * 
 * Purpose: Premium brand showroom management for Black tier partners
 * 
 * Authentication: Required (must be Black tier partner staff with owner/admin role)
 * 
 * GET: Returns showroom data for form population (creates if doesn't exist)
 * PATCH: Updates showroom fields
 * 
 * Standards:
 * - Returns 401 for unauthenticated requests
 * - Returns 403 for non-Black tier partners or insufficient permissions
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getShowroomByPartnerId,
  createShowroom,
  updateShowroom,
  type ShowroomUpdateInput,
} from '@alifh/database';
import { getCdnPublicUrl } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// ============================================================================
// Validation Schemas
// ============================================================================

const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
  image: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  order: z.number(),
});

const AchievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  issuer: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  image: z.string().nullable().optional(),
  order: z.number(),
});

const TestimonialSchema = z.object({
  id: z.string(),
  customerName: z.string().min(1),
  customerTitle: z.string().nullable().optional(),
  customerImage: z.string().nullable().optional(),
  customerImageUrl: z.string().nullable().optional(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  vehiclePurchased: z.string().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  source: z.enum(['manual', 'google']).optional(),
  sourceUrl: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  order: z.number(),
});

const ServiceSchema = z.object({
  id: z.string(),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  order: z.number(),
});

const PressFeatureSchema = z.object({
  id: z.string(),
  publication: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().nullable().optional(),
  logo: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  order: z.number(),
});

const ShowroomUpdateSchema = z.object({
  // Hero Section
  heroVideoUrl: z.string().url().nullable().optional(),
  heroVideoFile: z.string().nullable().optional(),
  heroVideoThumbnail: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroTagline: z.string().max(80).nullable().optional(),
  heroBackgroundType: z.enum(['video', 'image', 'gradient']).optional(),
  heroCtaText: z.string().max(30).optional(),
  heroCtaLink: z.string().url().nullable().optional(),
  heroCtaSecondaryText: z.string().max(30).optional(),
  heroCtaSecondaryLink: z.string().url().nullable().optional(),
  
  // Brand Story
  brandStoryTitle: z.string().max(50).optional(),
  brandStoryContent: z.string().max(5000).nullable().optional(),
  brandStoryImage: z.string().nullable().optional(),
  brandStoryVideoUrl: z.string().url().nullable().optional(),
  brandStoryVideoFile: z.string().nullable().optional(),
  brandPhilosophy: z.string().max(200).nullable().optional(),
  founderName: z.string().max(100).nullable().optional(),
  founderTitle: z.string().max(100).nullable().optional(),
  founderImage: z.string().nullable().optional(),
  founderQuote: z.string().max(500).nullable().optional(),
  
  // Gallery
  showroomImages: z.array(z.string()).max(12).optional(),
  gallerySectionImage: z.string().nullable().optional(),
  gallerySectionVideoUrl: z.string().url().nullable().optional(),
  showroomVideoTourUrl: z.string().url().nullable().optional(),
  showroomVideoTourFile: z.string().nullable().optional(),
  ambientStyle: z.enum(['modern', 'classic', 'industrial', 'luxury', 'minimal']).optional(),
  
  // Signature Collection
  signatureVehicleIds: z.array(z.string()).max(6).optional(),
  collectionTitle: z.string().max(50).optional(),
  collectionDescription: z.string().max(500).nullable().optional(),
  
  // Team
  teamMembers: z.array(TeamMemberSchema).max(6).optional(),
  teamSectionTitle: z.string().max(50).optional(),
  teamSectionImage: z.string().nullable().optional(),
  teamSectionVideoUrl: z.string().url().nullable().optional(),
  
  // Achievements
  achievements: z.array(AchievementSchema).max(10).optional(),
  totalCarsSold: z.number().nullable().optional(),
  yearsInBusiness: z.number().nullable().optional(),
  clientLogos: z.array(z.string()).max(10).optional(),
  achievementsSectionTitle: z.string().max(50).optional(),
  achievementsSectionImage: z.string().nullable().optional(),
  achievementsSectionVideoUrl: z.string().url().nullable().optional(),
  
  // Testimonials
  featuredTestimonials: z.array(TestimonialSchema).max(5).optional(),
  testimonialsSectionTitle: z.string().max(50).optional(),
  testimonialsSectionImage: z.string().nullable().optional(),
  testimonialsSectionVideoUrl: z.string().url().nullable().optional(),
  
  // Services
  signatureServices: z.array(ServiceSchema).max(6).optional(),
  vipPerks: z.array(z.string()).max(10).optional(),
  servicesSectionTitle: z.string().max(50).optional(),
  servicesSectionImage: z.string().nullable().optional(),
  servicesSectionVideoUrl: z.string().url().nullable().optional(),
  
  // Contact
  showroomAddress: z.string().max(500).nullable().optional(),
  showroomMapEmbedUrl: z.string().url().nullable().optional(),
  showroomExteriorImages: z.array(z.string()).max(5).optional(),
  parkingInfo: z.string().max(500).nullable().optional(),
  appointmentCtaText: z.string().max(50).optional(),
  
  // Social
  instagramHandle: z.string().url().nullable().optional(),
  youtubeChannelUrl: z.string().url().nullable().optional(),
  tiktokHandle: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  pressFeatures: z.array(PressFeatureSchema).max(10).optional(),
  
  // Theming
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  fontFamily: z.string().max(50).nullable().optional(),
  customCss: z.string().max(10000).nullable().optional(),
  
  // SEO
  seoTitle: z.string().max(60).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  seoImage: z.string().nullable().optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).nullable().optional(),
}).partial();

// ============================================================================
// Helpers
// ============================================================================

/**
 * Attach public URLs to all image and video fields
 */
function attachImageUrls(showroom: any, updatedAt: Date) {
  const cacheBuster = new Date(updatedAt).getTime();
  const toCdn = (key: string | null | undefined) => getCdnPublicUrl(key, cacheBuster);
  const toCdnArray = (keys: string[] | null | undefined) => (keys || []).map((key) => toCdn(key)).filter((key): key is string => Boolean(key));
  
  return {
    ...showroom,
    heroVideoThumbnail: toCdn(showroom.heroVideoThumbnail),
    heroImage: toCdn(showroom.heroImage),
    heroVideoFile: toCdn(showroom.heroVideoFile),
    brandStoryImage: toCdn(showroom.brandStoryImage),
    brandStoryVideoFile: toCdn(showroom.brandStoryVideoFile),
    gallerySectionImage: toCdn(showroom.gallerySectionImage),
    showroomVideoTourFile: toCdn(showroom.showroomVideoTourFile),
    founderImage: toCdn(showroom.founderImage),
    teamSectionImage: toCdn(showroom.teamSectionImage),
    achievementsSectionImage: toCdn(showroom.achievementsSectionImage),
    testimonialsSectionImage: toCdn(showroom.testimonialsSectionImage),
    servicesSectionImage: toCdn(showroom.servicesSectionImage),
    showroomImages: toCdnArray(showroom.showroomImages),
    showroomExteriorImages: toCdnArray(showroom.showroomExteriorImages),
    clientLogos: toCdnArray(showroom.clientLogos),
    seoImage: toCdn(showroom.seoImage),
    // Hero
    heroVideoThumbnailUrl: toCdn(showroom.heroVideoThumbnail),
    heroImageUrl: toCdn(showroom.heroImage),
    heroVideoFileUrl: toCdn(showroom.heroVideoFile),
    // Brand Story
    brandStoryImageUrl: toCdn(showroom.brandStoryImage),
    brandStoryVideoFileUrl: toCdn(showroom.brandStoryVideoFile),
    // Section media
    gallerySectionImageUrl: toCdn(showroom.gallerySectionImage),
    teamSectionImageUrl: toCdn(showroom.teamSectionImage),
    achievementsSectionImageUrl: toCdn(showroom.achievementsSectionImage),
    testimonialsSectionImageUrl: toCdn(showroom.testimonialsSectionImage),
    servicesSectionImageUrl: toCdn(showroom.servicesSectionImage),
    // Video Tour
    showroomVideoTourFileUrl: toCdn(showroom.showroomVideoTourFile),
    // Founder
    founderImageUrl: toCdn(showroom.founderImage),
    // Gallery
    showroomImagesUrls: toCdnArray(showroom.showroomImages),
    // Exterior
    showroomExteriorImagesUrls: toCdnArray(showroom.showroomExteriorImages),
    // Client logos
    clientLogosUrls: toCdnArray(showroom.clientLogos),
    // SEO
    seoImageUrl: toCdn(showroom.seoImage),
    // Team members
    teamMembers: (showroom.teamMembers || []).map((member: any) => ({
      ...member,
      image: toCdn(member.image),
      imageUrl: toCdn(member.image),
    })),
    // Achievements
    achievements: (showroom.achievements || []).map((achievement: any) => ({
      ...achievement,
      image: toCdn(achievement.image),
      imageUrl: toCdn(achievement.image),
    })),
    // Testimonials
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => {
      const cdnImage = toCdn(testimonial.customerImage);
      return {
        ...testimonial,
        customerImage: cdnImage || testimonial.customerImageUrl || null,
        customerImageUrl: testimonial.customerImageUrl || cdnImage || null,
      };
    }),
    // Press features
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logo: toCdn(feature.logo),
      logoUrl: toCdn(feature.logo),
    })),
  };
}

// ============================================================================
// GET - Fetch showroom data
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Must be a partner staff member
    if (!user.partnerMemberships?.length) {
      return NextResponse.json({ error: 'Not a partner member' }, { status: 403 });
    }
    
    const membership = user.partnerMemberships[0];
    
    // Must be Black tier
    if (membership.partnerTier !== 'black') {
      return NextResponse.json({ 
        error: 'Showroom is exclusive to Black tier partners' 
      }, { status: 403 });
    }
    
    // Must be owner or admin
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Owner or admin role required.' 
      }, { status: 403 });
    }
    
    // Get or create showroom
    let showroom = await getShowroomByPartnerId(membership.partnerId);
    
    if (!showroom) {
      // Auto-create showroom for Black tier partner
      showroom = await createShowroom({
        partnerId: membership.partnerId,
      });
    }
    
    // Auto-set slug if missing (for existing showrooms created before this fix)
    if (!showroom.slug) {
      showroom = await updateShowroom(showroom.id, { slug: membership.partnerId });
    }
    
    // Attach image URLs
    const showroomWithUrls = attachImageUrls(showroom, showroom.updatedAt);
    
    return NextResponse.json({
      showroom: showroomWithUrls,
    });
    
  } catch (error) {
    console.error('[api/partner/showroom] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showroom' }, { status: 500 });
  }
}

// ============================================================================
// PATCH - Update showroom data
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Must be a partner staff member
    if (!user.partnerMemberships?.length) {
      return NextResponse.json({ error: 'Not a partner member' }, { status: 403 });
    }
    
    const membership = user.partnerMemberships[0];
    
    // Must be Black tier
    if (membership.partnerTier !== 'black') {
      return NextResponse.json({ 
        error: 'Showroom is exclusive to Black tier partners' 
      }, { status: 403 });
    }
    
    // Must be owner or admin
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Owner or admin role required.' 
      }, { status: 403 });
    }
    
    
    // Parse and validate body
    const body = await req.json();
    const parseResult = ShowroomUpdateSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      }, { status: 400 });
    }
    
    const updates = parseResult.data as ShowroomUpdateInput;
    
    // Get current showroom (or create if doesn't exist)
    let showroom = await getShowroomByPartnerId(membership.partnerId);
    
    if (!showroom) {
      showroom = await createShowroom({
        partnerId: membership.partnerId,
      });
    }
    
    // Update showroom
    const updatedShowroom = await updateShowroom(
      showroom.id,
      updates,
      user.id
    );
    
    // Revalidate public showroom pages
    revalidatePath(`/showroom/${membership.partnerId}`);
    if (updatedShowroom.slug) {
      revalidatePath(`/showroom/${updatedShowroom.slug}`);
    }
    // Revalidate directory pages
    revalidatePath('/black');
    
    // Attach image URLs
    const showroomWithUrls = attachImageUrls(updatedShowroom, updatedShowroom.updatedAt);
    
    return NextResponse.json({
      showroom: showroomWithUrls,
    });
    
  } catch (error) {
    console.error('[api/partner/showroom] PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update showroom' }, { status: 500 });
  }
}
