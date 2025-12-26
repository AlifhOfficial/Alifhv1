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

export const runtime = 'nodejs';

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
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
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

    // Verify user is participant
    const participants = await getConversationParticipants(conversationId);
    const isParticipant = participants.some((p) => p.userId === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Send message
    const message = await sendMessage({
      conversationId,
      senderId: user.id,
      text,
      mediaUrl,
      mediaType,
      mediaThumbnail,
      mediaMetadata,
    });

    // Broadcast to WebSocket (notify other participants)
    // Uses parallel requests for performance
    const wsBroadcastUrl = process.env.WS_BROADCAST_URL || 'http://localhost:3001/broadcast';
    const otherParticipants = participants.filter((p) => p.userId !== user.id);
    
    // Fire all broadcasts in parallel - don't await sequentially
    const broadcasts = otherParticipants.map((participant) =>
      fetch(wsBroadcastUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `user:${participant.userId}`,
          message: {
            type: 'new_message',
            conversationId,
            message,
          },
        }),
      }).catch(() => {
        // Silently fail - WebSocket is optional
      })
    );
    
    // Wait for all broadcasts (non-blocking for response)
    Promise.allSettled(broadcasts).catch(() => {});

    return NextResponse.json({ message });
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
