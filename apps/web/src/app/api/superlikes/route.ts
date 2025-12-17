import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getFavoriteStatusForListings,
  getSuperlikeQuotaForUser,
  toggleSuperlikeForUser,
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
    const includeStatuses = searchParams.get('includeStatuses') === 'true';
    
    const listingIds = listingIdsParam
      ? listingIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined;

    // Optimized: Only fetch statuses if requested
    // listings/page.tsx calls this for quota only, so we skip the expensive status fetch
    const [statuses, quota] = await Promise.all([
      includeStatuses ? getFavoriteStatusForListings(user.id, listingIds) : Promise.resolve({}),
      getSuperlikeQuotaForUser(user.id),
    ]);

    return NextResponse.json({ statuses: includeStatuses ? statuses : undefined, quota });
  } catch (error) {
    console.error('[superlikes] GET failed', error);
    return NextResponse.json({ error: 'Failed to load superlikes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add superlikes',
        requiresAuth: true 
      }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const listingId = payload?.listingId as string | undefined;
    const addedFrom = payload?.addedFrom as string | undefined;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const result = await toggleSuperlikeForUser(user.id, listingId, addedFrom);

    return NextResponse.json({ 
      status: {
        isFavorite: result.isFavorite,
        isSuperliked: result.isSuperliked
      },
      quota: result.quota 
    });
  } catch (error) {
    console.error('[superlikes] POST failed', error);
    const message = error instanceof Error ? error.message : 'Failed to update superlike';
    const statusCode = message === 'Superlike limit reached' ? 429 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
