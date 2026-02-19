/**
 * User Dashboard Stats API
 * 
 * GET - Returns all dashboard metrics in a single call
 * 
 * Efficient aggregation:
 * - Listing stats (active, total, views, saves)
 * - Sales metrics
 * - User activity (saves, superlikes)
 * - 7-day view trend for sparkline
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getUserDashboardStats } from '@alifh/database';


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


    const stats = await getUserDashboardStats(user.id);
    
    // Add member since from user record
    const memberSince = user.createdAt 
      ? new Date(user.createdAt).toISOString() 
      : null;

    return NextResponse.json({
      ...stats,
      memberSince,
    });
  } catch (error) {
    console.error('[User Dashboard Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
