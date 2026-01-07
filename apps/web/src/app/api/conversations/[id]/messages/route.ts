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
  const startTime = Date.now();
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

    console.log(`🔍 [API] GET /api/conversations/${conversationId}/messages - userId: ${user.id}, cursor: ${cursor || 'none'}, limit: ${limit}`);

    const messages = await getMessages(conversationId, {
      limit,
      cursor,
      userId: user.id, // Verify user is participant
    });

    const duration = Date.now() - startTime;
    console.log(`✅ [API] GET /api/conversations/${conversationId}/messages - ${messages.length} messages, ${duration}ms`);

    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
      nextCursor: messages.length === limit ? messages[messages.length - 1].createdAt.toISOString() : null,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    // Handle unauthorized access
    if (error instanceof Error && error.message.includes('not a participant')) {
      console.error(`❌ [API] GET /api/conversations/*/messages - Unauthorized after ${duration}ms`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.error(`❌ [API] GET /api/conversations/*/messages - Failed after ${duration}ms:`, error);
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
  const startTime = Date.now();
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

    console.log(`📤 [API] POST /api/conversations/${conversationId}/messages - userId: ${user.id}, hasText: ${!!text}, hasMedia: ${!!mediaUrl}`);

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
      console.log(`📡 [API] Broadcasting new_message to ${participants.length} participants`);
      
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
          }).catch((err) => {
            console.error(`❌ [API] WebSocket broadcast failed for user ${participant.userId}:`, err);
          })
        )
      ).catch(() => {}); // Fire and forget, don't block response

      const duration = Date.now() - startTime;
      console.log(`✅ [API] POST /api/conversations/${conversationId}/messages - Message sent, ${duration}ms`);

      return NextResponse.json({ message });
    } catch (error) {
      // If message send fails, user is likely not a participant
      if (error instanceof Error && error.message.includes('participant')) {
        const duration = Date.now() - startTime;
        console.error(`❌ [API] POST /api/conversations/*/messages - Unauthorized after ${duration}ms`);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [API] POST /api/conversations/*/messages - Failed after ${duration}ms:`, error);
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
