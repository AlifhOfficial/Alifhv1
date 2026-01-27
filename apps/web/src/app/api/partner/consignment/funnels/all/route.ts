/**
 * API: All Partner Funnels (Manager/Owner View)
 * GET /api/partner/consignment/funnels/all
 * 
 * Purpose: Get all funnels across the partner organization with staff attribution
 * Authentication: Required (partner manager or owner only)
 * 
 * Query Params:
 * - partnerId: Partner ID (optional, uses first manager/owner membership if not provided)
 * - staffId: Filter by staff member
 * - q: Search query (searches name and description)
 * - limit: Results per page (default: 12, max: 100)
 * - offset: Pagination offset (default: 0)
 * - includeStats: Include stats and staff list (default: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getAllPartnerFunnels, getPartnerFunnelStats, getPartnerFunnelStaff } from '@alifh/database';
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

    const { searchParams } = new URL(req.url);
    
    // Get partnerId from query or membership
    const requestedPartnerId = searchParams.get('partnerId');
    
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

    // Parse query params
    const staffId = searchParams.get('staffId') || undefined;
    const q = searchParams.get('q') || undefined;
    const includeStats = searchParams.get('includeStats') === '1' || searchParams.get('includeStats') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get funnels with filters
    const funnelsPromise = getAllPartnerFunnels(partnerId, {
      staffId,
      q,
      limit,
      offset,
    });

    // Optionally get stats and staff list in parallel
    let statsPromise: Promise<Awaited<ReturnType<typeof getPartnerFunnelStats>> | undefined> = Promise.resolve(undefined);
    let staffPromise: Promise<Awaited<ReturnType<typeof getPartnerFunnelStaff>> | undefined> = Promise.resolve(undefined);

    if (includeStats) {
      statsPromise = getPartnerFunnelStats(partnerId);
      staffPromise = getPartnerFunnelStaff(partnerId);
    }

    const [funnels, stats, staffList] = await Promise.all([funnelsPromise, statsPromise, staffPromise]);

    return NextResponse.json(
      { 
        funnels,
        stats,
        staffList,
        meta: {
          count: funnels.length,
          limit,
          offset,
        },
      },
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
