/**
 * Conversation Participants API
 * GET: Get all participants with their profile info (for group chat seen status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getConversationParticipantsWithProfiles } from '@alifh/database/server';

export const runtime = 'nodejs';

// ============================================================================
// GET /api/conversations/:id/participants
// Get participants with profiles for seen status in group chats
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
    const participants = await getConversationParticipantsWithProfiles(id);

    // Filter out the current user from the list
    const otherParticipants = participants.filter(p => p.userId !== user.id);

    return NextResponse.json({ participants: otherParticipants });
  } catch (error) {
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;
    return NextResponse.json(
      { error: 'Failed to get participants', details },
      { status: 500 }
    );
  }
}
