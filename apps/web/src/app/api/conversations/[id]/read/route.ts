/**
 * Mark Conversation as Read API
 * PATCH: Mark all messages in conversation as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { markConversationAsRead, getConversationParticipants } from '@alifh/database';


export const runtime = 'nodejs';

function resolveWsBroadcastUrl() {
  const raw =
    process.env.WS_BROADCAST_URL ||
    process.env.NEXT_PUBLIC_WS_URL ||
    'https://ws.revvup.ae';

  const httpBase = raw
    .replace(/^wss:\/\//, 'https://')
    .replace(/^ws:\/\//, 'http://')
    .replace(/\/$/, '');

  return httpBase.endsWith('/broadcast') ? httpBase : `${httpBase}/broadcast`;
}

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
    const body = await req.json().catch(() => ({}));
    const messageId =
      body && typeof body === 'object' && typeof (body as { messageId?: unknown }).messageId === 'string'
        ? (body as { messageId: string }).messageId
        : undefined;

    const lastReadAt = new Date().toISOString();
    await markConversationAsRead(id, user.id);

    const response = NextResponse.json({ success: true, lastReadAt });

    // Broadcast read receipt to each participant's user channel
    queueMicrotask(() => {
      void (async () => {
        try {
          const wsBroadcastUrl = resolveWsBroadcastUrl();
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
                  messageId,
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
