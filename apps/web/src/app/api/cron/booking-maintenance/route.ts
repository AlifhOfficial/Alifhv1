/**
 * API: Cron Job - Booking Maintenance
 * GET /api/cron/booking-maintenance
 * 
 * Purpose: Expire pending bookings and auto-cancel missed bookings
 * Authentication: Cron secret token required
 * 
 * Tasks:
 * - Expire pending bookings past their expiry time
 * - Auto-cancel bookings where scheduled time passed without check-in
 * 
 * Schedule: Every 5-10 minutes
 * 
 * Example Vercel cron config:
 * {
 *   "crons": [{
 *     "path": "/api/cron/booking-maintenance",
 *     "schedule": "0/5 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { runBookingMaintenance } from '@alifh/database';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[Cron:BookingMaintenance] CRON_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const token = authHeader?.replace('Bearer ', '');
  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await runBookingMaintenance();

    const duration = Date.now() - start;
    console.log(`[Cron:BookingMaintenance] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron:BookingMaintenance] Error:', error);
    return NextResponse.json({ error: 'Maintenance failed' }, { status: 500 });
  }
}
