/**
 * API: Toggle Superlike
 * POST /api/engagement/superlikes - Toggle superlike for listing
 * 
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { toggleSuperlikeForUser, invalidateFavoritesCache } from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_ENGAGEMENT } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ToggleSuperlikeSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  addedFrom: z.string().optional(),
});

const superlikeLimiter = createRateLimiter(RATE_LIMITS_ENGAGEMENT.SUPERLIKE);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ 
        error: 'Please sign in to add superlikes',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Rate limiting: 10 superlikes per day
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await superlikeLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
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

    // Invalidate user's favorites cache (superlikes are part of it)
    invalidateFavoritesCache(user.id);

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
