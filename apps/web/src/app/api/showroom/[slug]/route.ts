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
import { getPublicUrl } from '@/utils';

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
  
  return {
    ...showroom,
    // Hero
    heroVideoThumbnailUrl: getPublicUrl(showroom.heroVideoThumbnail, cacheBuster),
    heroImageUrl: getPublicUrl(showroom.heroImage, cacheBuster),
    // Founder
    founderImageUrl: getPublicUrl(showroom.founderImage, cacheBuster),
    // Gallery
    showroomImagesUrls: (showroom.showroomImages || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // Exterior
    showroomExteriorImagesUrls: (showroom.showroomExteriorImages || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // Client logos
    clientLogosUrls: (showroom.clientLogos || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // SEO
    seoImageUrl: getPublicUrl(showroom.seoImage, cacheBuster),
    // Partner branding
    partner: {
      ...showroom.partner,
      logoUrl: getPublicUrl(showroom.partner.logo, cacheBuster),
      heroImageUrl: getPublicUrl(showroom.partner.heroImage, cacheBuster),
    },
    // Team members
    teamMembers: (showroom.teamMembers || []).map((member: any) => ({
      ...member,
      imageUrl: getPublicUrl(member.image, cacheBuster),
    })),
    // Achievements
    achievements: (showroom.achievements || []).map((achievement: any) => ({
      ...achievement,
      imageUrl: getPublicUrl(achievement.image, cacheBuster),
    })),
    // Testimonials
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => ({
      ...testimonial,
      customerImageUrl: getPublicUrl(testimonial.customerImage, cacheBuster),
    })),
    // Press features
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logoUrl: getPublicUrl(feature.logo, cacheBuster),
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
    return NextResponse.json(
      { showroom: showroomWithUrls },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
    
  } catch (error) {
    console.error('[api/showroom/[slug]] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showroom' }, { status: 500 });
  }
}
