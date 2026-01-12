/**
 * API: All Partner Funnels (Manager/Owner View)
 * GET /api/partner/consignment/funnels/all
 * 
 * Purpose: Get all funnels across the partner organization with staff attribution
 * Authentication: Required (partner manager or owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getAllPartnerFunnels, getPartnerFunnelCounts } from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const funnelLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

/**
 * GET /api/partner/consignment/funnels/all
 * List all funnels for the partner organization (manager/owner view)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await funnelLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Get partnerId from query or membership
    const requestedPartnerId = req.nextUrl.searchParams.get('partnerId');
    
    // Find a membership for the requested partner (must be manager/owner)
    const membership = (user as any).partnerMemberships?.find(
      (m: any) => {
        const isManagerOrOwner = m.staffRole === 'manager' || m.staffRole === 'owner';
        if (requestedPartnerId) {
          return m.partnerId === requestedPartnerId && isManagerOrOwner;
        }
        return isManagerOrOwner;
      }
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Manager or owner access required' },
        { status: 403 }
      );
    }

    const partnerId = membership.partnerId;

    // Get all funnels for the partner with staff info
    const funnels = await getAllPartnerFunnels(partnerId);

    return NextResponse.json(
      { funnels },
      {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, private', 'Pragma': 'no-cache' },
      }
    );
  } catch (error) {
    console.error('[API] Error fetching all partner funnels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
