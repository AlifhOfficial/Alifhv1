/**
 * User Stats API
 * GET - Calculate dynamic user statistics
 * 
 * Calculates:
 * - listingsCount: Total listings
 * - soldCount: Completed sales
 * - responseRate: % of inquiries answered
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getCachedUserStats } from '@/lib/listing-detail-cache';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }


    const stats = await getCachedUserStats(user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[User Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
