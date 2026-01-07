/**
 * Mark Conversation as Read API
 * PATCH: Mark all messages in conversation as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { markConversationAsRead, getConversationParticipants } from '@alifh/database/server';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_MESSAGING,
} from '@/lib/rate-limit';

const readReceiptLimiter = createRateLimiter(RATE_LIMITS_MESSAGING.READ_RECEIPT);

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

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await readReceiptLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { id } = await params;
    const lastReadAt = new Date().toISOString();
    await markConversationAsRead(id, user.id);

    // Broadcast read receipt to each participant's user channel
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

    return NextResponse.json({ success: true, lastReadAt });
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
