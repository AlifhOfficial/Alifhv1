/**
 * API: Cron Job - Expire Listings
 * GET /api/cron/expire-listings
 * 
 * Purpose: Global maintenance job to mark expired listings as expired
 * Authentication: Cron secret token required (prevents public access)
 * 
 * This solves the "opportunistic expiry" problem where listings only get
 * marked as expired when users visit their dashboard. Now expired listings
 * are marked consistently every few minutes via cron.
 * 
 * Schedule: Every 5-15 minutes (configurable in Vercel/hosting provider)
 * 
 * Security:
 * - Requires CRON_SECRET env var to match Authorization header
 * - Returns 401 if token is missing/invalid
 * 
 * Response:
 * - 200: { expiredCount, hasMore, duration }
 * - 401: Unauthorized
 * - 500: Server error
 * 
 * Example Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/expire-listings",
 *     "schedule": "0/10 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { expireAllExpiredListings } from '@alifh/database';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for large batches

export async function GET(req: NextRequest) {
  const startTime = performance.now();

  try {
    // Verify cron secret token
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In development, allow without token for testing
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        console.error('[cron/expire-listings] CRON_SECRET env var not configured');
        return NextResponse.json(
          { error: 'Cron not configured' },
          { status: 500 }
        );
      }

      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Run expiry maintenance
    let totalExpired = 0;
    let iterations = 0;
    const maxIterations = 10; // Safety limit to prevent infinite loops

    // Process in batches until no more expired listings
    let result = await expireAllExpiredListings(500);
    totalExpired += result.expiredCount;
    iterations++;

    // Continue if there are more and we haven't hit the safety limit
    while (result.hasMore && iterations < maxIterations) {
      result = await expireAllExpiredListings(500);
      totalExpired += result.expiredCount;
      iterations++;
    }

    const duration = Math.round(performance.now() - startTime);

    console.warn(`[cron/expire-listings] Completed: ${totalExpired} listings expired in ${iterations} batches (${duration}ms)`);

    return NextResponse.json({
      success: true,
      expiredCount: totalExpired,
      iterations,
      hasMore: result.hasMore,
      duration,
    });
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error('[cron/expire-listings] Failed:', error);

    return NextResponse.json(
      {
        error: 'Expiry maintenance failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    );
  }
}
