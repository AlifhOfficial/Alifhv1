/**
 * API: Admin Listings Management
 * GET /api/admin/listings
 * 
 * Purpose: Fetch all listings for admin management
 * Authentication: Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getAdminListings, getAdminListingStats, memoryCache } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

const ADMIN_LISTING_STATS_TTL_SECONDS = 15;

export async function GET(req: NextRequest) {
  try {
    // Admin auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (sessionUser.role !== 'admin' && sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type') as 'user' | 'partner' | undefined;
    const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'updated';
    const includeStats = searchParams.get('includeStats') === '1' || searchParams.get('includeStats') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10) || 200, 500);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

    const listings = await getAdminListings({
      status: status || undefined,
      type: type || undefined,
      sort,
      limit,
      offset,
    });

    let stats: Awaited<ReturnType<typeof getAdminListingStats>> | undefined;
    if (includeStats) {
      const statsKey = `admin:listings:stats:${type ?? 'all'}`;
      stats = memoryCache.get(statsKey) ?? undefined;
      if (!stats) {
        stats = await getAdminListingStats({ type });
        memoryCache.set(statsKey, stats, ADMIN_LISTING_STATS_TTL_SECONDS);
      }
    }

    const response = NextResponse.json({
      success: true,
      data: listings,
      stats,
      meta: {
        limit,
        offset,
        count: listings.length,
        hasMore: listings.length === limit,
      },
    });
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
