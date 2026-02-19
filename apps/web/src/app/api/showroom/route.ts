/**
 * API: Showroom Directory
 * GET /api/showroom
 * 
 * Purpose: List all published showrooms for directory page
 * Authentication: Not required (public endpoint)
 * 
 * Query Params:
 * - page: Page number (default 1)
 * - limit: Items per page (default 12, max 50)
 * 
 * Returns: Paginated list of showrooms with partner branding
 */

import { NextRequest, NextResponse } from 'next/server';
import { CDN_HEADERS } from '@/lib/cdn-cache';
import { getPublishedShowrooms } from '@alifh/database';
import { getPublicUrl } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Uses searchParams

/**
 * Attach public URLs to showroom cards
 */
function attachCardUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  
  return {
    // Essential card data
    id: showroom.id,
    partnerId: showroom.partnerId,
    slug: showroom.slug,
    
    // Hero - Video first, then image fallback
    heroVideoUrl: showroom.heroVideoUrl || null,
    heroVideoFileUrl: getPublicUrl(showroom.heroVideoFile, cacheBuster),
    heroImageUrl: getPublicUrl(showroom.heroImage, cacheBuster),
    heroTagline: showroom.heroTagline,
    
    // Partner branding
    partner: {
      brandName: showroom.partner.brandName,
      logoUrl: getPublicUrl(showroom.partner.logo, cacheBuster),
      heroImageUrl: getPublicUrl(showroom.partner.heroImage, cacheBuster),
      isVerified: showroom.partner.isVerified,
      tier: showroom.partner.tier,
      googleRating: showroom.partner.googleRating,
      googleReviewCount: showroom.partner.googleReviewCount,
      city: showroom.partner.city,
      emirate: showroom.partner.emirate,
    },
    
    // Quick stats
    totalCarsSold: showroom.totalCarsSold,
    yearsInBusiness: showroom.yearsInBusiness,
    
    // Timestamps
    publishedAt: showroom.publishedAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    
    // Fetch published showrooms (cached internally)
    const { showrooms, total } = await getPublishedShowrooms(page, limit);
    
    // Transform to card format with URLs
    const cards = showrooms.map(attachCardUrls);
    
    return NextResponse.json(
      {
        showrooms: cards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
      {
        headers: CDN_HEADERS.showroom,
      }
    );
    
  } catch (error) {
    console.error('[api/showroom] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showrooms' }, { status: 500 });
  }
}
