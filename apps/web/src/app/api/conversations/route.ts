/**
 * Conversations API
 * GET: List all conversations for authenticated user
 * POST: Create or get existing conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createOrGetConversation,
  getUserConversations,
  getTotalUnreadCount,
} from '@alifh/database/server';

export const runtime = 'nodejs';

// ============================================================================
// GET /api/conversations
// List all conversations for the user
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const scope = searchParams.get('scope'); // 'staff' | 'personal' | null

    const partnerIds = (user.partnerMemberships ?? []).map((m) => m.partnerId).filter(Boolean);
    const partnerScope =
      partnerIds.length > 0
        ? scope === 'staff'
          ? 'only'
          : scope === 'personal'
            ? 'exclude'
            : undefined
        : undefined;

    const conversations = await getUserConversations(user.id, {
      limit,
      offset,
      includeArchived,
      partnerIds,
      partnerScope,
    });

    const totalUnread =
      scope === 'staff' || scope === 'personal'
        ? conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
        : await getTotalUnreadCount(user.id);

    return NextResponse.json({
      conversations,
      totalUnread,
      hasMore: conversations.length === limit,
    });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;

    return NextResponse.json(
      { error: 'Failed to fetch conversations', details },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/conversations
// Create or get existing conversation
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { otherUserId, listingId, partnerId, type, subject } = body;

    // Validate required fields
    if (!otherUserId) {
      return NextResponse.json(
        { error: 'otherUserId is required' },
        { status: 400 }
      );
    }

    // Create or get existing conversation
    const conversationId = await createOrGetConversation({
      initiatedBy: user.id,
      otherUserId,
      listingId,
      partnerId,
      type: type || 'inquiry',
      subject,
    });

    return NextResponse.json({
      conversationId,
      created: true, // Could check if it was newly created vs existing
    });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;

    return NextResponse.json(
      { error: 'Failed to create conversation', details },
      { status: 500 }
    );
  }
}
