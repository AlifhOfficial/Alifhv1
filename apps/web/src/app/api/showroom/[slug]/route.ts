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
import { applyCdnHeaders } from '@/lib/cdn-cache';
import {
  getPublishedShowroomBySlug,
  getPublishedShowroomByPartnerId,
  incrementShowroomViews,
} from '@alifh/database';
import { getCdnPublicUrl } from '@/utils';

export const runtime = 'nodejs';
// Enable edge caching for public pages
export const revalidate = 600; // 10 minutes

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
    showroomImages: toCdnArray(showroom.showroomImages),
    showroomExteriorImages: toCdnArray(showroom.showroomExteriorImages),
    clientLogos: toCdnArray(showroom.clientLogos),
    seoImage: toCdn(showroom.seoImage),
    // Hero
    heroVideoThumbnailUrl: toCdn(showroom.heroVideoThumbnail),
    heroImageUrl: toCdn(showroom.heroImage),
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
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => ({
      ...testimonial,
      customerImage: toCdn(testimonial.customerImage),
      customerImageUrl: toCdn(testimonial.customerImage),
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
    
    // Return with cache headers for CDN
    const response = NextResponse.json({ showroom: showroomWithUrls });
    applyCdnHeaders(response, 'showroomDetail');
    return response;
    
  } catch (error) {
    console.error('[api/showroom/[slug]] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showroom' }, { status: 500 });
  }
}
