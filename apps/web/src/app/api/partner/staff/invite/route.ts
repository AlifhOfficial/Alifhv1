/**
 * Partner Staff Invite API
 * POST - Send staff invite by email
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendStaffInvite } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_PARTNER } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'admin', 'sales', 'viewer', 'staff']),
  title: z.string().optional(),
  department: z.string().optional(),
});

const staffInviteLimiter = createRateLimiter(RATE_LIMITS_PARTNER.STAFF_INVITE);

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 20 staff invites per hour
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await staffInviteLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Check if user is a partner
    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Only partners can invite staff' },
        { status: 403 }
      );
    }

    const partnerId = user.partnerMemberships[0].partnerId;

    const body = await req.json();
    const validated = inviteSchema.parse(body);

    // Map UI role to database role
    // 'staff' in UI -> 'sales' in database (for backward compatibility)
    const dbRole = validated.role === 'staff' ? 'sales' : validated.role;

    const invite = await sendStaffInvite({
      partnerId,
      email: validated.email,
      role: dbRole as 'owner' | 'admin' | 'sales' | 'viewer',
      title: validated.title,
      department: validated.department,
      invitedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      data: invite,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to send invite' },
      { status: 500 }
    );
  }
}
