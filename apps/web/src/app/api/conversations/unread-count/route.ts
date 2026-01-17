/**
 * Unread Count API
 * GET: Get total unread message count for user (with scope support)
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
// Get total unread count across all conversations (with optional scope)
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

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') as 'personal' | 'staff' | null;

    // Get partner IDs for scoping
    const partnerIds = (user.partnerMemberships ?? []).map((m) => m.partnerId).filter(Boolean);
    
    // Determine partner scope filter
    const partnerScope =
      partnerIds.length > 0
        ? scope === 'staff'
          ? 'only'
          : scope === 'personal'
            ? 'exclude'
            : undefined
        : undefined;

    // Fetch unread count (lightweight query - just SUM from participant table)
    const unreadCount = await getTotalUnreadCount(user.id, partnerScope);

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
