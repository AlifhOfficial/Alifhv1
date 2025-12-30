import { NextRequest, NextResponse } from 'next/server';
import { autoMatchConsignment } from '@/lib/consignment/auto-match';
import { createRateLimiter, getIdentifier, rateLimitResponse, RATE_LIMITS_CONSIGNMENT } from '@/lib/rate-limit';

const consignmentMatchLimiter = createRateLimiter(RATE_LIMITS_CONSIGNMENT.MATCH);

/**
 * POST /api/consignment/match
 * 
 * Matches a listing against all partner consignment preferences
 * Creates consignment leads for matching partners
 * 
 * This is called when:
 * 1. Listing is published (automatic via webhook)
 * 2. Admin manually triggers re-matching
 * 3. User enables consignmentMode in settings
 * 
 * @body { listingId: string }
 */
export async function POST(req: NextRequest) {
  // Rate limiting: 10 AI match requests per hour (expensive operation)
  const identifier = getIdentifier(req);
  const rateLimitResult = await consignmentMatchLimiter.check(identifier);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }

    const result = await autoMatchConsignment(listingId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to match consignment', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matched: result.matched,
    });
  } catch (error) {
    console.error('Error matching consignment leads:', error);
    return NextResponse.json(
      { error: 'Failed to match consignment leads' },
      { status: 500 }
    );
  }
}
