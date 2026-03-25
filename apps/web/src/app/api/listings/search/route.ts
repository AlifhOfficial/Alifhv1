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
import { 
  urlToSearchParams,
  type SearchParams,
  type SearchResponse,
  type SearchFacets,
} from "@alifh/database";
import { getCachedSearchFacets, getCachedSearchResults } from '@/lib/search-cache';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limiting removed from search — adds ~100ms per request (Upstash REST round-trip).
// Public search is protected by Cloudflare's built-in DDoS/bot protection + CDN caching.
// Rate limiting is kept on auth, create, and mutation endpoints where it matters.

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {

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
    // Public search always uses cached fast results + separately cached facets.
    const queryStart = Date.now();
    const [searchResult, facets] = await Promise.all([
      getCachedSearchResults(params),
      getCachedSearchFacets(params),
    ]);
    const queryMs = Date.now() - queryStart;

    // Combine results (cached facets + fresh search results)
    const finalResult: SearchResponse = {
      ...searchResult,
      facets,
    };

    const totalMs = Date.now() - startTime;

    // Use raw Response with pre-stringified JSON + Content-Length for CF streaming
    const body = JSON.stringify(finalResult);
    const response = new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(new TextEncoder().encode(body).length),
        'Server-Timing': `db;dur=${queryMs}, total;dur=${totalMs}, search;dur=${searchResult.meta?.took ?? 0}`,
      },
    });

    // Log slow requests (>1s) for monitoring
    if (totalMs > 1000) {
      console.warn(`[search] Slow: ${totalMs}ms (db=${queryMs}ms, search=${searchResult.meta?.took ?? 0}ms) q=${params.q || '-'} make=${params.make?.join(',') || '-'}`);
    }

    return response;
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json(
      { error: "Failed to execute search" },
      { status: 500 }
    );
  }
}
