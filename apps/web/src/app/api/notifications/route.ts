/**
 * Notifications API
 * GET: Fetch paginated notifications for the authenticated user
 * PATCH: Mark notification(s) as read
 * DELETE: Delete notification(s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from '@alifh/database';

export const runtime = 'nodejs';

// ============================================================================
// GET /api/notifications
// Fetch paginated notifications + unread count
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor') || undefined;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const [result, unreadCount] = await Promise.all([
      getUserNotifications(user.id, { limit, cursor, unreadOnly }),
      getUnreadNotificationCount(user.id),
    ]);

    // Resolve any raw storage keys in actorAvatarUrl to full public URLs
    const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const notifications = result.notifications.map((n: any) => {
      if (n.actorAvatarUrl && !n.actorAvatarUrl.startsWith('http') && r2PublicUrl) {
        return { ...n, actorAvatarUrl: `${r2PublicUrl.replace(/\/$/, '')}/${n.actorAvatarUrl}` };
      }
      return n;
    });

    return NextResponse.json({
      notifications,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      unreadCount,
    });
  } catch (error) {
    console.error('[Notifications API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/notifications
// Mark notification(s) as read
// Body: { notificationId?: string } — omit to mark all as read
// ============================================================================

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (notificationId) {
      // Mark single notification as read
      await markNotificationRead(notificationId, user.id);
    } else {
      // Mark all as read
      await markAllNotificationsRead(user.id);
    }

    const unreadCount = await getUnreadNotificationCount(user.id);

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error('[Notifications API] PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/notifications
// Delete notification(s)
// Body: { notificationId?: string } — omit to delete all
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (notificationId) {
      await deleteNotification(notificationId, user.id);
    } else {
      await deleteAllNotifications(user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
