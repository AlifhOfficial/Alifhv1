/**
 * Messages API
 * GET: Get messages for a conversation
 * POST: Send a new message
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getMessages,
  sendMessage,
  getConversationParticipants,
  getConversationParticipantsWithProfiles,
  sendNewMessageNotification,
} from '@alifh/database';

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
    const requestedLimit = parseInt(searchParams.get('limit') || '30');
    const limit = Math.max(1, Math.min(30, Number.isNaN(requestedLimit) ? 30 : requestedLimit));
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

      const wsBroadcastUrl = resolveWsBroadcastUrl();

      // Return to sender immediately; run fanout + push in post-response phase.
      after(async () => {
        // Get participants with profiles to get avatar URLs
        const participants = await getConversationParticipantsWithProfiles(conversationId);
        const recipients = participants.filter((participant) => participant.userId !== user.id);

        const broadcastToUser = async (targetUserId: string) => {
          const maxAttempts = 2;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const res = await fetch(wsBroadcastUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              cache: 'no-store',
              signal: AbortSignal.timeout(700),
              body: JSON.stringify({
                channel: `user:${targetUserId}`,
                message: {
                  type: 'new_message',
                  conversationId,
                  userId: user.id, // Sender's user ID
                  message,
                },
              }),
            });

            if (!res.ok) continue;

            const result = (await res.json().catch(() => null)) as { delivered?: boolean } | null;
            if (result?.delivered === true) return;

            // delivered:false can mean either offline or different WS machine.
            // Retry quickly to increase chance of hitting the machine holding the socket.
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 70 * attempt));
            }
          } catch {
            if (attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 70 * attempt));
            }
          }
        }
        };

        await Promise.allSettled(
          recipients.map((participant) => broadcastToUser(participant.userId))
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
      });

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
