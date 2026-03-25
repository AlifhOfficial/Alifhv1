/**
 * API: Public Showroom Page
 * GET /api/showroom/[slug]
 * 
 * Purpose: Fetch published showroom data for public viewing
 * Authentication: Not required (public endpoint)
 * 
 * Performance:
 * - Aggressive caching (10 min memory + CDN headers)
 * - Single optimized query with partner join
 * - Increments view count (async, non-blocking)
 * 
 * Returns: Full showroom data with partner branding
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPublishedShowroomBySlug,
  getPublishedShowroomByPartnerId,
  incrementShowroomViews,
} from '@alifh/database';
import { getCdnPublicUrl } from '@/utils';

export const runtime = 'nodejs';
// Enable edge caching for public pages

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Attach public URLs to all image fields for public display
 */
function attachPublicUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  const toCdn = (key: string | null | undefined) => getCdnPublicUrl(key, cacheBuster);
  const toCdnArray = (keys: string[] | null | undefined) => (keys || []).map((key) => toCdn(key)).filter((key): key is string => Boolean(key));
  
  return {
    ...showroom,
    heroVideoThumbnail: toCdn(showroom.heroVideoThumbnail),
    heroImage: toCdn(showroom.heroImage),
    founderImage: toCdn(showroom.founderImage),
    brandStoryImage: toCdn(showroom.brandStoryImage),
    gallerySectionImage: toCdn(showroom.gallerySectionImage),
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
    // Founder
    founderImageUrl: toCdn(showroom.founderImage),
    // Brand Story
    brandStoryImageUrl: toCdn(showroom.brandStoryImage),
    // Section media
    gallerySectionImageUrl: toCdn(showroom.gallerySectionImage),
    teamSectionImageUrl: toCdn(showroom.teamSectionImage),
    achievementsSectionImageUrl: toCdn(showroom.achievementsSectionImage),
    testimonialsSectionImageUrl: toCdn(showroom.testimonialsSectionImage),
    servicesSectionImageUrl: toCdn(showroom.servicesSectionImage),
    // Gallery
    showroomImagesUrls: toCdnArray(showroom.showroomImages),
    // Exterior
    showroomExteriorImagesUrls: toCdnArray(showroom.showroomExteriorImages),
    // Client logos
    clientLogosUrls: toCdnArray(showroom.clientLogos),
    // SEO
    seoImageUrl: toCdn(showroom.seoImage),
    // Partner branding
    partner: {
      ...showroom.partner,
      logo: toCdn(showroom.partner.logo),
      heroImage: toCdn(showroom.partner.heroImage),
      logoUrl: toCdn(showroom.partner.logo),
      heroImageUrl: toCdn(showroom.partner.heroImage),
    },
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
    // Signature services
    signatureServices: (showroom.signatureServices || []).map((service: any) => ({
      ...service,
      image: toCdn(service.image),
      imageUrl: toCdn(service.image),
    })),
    // Press features
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logo: toCdn(feature.logo),
      logoUrl: toCdn(feature.logo),
    })),
  };
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    
    if (!slug || slug.length < 3) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    
    // Try slug first, then fallback to partner ID lookup
    let showroom = await getPublishedShowroomBySlug(slug);
    
    if (!showroom) {
      // Fallback: might be a partner ID instead of slug
      showroom = await getPublishedShowroomByPartnerId(slug);
    }
    
    if (!showroom) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }
    
    // Increment view count (async, don't await)
    incrementShowroomViews(showroom.id).catch(() => {
      // Silently fail - analytics are not critical
    });
    
    // Attach public URLs
    const showroomWithUrls = attachPublicUrls(showroom);
    
    return NextResponse.json({ showroom: showroomWithUrls });
    
  } catch (error) {
    console.error('[api/showroom/[slug]] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showroom' }, { status: 500 });
  }
}
