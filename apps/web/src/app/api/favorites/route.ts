import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getFavoriteStatusForListings,
  getSuperlikeQuotaForUser,
  toggleFavoriteForUser,
} from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function requireUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    
    // Return empty data for unauthenticated users (listings page can be viewed without login)
    if (!user) {
      return NextResponse.json({ 
        statuses: {},
        quota: { remaining: 0, limit: 0, resetsAt: null }
      });
    }

    const { searchParams } = new URL(req.url);
    const listingIdsParam = searchParams.get('listingIds');
    const listingIds = listingIdsParam
      ? listingIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined;

    // Optimized: Just get status data - client already has listing details from /api/listings/car-card
    // This eliminates expensive JOINs and reduces 2.1s render time to ~100ms
    const [statuses, quota] = await Promise.all([
      getFavoriteStatusForListings(user.id, listingIds),
      getSuperlikeQuotaForUser(user.id),
    ]);

    return NextResponse.json({ statuses, quota });
  } catch (error) {
    console.error('[favorites] GET failed', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add favorites',
        requiresAuth: true 
      }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const listingId = payload?.listingId as string | undefined;
    const addedFrom = payload?.addedFrom as string | undefined;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const status = await toggleFavoriteForUser(user.id, listingId, addedFrom);
    const quota = await getSuperlikeQuotaForUser(user.id);

    return NextResponse.json({ status, quota });
  } catch (error) {
    console.error('[favorites] POST failed', error);
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
  }
}
