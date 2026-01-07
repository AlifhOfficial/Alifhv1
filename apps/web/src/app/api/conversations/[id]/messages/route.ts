/**
 * Messages API
 * GET: Get messages for a conversation
 * POST: Send a new message
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getMessages,
  sendMessage,
  getConversationParticipants,
} from '@alifh/database/server';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_MESSAGING } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const fetchMessagesLimiter = createRateLimiter(RATE_LIMITS_MESSAGING.FETCH_MESSAGES);
const sendMessageLimiter = createRateLimiter(RATE_LIMITS_MESSAGING.SEND_MESSAGE);

// ============================================================================
// GET /api/conversations/:id/messages
// Get message history with cursor pagination
// ============================================================================

export async function GET(
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

    // Rate limiting: 60 fetch requests per minute
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await fetchMessagesLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || undefined;

    const messages = await getMessages(conversationId, {
      limit,
      cursor,
      userId: user.id, // Verify user is participant
    });

    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
      nextCursor: messages.length === limit ? messages[messages.length - 1].createdAt.toISOString() : null,
    });
  } catch (error) {
    // Handle unauthorized access
    if (error instanceof Error && error.message.includes('not a participant')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/conversations/:id/messages
// Send a new message
// ============================================================================

export async function POST(
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

    // Rate limiting: 20 messages per minute
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await sendMessageLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { id: conversationId } = await params;
    const body = await req.json();
    const { text, mediaUrl, mediaType, mediaThumbnail, mediaMetadata } = body;

    // Validate message content
    if (!text && !mediaUrl) {
      return NextResponse.json(
        { error: 'Message must contain text or media' },
        { status: 400 }
      );
    }

    // Verify participant via database constraint (sendMessage will fail if not participant)
    // This relies on the conversation_participant table having the user
    try {
      // Send message (database will enforce participant constraint)
      const message = await sendMessage({
        conversationId,
        senderId: user.id,
        text,
        mediaUrl,
        mediaType,
        mediaThumbnail,
        mediaMetadata,
      });

      // Broadcast to each participant's user channel
      const wsBroadcastUrl = process.env.WS_BROADCAST_URL || 'http://localhost:3001/broadcast';
      
      // Get participants to broadcast to their user channels
      const participants = await getConversationParticipants(conversationId);
      
      // Broadcast to ALL participants in PARALLEL (non-blocking)
      Promise.all(
        participants.map((participant) =>
          fetch(wsBroadcastUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `user:${participant.userId}`,
              message: {
                type: 'new_message',
                conversationId,
                userId: user.id, // Sender's user ID
                message,
              },
            }),
          }).catch(() => {})
        )
      ).catch(() => {}); // Fire and forget, don't block response

      return NextResponse.json({ message });
    } catch (error) {
      // If message send fails, user is likely not a participant
      if (error instanceof Error && error.message.includes('participant')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    // Return detailed error in development
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
