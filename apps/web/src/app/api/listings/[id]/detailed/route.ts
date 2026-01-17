/**
 * API: Detailed Car Listing Endpoint
 * GET /api/listings/[id]/detailed
 * 
 * Purpose: Fetch comprehensive listing data with seller profile for detailed view pages
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Full specifications, features, and pricing insights
 * - Seller profile data (partner OR user) - NO stats (loaded separately via /api/sellers/stats)
 * 
 * Performance Optimizations:
 * - Query-level caching: getListingDetailed, getDealerBaseProfile, getStaffEffectivePhone, getUserProfileByUserId
 * - Response-level caching: Full response cached for 10min (invalidated via invalidateListingDetail)
 * - Stats are fetched separately via /api/sellers/stats to avoid blocking
 * 
 * Standards:
 * - Returns 404 for non-existent listings
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  memoryCache, 
  CacheTTL,
  CacheKeys,
  getListingDetailed, 
  getDealerBaseProfile, 
  getUserProfileByUserId,
  getStaffEffectivePhone,
} from "@alifh/database";
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const detailedLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_PUBLIC);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// No browser/CDN caching - server handles caching with proper invalidation
const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Extracted outside handler to avoid recreation on each request
type ListingResult = NonNullable<Awaited<ReturnType<typeof getListingDetailed>>>;

async function fetchSellerData(listing: ListingResult) {
  const start = performance.now();
  
  if (listing.partnerId) {
    // Partner listing - fetch dealer profile and staff phone (NO stats - loaded separately)
    const [partnerProfile, staffContact] = await Promise.all([
      getDealerBaseProfile(listing.partnerId),
      // Get contact info for currently assigned staff (userId is updated when reassigned)
      listing.postedByRole === 'staff' && listing.userId
        ? getStaffEffectivePhone(listing.userId, listing.partnerId)
        : Promise.resolve(null),
    ]);
    console.log(`[fetchSellerData] partner (getDealerBaseProfile + staffPhone): ${(performance.now() - start).toFixed(0)}ms`);
    
    return { 
      type: 'partner' as const, 
      partnerId: listing.partnerId,
      partner: partnerProfile, 
      // Stats loaded separately via /api/sellers/stats
      partnerStats: null,
      // Staff contact info (phone priority: staff work → company → staff personal)
      staffContact: staffContact ? {
        phone: staffContact.phone,
        displayName: staffContact.displayName,
      } : null,
    };
  } else {
    // User listing - fetch profile only (NO stats - loaded separately)
    const userProfile = await getUserProfileByUserId(listing.userId);
    console.log(`[fetchSellerData] user (getUserProfileByUserId): ${(performance.now() - start).toFixed(0)}ms`);
    
    return { 
      type: 'user' as const, 
      userId: listing.userId,
      userProfile,
    };
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const logTiming = (label: string) => console.log(`[listing-detailed] ${label}: ${(performance.now() - startTime).toFixed(0)}ms`);

  try {
    // Rate limit by IP (public endpoint)
    const identifier = getIdentifier(req);
    const rateLimitResult = await detailedLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }
    logTiming('rate-limit');

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Response cache key (includes listing + sellerData)
    // Invalidated via invalidateListingDetail() which clears both query and response caches
    const responseCacheKey = `listing:${id}:response`;
    
    // Check response cache first (full response with seller data)
    const cached = memoryCache.get(responseCacheKey);
    if (cached) {
      console.log(`[listing-detailed] CACHE HIT for ${id} - ${(performance.now() - startTime).toFixed(0)}ms`);
      return NextResponse.json(cached, { headers: CACHE_HEADERS });
    }

    // Fetch from database
    const listing = await getListingDetailed(id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    if (!listing.isPublic) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Fetch seller data (queries are individually cached)
    const sellerData = await fetchSellerData(listing);

    // Build response with listing + seller data
    const responseData = { listing, sellerData };

    // Cache full response for 10 minutes (invalidated via invalidateListingDetail)
    memoryCache.set(responseCacheKey, responseData, CacheTTL.listingDetail);
    logTiming('total');

    return NextResponse.json(responseData, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('[API] Error fetching detailed listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
