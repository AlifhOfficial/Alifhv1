/**
 * Unread Count API
 * GET: Get total unread message count for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getTotalUnreadCount } from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const unreadLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';

// ============================================================================
// GET /api/conversations/unread-count
// Get total unread count across all conversations
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await unreadLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const unreadCount = await getTotalUnreadCount(user.id);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      { error: 'Failed to fetch unread count', details },
      { status: 500 }
    );
  }
}
