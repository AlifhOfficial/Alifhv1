/**
 * Single Conversation API
 * GET: Get conversation details
 * PATCH: Update conversation settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getConversation,
  updateConversationSettings,
} from '@alifh/database/server';

export const runtime = 'nodejs';

// ============================================================================
// GET /api/conversations/:id
// Get single conversation with verification
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

    const { id } = await params;
    const conversation = await getConversation(id, user.id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      { error: 'Failed to fetch conversation', details },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/conversations/:id
// Update conversation settings (mute, archive, pin)
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
    const body = await req.json();
    const { isMuted, isArchived, isPinned, notificationsEnabled } = body;

    await updateConversationSettings(id, user.id, {
      isMuted,
      isArchived,
      isPinned,
      notificationsEnabled,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      { error: 'Failed to update conversation', details },
      { status: 500 }
    );
  }
}
