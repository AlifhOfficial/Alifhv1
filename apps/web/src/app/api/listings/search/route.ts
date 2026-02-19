/**
 * API: Listing Search Endpoint
 * GET /api/listings/search
 * 
 * Purpose: Faceted search with 3-tier filters
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Basic search: text query (q)
 * - Medium filters: make, model, year, price, mileage, emirate
 * - Advanced filters: bodyType, fuelType, transmission, colors, etc.
 * - Faceted counts for filter UI
 * - URL-friendly params for shareable links
 * 

 * @module api/listings/search
 */

import { NextRequest, NextResponse } from "next/server";
import { applyCdnHeaders } from '@/lib/cdn-cache';
import { 
  searchListings,
  getSearchFacets,
  urlToSearchParams,
  type SearchParams,
  type SearchResponse,
  type SearchFacets,
} from "@alifh/database";
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_LISTINGS } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limit: 100 search requests per minute (more expensive than browse)
const searchLimiter = createRateLimiter({
  ...RATE_LIMITS_LISTINGS.BROWSE,
  maxRequests: 100, // Lower than browse due to facet computation
});



export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const identifier = getIdentifier(req);
    const rateLimitResult = await searchLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Parse search params from URL
    const { searchParams: urlParams } = new URL(req.url);
    const params = urlToSearchParams(urlParams);
    
    // Normalize sortBy to 'relevance' if not specified (ensures consistent cache keys)
    if (!params.sortBy) {
      params.sortBy = 'relevance';
    }

    // Validate limit
    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Execute queries in parallel
    const [searchResult, facets] = await Promise.all([
      searchListings(params, { 
        skipFacets: false,
        skipTotalCount: false,
      }),
      getSearchFacets(params),
    ]);

    // Combine results
    const finalResult: SearchResponse = {
      ...searchResult,
      facets,
    };

    const response = NextResponse.json(finalResult);
    applyCdnHeaders(response, 'search');

    return response;
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 }
    );
  }
}
