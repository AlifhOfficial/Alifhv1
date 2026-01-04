/**
 * API: Funnel Matching Listings
 * GET /api/partner/consignment/funnels/[id]/matches
 * 
 * Purpose: Get listings that match funnel criteria
 * Authentication: Required (partner staff only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getFunnelById,
  getFunnelMatchingListings,
} from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_GENERAL } from '@/lib/rate-limit';
import { API_CACHE_HEADERS } from '@/lib/cache-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const matchesLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

/**
 * GET /api/partner/consignment/funnels/[id]/matches
 * Get listings matching funnel filters
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await matchesLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const membership = (user as any).partnerMemberships?.find(
      (m: any) => m.staffRole !== 'viewer'
    );
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a partner staff member' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const funnel = await getFunnelById(id);
    
    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }
    
    // Check ownership
    if (funnel.partnerId !== membership.partnerId) {
      return NextResponse.json({ error: 'Not your funnel' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { listings, total } = await getFunnelMatchingListings(id, membership.partnerId, {
      limit,
      offset,
    });

    return NextResponse.json(
      {
        funnel: {
          id: funnel.id,
          name: funnel.name,
        },
        listings,
        total,
        limit,
        offset,
        hasMore: offset + listings.length < total,
      },
      {
        headers: API_CACHE_HEADERS.NO_STORE, // No cache - data changes frequently
      }
    );
  } catch (error) {
    console.error('[API] Error fetching funnel matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
