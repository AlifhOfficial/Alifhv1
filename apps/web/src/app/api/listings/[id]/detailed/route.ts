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
 * - CDN-friendly caching (10min cache)
 * 
 * Performance:
 * - Stats are fetched separately to avoid blocking listing load
 * - Use /api/sellers/stats?type=partner|user&id=xxx for stats
 * 
 * Standards:
 * - Returns 404 for non-existent listings
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  memoryCache, 
  CacheTTL, 
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

    // Memory cache key (cache enabled in all environments - invalidation handles freshness)
    const cacheKey = `listing:detailed:${id}`;
    
    // Check memory cache first
    const cached = memoryCache.get(cacheKey);
    console.log(`[listing-detailed] cache check: ${cached ? 'HIT' : 'MISS'}, key=${cacheKey}`);
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

    // Fetch seller data
    const sellerData = await fetchSellerData(listing);

    // Build response with listing + seller data
    const responseData = { listing, sellerData };

    // Cache for 10 minutes (invalidated on listing changes)
    memoryCache.set(cacheKey, responseData, CacheTTL.listingDetail);
    console.log(`[listing-detailed] cached: ${cacheKey}, TTL=${CacheTTL.listingDetail}s`);
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
