/**
 * API: Unified Favorites & Superlikes Status
 * GET /api/favorites-status - Fetch user's favorites, superlikes, and quota in one call
 * 
 * Purpose: Single source of truth for all favorite/superlike data
 * Authentication: Optional (returns empty for guests)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - Single API call for all favorite/superlike data
 * - Daily superlike quota tracking
 * - Optimized for React Query client-side caching
 * 
 * Cache Strategy:
 * - No server caching (React Query handles client-side)
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
  getSuperlikeQuotaForUser,
} from '@alifh/database';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0; // User-specific data must bypass CDN caching

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'private, no-store',
} as const;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    // Return empty data for guests (allows public browsing)
    if (!user) {
      const response = NextResponse.json({ 
        favorites: [],
        superlikes: [],
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

    // Fetch all data in parallel (single round trip)
    const [statusData, quota] = await Promise.all([
      getFavoriteStatusForListings(user.id),
      getSuperlikeQuotaForUser(user.id),
    ]);

    const remaining = (quota.maxSuperlikesPerMonth + (quota.premiumSuperlikesBonus || 0)) - quota.currentMonthSuperlikesUsed;

    const response = NextResponse.json({
      favorites: statusData.favorites,
      superlikes: statusData.superlikes,
      quota: {
        currentMonthSuperlikesUsed: quota.currentMonthSuperlikesUsed,
        maxSuperlikesPerMonth: quota.maxSuperlikesPerMonth,
        premiumSuperlikesBonus: quota.premiumSuperlikesBonus || 0,
        remaining,
        periodEndDate: quota.periodEndDate,
        periodStartDate: quota.periodStartDate,
      },
    });
    
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
