/**
 * API: Admin Listings Management
 * GET /api/admin/listings
 * 
 * Purpose: Fetch all listings for admin management
 * Authentication: Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getAdminListings, getAdminListingStats } from '@alifh/database';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
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
      stats = await getAdminListingStats({ type });
    }

    return NextResponse.json({
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
