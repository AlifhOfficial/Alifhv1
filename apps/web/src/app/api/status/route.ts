/**
 * API: Status Page Data
 * GET /api/status
 */

import { NextResponse } from 'next/server';
import { getCachedStatusPageData } from '@/lib/status-page';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getCachedStatusPageData();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[api/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 },
    );
  }
}
