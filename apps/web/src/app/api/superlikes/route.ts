/**
 * API: Superlikes Management
 * GET /api/superlikes - Fetch user's superlikes and quota
 * POST /api/superlikes - Toggle superlike for listing
 * 
 * Purpose: Manage premium listing favorites with daily quota
 * Authentication: Optional for GET (returns empty for guests), Required for POST
 * Session Source: getSessionUser() from middleware cache
 * 
 * Features:
 * - Daily superlike quota tracking
 * - Optional status fetching (includeStatuses param)
 * - Optimized for quota-only queries
 * - Auth modal support for guests
 * 
 * Cache Strategy:
 * - No browser caching (user-specific data)
 * - Empty response not cached (allows auth modal)
 * 
 * Standards:
 * - Returns 400 for invalid input
 * - Returns 401 for unauthenticated POST
 * - Returns 429 for quota exceeded
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getFavoriteStatusForListings,
  getSuperlikeQuotaForUser,
  toggleSuperlikeForUser,
} from '@alifh/database';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30s to reduce DB load

const CACHE_HEADERS_NO_CACHE = {
  'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
} as const;

const ToggleSuperlikeSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  addedFrom: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      const response = NextResponse.json({ 
        statuses: {}, 
        quota: { remaining: 0, limit: 0, resetsAt: null } 
      });
      Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    const { searchParams } = new URL(req.url);
    const includeStatuses = searchParams.get('includeStatuses') === 'true';

    const quota = await getSuperlikeQuotaForUser(user.id);

    let favorites: string[] = [];
    let superlikes: string[] = [];
    if (includeStatuses) {
      const result = await getFavoriteStatusForListings(user.id);
      favorites = result.favorites;
      superlikes = result.superlikes;
    }

    const response = NextResponse.json({ 
      favorites: includeStatuses ? favorites : undefined, 
      superlikes: includeStatuses ? superlikes : undefined, 
      quota 
    });
    Object.entries(CACHE_HEADERS_NO_CACHE).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('[superlikes] GET failed', error);
    return NextResponse.json({ error: 'Failed to load superlikes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add superlikes',
        requiresAuth: true 
      }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const validationResult = ToggleSuperlikeSchema.safeParse(payload);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { listingId, addedFrom } = validationResult.data;
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
