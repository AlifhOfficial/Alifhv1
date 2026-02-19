/**
 * Unread Count API
 * GET: Get total unread message count for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getTotalUnreadCount } from '@alifh/database';


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
