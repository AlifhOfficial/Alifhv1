/**
 * POST /api/cron/sync-google-reviews
 * 
 * Cron job to sync Google Reviews for all partners
 * Runs on 1st and 16th of each month
 * 
 * Vercel Cron: "0 0 1,16 * *"
 */

import { NextRequest, NextResponse } from 'next/server';
import { googleReviews } from '@alifh/database';

export const maxDuration = 300; // 5 minutes max execution
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this automatically)
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[Cron] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[Cron] Starting Google Reviews sync');
    
    const startTime = Date.now();
    
    // Sync all partners that haven't been synced in 15 days
    const result = await googleReviews.syncStalePartnerReviews(15);
    
    const duration = Date.now() - startTime;
    
    console.log('[Cron] Google Reviews sync complete:', {
      ...result,
      durationMs: duration,
      durationSec: Math.round(duration / 1000),
    });
    
    return NextResponse.json({
      success: true,
      ...result,
      durationMs: duration,
    });
  } catch (error) {
    console.error('[Cron] Google Reviews sync failed:', error);
    return NextResponse.json({ 
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Allow manual trigger in development
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  return POST(req);
}
