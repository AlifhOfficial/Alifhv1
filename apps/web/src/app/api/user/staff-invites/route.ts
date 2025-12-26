/**
 * User Staff Invites API
 * GET - Get pending staff invites for current user
 * POST - Accept or reject invite
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getUserStaffInvites,
  acceptStaffInvite,
  rejectStaffInvite,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invites = await getUserStaffInvites(user.id);

    return NextResponse.json({
      success: true,
      data: invites,
    });
  } catch (error) {
    console.error('[User Staff Invites] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

const actionSchema = z.object({
  inviteId: z.string(),
  action: z.enum(['accept', 'reject']),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = actionSchema.parse(body);

    let result;

    if (validated.action === 'accept') {
      result = await acceptStaffInvite({
        inviteId: validated.inviteId,
        userId: user.id,
      });
    } else {
      result = await rejectStaffInvite({
        inviteId: validated.inviteId,
        userId: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[User Staff Invites Action] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Action failed' },
      { status: 500 }
    );
  }
}
