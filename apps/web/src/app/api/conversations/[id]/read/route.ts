/**
 * Mark Conversation as Read API
 * PATCH: Mark all messages in conversation as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { markConversationAsRead, getConversationParticipants } from '@alifh/database';


export const runtime = 'nodejs';

// ============================================================================
// PATCH /api/conversations/:id/read
// Mark conversation as read (reset unread count)
// ============================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    const { id } = await params;
    const body = await req.json().catch(() => ({})) as { messageId?: unknown };
    const messageId = typeof body.messageId === 'string' ? body.messageId : undefined;
    const lastReadAt = (await markConversationAsRead(id, user.id, messageId)).toISOString();

    const response = NextResponse.json({ success: true, lastReadAt });

    // Broadcast read receipt to each participant's user channel
    queueMicrotask(() => {
      void (async () => {
        try {
          const wsBroadcastUrl = process.env.WS_BROADCAST_URL || 'http://localhost:3001/broadcast';
          const participants = await getConversationParticipants(id);
          
          for (const participant of participants) {
            fetch(wsBroadcastUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channel: `user:${participant.userId}`,
                message: {
                  type: 'read_receipt',
                  conversationId: id,
                  userId: user.id,
                  lastReadAt,
                },
              }),
            }).catch(() => {});
          }
        } catch {}
      })();
    });

    return response;
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      { error: 'Failed to mark as read', details },
      { status: 500 }
    );
  }
}
