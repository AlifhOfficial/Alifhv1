/**
 * API: Seller Stats Endpoint
 * GET /api/sellers/stats?type=partner|user&id=xxx
 * 
 * Purpose: Fetch seller statistics separately from listing data
 * This allows listing details to load fast while stats load lazily
 * 
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Partner stats: inventoryCount, totalSales, responseTime, responseRate
 * - User stats: listingsCount, soldCount, responseTime, responseRate
 * - Memory cached with 5min TTL
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  calculateUserStats,
  calculatePartnerStats,
  hasPublishedShowroom,
} from "@alifh/database";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  const startTime = performance.now();

  try {

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'partner' or 'user'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing type or id parameter' },
        { status: 400 }
      );
    }

    if (type !== 'partner' && type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "partner" or "user"' },
        { status: 400 }
      );
    }

    // Fetch stats based on type
    let stats;
    if (type === 'partner') {
      // Fetch partner stats and showroom status in parallel
      const [partnerStats, hasShowroom] = await Promise.all([
        calculatePartnerStats(id),
        hasPublishedShowroom(id),
      ]);
      stats = { ...partnerStats, hasShowroom };
    } else {
      stats = await calculateUserStats(id);
    }

    console.log(`[seller-stats] ${type}:${id} - ${(performance.now() - startTime).toFixed(0)}ms`);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Error fetching seller stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
