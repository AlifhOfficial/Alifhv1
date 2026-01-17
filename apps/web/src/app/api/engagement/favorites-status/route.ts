/**
 * API: Unified Favorites & Superlikes Status
 * GET /api/engagement/favorites-status - Fetch user's favorites, superlikes, and quota in one call
 * 
 * Purpose: Single source of truth for all favorite/superlike data
 * Authentication: Optional (returns empty for guests)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - Single API call for all favorite/superlike data
 * - Daily superlike quota tracking
 * - Optional listing data inclusion (avoids second car-card API call)
 * - Optimized for React Query client-side caching
 * 
 * Query Params:
 * - include=listings: Include full listing data for favorites (navbar, favorites page)
 * - limit: Max listings to include (default: 50, for include=listings)
 * 
 * Cache Strategy:
 * - Server memory cache: 5 minutes (invalidated on toggle)
 * - Private, no-store headers (user-specific data)
 * 
 * Standards:
 * - Returns empty arrays for unauthenticated users
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getFavoriteStatusForListings,
  getFavoritesWithListings,
  getSuperlikeQuotaForUser,
  memoryCache,
} from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const statusLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0; // User-specific data must bypass CDN caching

// Cache TTL: 5 minutes (invalidated on favorite/superlike toggle)
const FAVORITES_CACHE_TTL = 300;

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'private, no-store',
} as const;

// Helper to generate cache key for user's favorites status
function getFavoritesStatusCacheKey(userId: string, includeListings: boolean): string {
  return includeListings 
    ? `favorites:status:full:${userId}` 
    : `favorites:status:${userId}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeListings = searchParams.get('include') === 'listings';
    const limitParam = searchParams.get('limit');
    const listingsLimit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;
    
    const user = await getSessionUser();
    
    // Return empty data for guests (allows public browsing)
    if (!user) {
      const response = NextResponse.json({ 
        favorites: [],
        superlikes: [],
        listings: includeListings ? [] : undefined,
        quota: { 
          currentMonthSuperlikesUsed: 0,
          maxSuperlikesPerMonth: 0,
          premiumSuperlikesBonus: 0,
          remaining: 0,
          periodEndDate: null,
        }
      });
      Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    // Rate limit by user (only for authenticated users)
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await statusLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Check cache first
    const cacheKey = getFavoritesStatusCacheKey(user.id, includeListings);
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    // ⚡ OPTIMIZED: Single query for favorites + listings OR just IDs
    // Previously: getFavoriteStatusForListings → getListingCards (2 queries)
    // Now: getFavoritesWithListings (1 query with JOIN)
    
    let favorites: string[];
    let superlikes: string[];
    let listings: unknown[] | undefined;

    if (includeListings) {
      // Single query: IDs + listing data via JOIN
      const result = await getFavoritesWithListings(user.id, { limit: listingsLimit });
      favorites = result.favorites;
      superlikes = result.superlikes;
      listings = result.listings;
    } else {
      // IDs only (faster, no JOIN needed)
      const result = await getFavoriteStatusForListings(user.id);
      favorites = result.favorites;
      superlikes = result.superlikes;
    }

    // Fetch quota (separate query - different table)
    const quota = await getSuperlikeQuotaForUser(user.id);
    const remaining = (quota.maxSuperlikesPerMonth + (quota.premiumSuperlikesBonus || 0)) - quota.currentMonthSuperlikesUsed;

    const responseData = {
      favorites,
      superlikes,
      ...(includeListings && { listings }),
      quota: {
        currentMonthSuperlikesUsed: quota.currentMonthSuperlikesUsed,
        maxSuperlikesPerMonth: quota.maxSuperlikesPerMonth,
        premiumSuperlikesBonus: quota.premiumSuperlikesBonus || 0,
        remaining,
        periodEndDate: quota.periodEndDate,
        periodStartDate: quota.periodStartDate,
      },
    };

    // Cache for 5 minutes (invalidated on favorite/superlike toggle)
    memoryCache.set(cacheKey, responseData, FAVORITES_CACHE_TTL);

    const response = NextResponse.json(responseData);
    
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    
    return response;
  } catch (error) {
    console.error('[favorites-status] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load favorites status' },
      { status: 500 }
    );
  }
}
