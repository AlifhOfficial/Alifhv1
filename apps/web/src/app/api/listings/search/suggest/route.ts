/**
 * API: Quick Search / Auto-suggest Endpoint
 * GET /api/listings/search/suggest
 * 
 * Purpose: Fast auto-complete for header search bar
 * Returns: Make/model suggestions as user types
 * 
 * Query Params:
 * - q: Search query (min 2 chars)
 * - limit: Max suggestions (default: 8, max: 20)
 * 
 * Cache Strategy:
 * - Memory: 30s (suggestions don't change often)
 * - CDN: 60s (very cacheable)
 * 
 * @module api/listings/search/suggest
 */

import { NextRequest, NextResponse } from "next/server";
import { memoryCache, quickSearch } from "@alifh/database";
import { createRateLimiter, getIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limit: 200 requests per minute (fast typing = many requests)
const suggestLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 200,
  keyPrefix: 'suggest',
  description: 'Search suggestions',
});

const CACHE_TTL = 30_000; // 30 seconds

const CDN_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(req);
    const rateLimitResult = await suggestLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limitParam = Number(searchParams.get('limit') || '8');
    const limit = Math.min(Math.max(limitParam, 1), 20);

    // Require minimum 2 characters
    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Check cache
    const isProd = process.env.NODE_ENV === 'production';
    const cacheKey = `suggest:${query.toLowerCase()}:${limit}`;

    if (isProd) {
      const cached = memoryCache.get<any>(cacheKey);
      if (cached) {
        const response = NextResponse.json(cached);
        Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
          response.headers.set(key, value)
        );
        return response;
      }
    }

    // Execute quick search
    const suggestions = await quickSearch(query, limit);

    const result = { suggestions };

    // Cache in production
    if (isProd) {
      memoryCache.set(cacheKey, result, CACHE_TTL);
    }

    const response = NextResponse.json(result);
    
    if (isProd) {
      Object.entries(CDN_CACHE_HEADERS).forEach(([key, value]) =>
        response.headers.set(key, value)
      );
    } else {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    console.error('[suggest] Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
