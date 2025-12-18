/**
 * API: Favorites Management
 * GET /api/favorites - Fetch user's favorited listing IDs
 * POST /api/favorites - Toggle favorite status for a listing
 * 
 * Authentication: Optional (GET), Required (POST)
 * Session Source: getSessionUser() from middleware cache
 * 
 * Cache Strategy:
 * - No caching (user-specific, frequently changing data)
 * - Headers: no-store, no-cache, must-revalidate, private
 * 
 * Standards:
 * - Returns empty arrays for unauthenticated GET (public listings page support)
 * - Returns 401 for unauthenticated POST
 * - Returns 400 for invalid input
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getFavoriteStatusForListings,
  toggleFavoriteForUser,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
} as const;

const ToggleFavoriteSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  addedFrom: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      const response = NextResponse.json({ 
        favorites: [],
        superlikes: [],
      });
      Object.entries(CACHE_HEADERS).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    const { favorites, superlikes } = await getFavoriteStatusForListings(user.id);

    const response = NextResponse.json({ favorites, superlikes });
    Object.entries(CACHE_HEADERS).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[favorites] GET failed', error);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add favorites',
        requiresAuth: true 
      }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const result = ToggleFavoriteSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const { listingId, addedFrom } = result.data;
    const status = await toggleFavoriteForUser(user.id, listingId, addedFrom);

    return NextResponse.json({ status });
  } catch (error) {
    console.error('[favorites] POST failed', error);
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
  }
}
