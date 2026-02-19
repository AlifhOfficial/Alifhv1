/**
 * Partner Stats API
 * GET - Calculate dynamic partner statistics
 * 
 * Expensive queries - results cached for 5min via React Query
 * 
 * Calculates:
 * - inventoryCount: Active listings
 * - totalSales: Completed sales
 * - responseTime: Avg minutes to first response
 * - responseRate: % of inquiries answered
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { calculatePartnerStats } from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';
import { NO_CACHE_HEADERS } from '@/lib/cdn-cache';

const statsLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
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
    const rateLimitResult = await statsLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { partnerId } = await params;

    // Authorization: partner staff only
    const hasAccess = user.partnerMemberships?.some(m => m.partnerId === partnerId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const stats = await calculatePartnerStats(partnerId);

    const response = NextResponse.json(stats);
    Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (error) {
    console.error('[Partner Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
