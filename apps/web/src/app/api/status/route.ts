/**
 * API: Status Page Data
 * GET /api/status
 */

import { NextResponse } from 'next/server';
import { getCachedStatusPageData } from '@/lib/status-page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCachedStatusPageData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 },
    );
  }
}
