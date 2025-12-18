import { NextRequest, NextResponse } from 'next/server';
import {
  getFavoriteStatusForListings,
  toggleFavoriteForUser,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  try {
    const user = await getSessionUser();
    
    // Return empty data for unauthenticated users (listings page can be viewed without login)
    // IMPORTANT: Empty response is NOT cached to ensure auth modal shows every time
    if (!user) {
      const response = NextResponse.json({ 
        favorites: [],
        superlikes: [],
      });
      // SECURITY: Prevent caching of empty response - allows auth modal to show repeatedly
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    const queryStart = performance.now();
    // Optimized: Fetch ALL user favorites (typically <50 items)
    // Returns simple arrays - client builds hash map instantly
    const { favorites, superlikes } = await getFavoriteStatusForListings(user.id);
    const queryTime = performance.now() - queryStart;

    const totalTime = performance.now() - startTime;

    const response = NextResponse.json({ favorites, superlikes });
    // SECURITY: Prevent browser caching of user-specific data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    return response;
  } catch (error) {
    console.error('[favorites] GET failed', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  try {
    const user = await getSessionUser();
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

    const toggleStart = performance.now();
    const status = await toggleFavoriteForUser(user.id, listingId, addedFrom);
    const toggleTime = performance.now() - toggleStart;

    const totalTime = performance.now() - startTime;

    return NextResponse.json({ status });
  } catch (error) {
    console.error('[favorites] POST failed', error);
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
  }
}
