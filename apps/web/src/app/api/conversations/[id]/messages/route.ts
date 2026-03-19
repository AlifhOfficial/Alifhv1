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
  getConversationParticipantsWithProfiles,
  sendNewMessageNotification,
} from '@alifh/database';

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

    // On first page (no cursor), also fetch other participant's lastReadAt for "Seen" bubble
    const isFirstPage = !cursor;
    
    const [messages, participants] = await Promise.all([
      getMessages(conversationId, {
        limit,
        cursor,
        userId: user.id, // Verify user is participant
      }),
      // Only fetch participants on first page load
      isFirstPage ? getConversationParticipants(conversationId) : Promise.resolve([]),
    ]);

    // Find other participant's lastReadAt for "Seen" bubble positioning
    const otherParticipant = isFirstPage 
      ? participants.find(p => p.userId !== user.id) 
      : null;

    return NextResponse.json({
      messages,
      hasMore: messages.length === limit,
      nextCursor: messages.length === limit ? messages[messages.length - 1].createdAt.toISOString() : null,
      // Include on first page for persistent "Seen" bubble
      ...(isFirstPage && { otherParticipantLastReadAt: otherParticipant?.lastReadAt?.toISOString() ?? null }),
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
      
      // Get participants with profiles to get avatar URLs
      const participants = await getConversationParticipantsWithProfiles(conversationId);
      
      // Wait briefly for WS fanout so the DB write does not outrun delivery.
      // Without awaiting this, the route can return before broadcasts flush.
      await Promise.allSettled(
        participants.map((participant) =>
          fetch(wsBroadcastUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            signal: AbortSignal.timeout(2000),
            body: JSON.stringify({
              channel: `user:${participant.userId}`,
              message: {
                type: 'new_message',
                conversationId,
                userId: user.id, // Sender's user ID
                message,
              },
            }),
          })
        )
      );

      // Send push notifications to other participants (fire and forget)
      const otherParticipants = participants.filter(p => p.userId !== user.id);
      // Get sender's profile from participants list
      const senderProfile = participants.find(p => p.userId === user.id);
      const senderName = senderProfile?.name || user.name || user.firstName || 'Someone';
      // Resolve avatar storage key to full public URL
      const rawAvatar = senderProfile?.avatarUrl;
      const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      const senderAvatarUrl = rawAvatar
        ? rawAvatar.startsWith('http')
          ? rawAvatar
          : r2PublicUrl
            ? `${r2PublicUrl.replace(/\/$/, '')}/${rawAvatar}`
            : undefined
        : undefined;
      const messagePreview = text || (mediaType ? `Sent a ${mediaType}` : 'Sent a message');

      for (const recipient of otherParticipants) {
        sendNewMessageNotification(
          recipient.userId,
          senderName,
          messagePreview,
          conversationId,
          undefined, // listingTitle
          senderAvatarUrl
        ).catch((err) => {
          console.error(`[Push] Failed to send notification to ${recipient.userId}:`, err);
        });
      }

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
