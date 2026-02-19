/**
 * Staff Resign API
 * POST - Staff member resigns from partner organization
 * 
 * This allows staff to leave an organization on their own
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { removeStaffMember, getActivePartnerStaffMembershipByUserId } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

// 3 resign attempts per day - prevent abuse

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resignSchema = z.object({
  reason: z.string().optional(),
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


    // Get user's active staff membership
    const membership = await getActivePartnerStaffMembershipByUserId(user.id);
    
    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a staff member of any organization' },
        { status: 400 }
      );
    }

    // Owners cannot resign - they must transfer ownership or close the partner account
    if (membership.isOwner) {
      return NextResponse.json(
        { error: 'Owners cannot resign. Please transfer ownership first or contact support.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validated = resignSchema.safeParse(body);
    
    const reason = validated.success ? validated.data.reason : undefined;

    // Remove staff membership
    const result = await removeStaffMember({
      staffId: membership.staffId,
      partnerId: membership.partnerId,
      reason: reason || 'Staff resigned',
    });

    return NextResponse.json({
      success: true,
      message: 'You have successfully resigned from the organization',
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to resign' },
      { status: 500 }
    );
  }
}
