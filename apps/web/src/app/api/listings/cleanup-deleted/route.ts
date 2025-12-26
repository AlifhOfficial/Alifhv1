/**
 * API: Cleanup Deleted Listings (Owner)
 * POST /api/listings/cleanup-deleted
 *
 * Permanently deletes listings that are already soft-deleted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { hardDeleteDeletedCarListingsForUser, memoryCache } from '@alifh/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const listingType = body?.listingType as 'personal' | 'work' | undefined;
    const olderThanDays = body?.olderThanDays as number | undefined;

    if (listingType && listingType !== 'personal' && listingType !== 'work') {
      return NextResponse.json(
        { error: 'Invalid listingType', validValues: ['personal', 'work'] },
        { status: 400 }
      );
    }

    if (olderThanDays !== undefined) {
      if (typeof olderThanDays !== 'number' || !Number.isFinite(olderThanDays) || olderThanDays < 0 || olderThanDays > 3650) {
        return NextResponse.json(
          { error: 'Invalid olderThanDays', validValues: '0..3650' },
          { status: 400 }
        );
      }
    }

    const count = await hardDeleteDeletedCarListingsForUser({
      userId: user.id,
      olderThanDays: olderThanDays ?? 0,
      listingType,
    });

    memoryCache.deleteByPrefix('listings:cards:');
    memoryCache.deleteByPrefix('listings:partner:');
    memoryCache.deleteByPrefix('listing:');
    memoryCache.deleteByPrefix('listing:detailed:');

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error cleaning up deleted listings:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup deleted listings' },
      { status: 500 }
    );
  }
}
