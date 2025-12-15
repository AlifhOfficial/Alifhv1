import { NextRequest, NextResponse } from "next/server";
import {
  getPriceHistory,
  getLatestPriceChange,
} from "@alifh/database";

export const runtime = "nodejs";

/**
 * GET /api/listings/[id]/price-history
 * Get price change history for a listing (public)
 * 
 * Query params:
 * - latest: boolean - if true, return only latest price change
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const latest = searchParams.get('latest') === 'true';
    
    if (latest) {
      const latestChange = await getLatestPriceChange(id);
      
      if (!latestChange) {
        return NextResponse.json(
          { error: 'No price history found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ data: latestChange });
    }
    
    const history = await getPriceHistory(id);
    
    return NextResponse.json({ 
      data: history,
      meta: { count: history.length }
    });
  } catch (error) {
    console.error('[listings/[id]/price-history] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}
