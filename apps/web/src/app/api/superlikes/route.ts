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
  const startTime = performance.now();
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
    const includeStatuses = searchParams.get('includeStatuses') === 'true';

    const quotaStart = performance.now();
    const quota = await getSuperlikeQuotaForUser(user.id);
    const quotaTime = performance.now() - quotaStart;

    // Optimized: Only fetch ALL user favorites/superlikes if requested
    // listings/page.tsx calls this for quota only, so we skip the fetch
    let favorites: string[] = [];
    let superlikes: string[] = [];
    let statusTime = 0;
    if (includeStatuses) {
      const statusStart = performance.now();
      const result = await getFavoriteStatusForListings(user.id);
      favorites = result.favorites;
      superlikes = result.superlikes;
      statusTime = performance.now() - statusStart;
    }

    const totalTime = performance.now() - startTime;

    const response = NextResponse.json({ 
      favorites: includeStatuses ? favorites : undefined, 
      superlikes: includeStatuses ? superlikes : undefined, 
      quota 
    });
    // SECURITY: Prevent browser caching of user-specific data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    return response;
  } catch (error) {
    console.error('[superlikes] GET failed', error);
    return NextResponse.json({ error: 'Failed to load superlikes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();
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

    const toggleStart = performance.now();
    const result = await toggleSuperlikeForUser(user.id, listingId, addedFrom);
    const toggleTime = performance.now() - toggleStart;

    const totalTime = performance.now() - startTime;

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
