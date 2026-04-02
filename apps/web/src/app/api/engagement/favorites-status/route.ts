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
} from '@alifh/database';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeListings = searchParams.get('include') === 'listings';
    const limitParam = searchParams.get('limit');
    const listingsLimit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;
    
    const user = await getSessionUser();
    
    // Return empty data for guests (allows public browsing)
    if (!user) {
      const _response = NextResponse.json({ 
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[favorites-status] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load favorites status' },
      { status: 500 }
    );
  }
}
