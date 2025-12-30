/**
 * Partner Staff Management API
 * GET - Get all staff for a partner with computed stats
 * V1: Single endpoint replaces /stats and /invites endpoints (3 calls → 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPartnerStaff } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const staffListLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// V1: Invite expiry is 7 days from invite date
const INVITE_EXPIRY_DAYS = 7;

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await staffListLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    if (!user.hasPartnerAccess || !user.partnerMemberships?.[0]) {
      return NextResponse.json(
        { error: 'Only partners can view staff' },
        { status: 403 }
      );
    }

    const partnerId = user.partnerMemberships[0].partnerId;
    const staff = await getPartnerStaff(partnerId);

    // Compute stats in single pass (no extra DB calls)
    let totalStaff = 0;
    let activeStaff = 0;
    let pendingInvites = 0;
    let managers = 0;
    const invites: Array<{
      id: string;
      email: string;
      role: string;
      invitedAt: Date | null;
      expiresAt: string;
    }> = [];

    for (const s of staff) {
      if (s.status === 'invited') {
        pendingInvites++;
        // Calculate expiry date (7 days from invite)
        const expiresAt = s.invitedAt 
          ? new Date(new Date(s.invitedAt).getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
        
        invites.push({
          id: s.id,
          email: s.userEmail || '',
          role: s.role,
          invitedAt: s.invitedAt,
          expiresAt,
        });
      } else {
        totalStaff++;
        if (s.status === 'active') {
          activeStaff++;
          if (['owner', 'admin', 'manager'].includes(s.role)) {
            managers++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: staff,
      stats: {
        totalStaff,
        activeStaff,
        pendingInvites,
        managers,
      },
      invites,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
