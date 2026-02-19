/**
 * API: Toggle Favorite
 * POST /api/engagement/favorites - Toggle favorite status for a listing
 * 
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { toggleFavoriteForUser } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_ENGAGEMENT } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ToggleFavoriteSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  addedFrom: z.string().optional(),
});

const favoriteLimiter = createRateLimiter(RATE_LIMITS_ENGAGEMENT.FAVORITE);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add favorites',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Rate limiting: 30 favorites per minute
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await favoriteLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
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
