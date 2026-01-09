/**
 * API: Track Listing Impressions (Batch)
 * POST /api/listings/impressions
 * 
 * Purpose: Record when listings appear in search results
 * Authentication: None required (public endpoint)
 * 
 * Body: { listingIds: string[] }
 * 
 * Increments impressionCount for all provided listings in a single query.
 * Designed for batch updates - call once per search render with all visible IDs.
 * 
 * Rate Limited: 30 batch calls per minute per IP (covers heavy browsing)
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementImpressions } from '@alifh/database';
import { createRateLimiter, getIdentifier, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Rate limit: 30 batch calls per minute per IP
// This covers ~600 listings per minute (assuming 20 per page)
const impressionLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 30,
  keyPrefix: 'listing:impression',
  description: 'Listing impression tracking',
});

// Max listings per request (prevent abuse)
const MAX_LISTINGS_PER_REQUEST = 100;

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const identifier = getIdentifier(req);
    const rateLimitResult = await impressionLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Parse body
    const body = await req.json().catch(() => ({}));
    const { listingIds } = body as { listingIds?: string[] };

    // Validate
    if (!listingIds || !Array.isArray(listingIds)) {
      return NextResponse.json(
        { error: 'listingIds array is required' },
        { status: 400 }
      );
    }

    if (listingIds.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Filter to valid IDs only (strings, non-empty)
    const validIds = listingIds
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      .slice(0, MAX_LISTINGS_PER_REQUEST); // Limit to prevent abuse

    if (validIds.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Batch increment impressions
    const updatedCount = await incrementImpressions(validIds);

    return NextResponse.json({ 
      success: true, 
      updated: updatedCount,
    });
  } catch (error) {
    console.error('[API] Error recording impressions:', error);
    // Don't expose error - impressions are non-critical
    return NextResponse.json({ success: true, updated: 0 });
  }
}
