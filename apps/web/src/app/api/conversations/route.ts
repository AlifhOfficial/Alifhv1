/**
 * Conversations API
 * GET: List all conversations for authenticated user
 * POST: Create or get existing conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createOrGetConversation,
  getUserConversations,
  getTotalUnreadCount,
} from '@alifh/database';

export const runtime = 'nodejs';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const CONVERSATIONS_CACHE_REVALIDATE_SECONDS = 10;

const getCachedConversationsPayload = unstable_cache(
  async (
    userId: string,
    partnerIds: string[],
    partnerScope: 'only' | 'exclude' | undefined,
    limit: number,
    offset: number,
    includeArchived: boolean,
    scope: 'staff' | 'personal' | null
  ) => {
    dbg(`MISS conversations userId=${userId} scope=${scope} offset=${offset}`);
    const conversations = await getUserConversations(userId, {
      limit,
      offset,
      includeArchived,
      partnerIds,
      partnerScope,
    });

    const totalUnread =
      scope === 'staff' || scope === 'personal'
        ? conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
        : await getTotalUnreadCount(userId);

    return {
      conversations,
      totalUnread,
      hasMore: conversations.length === limit,
    };
  },
  ['api-conversations-payload'],
  { revalidate: CONVERSATIONS_CACHE_REVALIDATE_SECONDS }
);


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

    if (scope === 'staff' && partnerIds.length === 0) {
      return NextResponse.json({
        conversations: [],
        totalUnread: 0,
        hasMore: false,
      });
    }

    const partnerScope =
      partnerIds.length > 0
        ? scope === 'staff'
          ? 'only'
          : scope === 'personal'
            ? 'exclude'
            : undefined
        : undefined;

    dbg(`REQUEST conversations userId=${user.id} scope=${scope} offset=${offset}`);
    const payload = await getCachedConversationsPayload(
      user.id,
      partnerIds,
      partnerScope,
      limit,
      offset,
      includeArchived,
      scope === 'staff' || scope === 'personal' ? scope : null
    );

    return NextResponse.json(payload);
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

    // Prevent messaging yourself
    if (otherUserId === user.id) {
      return NextResponse.json(
        { error: 'You cannot message yourself' },
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
