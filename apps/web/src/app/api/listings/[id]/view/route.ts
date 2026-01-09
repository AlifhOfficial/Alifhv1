/**
 * API: Track Listing View
 * POST /api/listings/[id]/view
 * 
 * Purpose: Record when a user views a listing detail page
 * Authentication: None required (public endpoint)
 * 
 * Records:
 * - Detailed view record in listing_view table
 * - Increments viewCount counter on listing
 * 
 * Rate Limited: 60 views per minute per IP (prevents abuse)
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordListingView } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { createRateLimiter, getIdentifier, rateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Rate limit: 60 views per minute per IP (generous for real users)
const viewLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 60,
  keyPrefix: 'listing:view',
  description: 'Listing view tracking',
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated (optional)
    const user = await getSessionUser().catch(() => null);

    // Rate limit by IP (not user - we want to count all views)
    const identifier = getIdentifier(req);
    const rateLimitResult = await viewLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Extract metadata from request
    const userAgent = req.headers.get('user-agent') ?? undefined;
    const referrer = req.headers.get('referer') ?? undefined;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      ?? req.headers.get('x-real-ip') 
      ?? req.headers.get('cf-connecting-ip')
      ?? undefined;

    // Detect device type from user agent
    let deviceType: 'desktop' | 'mobile' | 'tablet' | undefined;
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (/tablet|ipad/i.test(ua)) {
        deviceType = 'tablet';
      } else if (/mobile|android|iphone/i.test(ua)) {
        deviceType = 'mobile';
      } else {
        deviceType = 'desktop';
      }
    }

    // Get session ID from cookie or generate consistent one
    const sessionId = req.cookies.get('session_id')?.value 
      ?? req.cookies.get('__session')?.value
      ?? undefined;

    // Record the view (fire-and-forget style, but we await for error handling)
    const viewId = await recordListingView({
      listingId,
      userId: user?.id ?? null,
      sessionId,
      ipAddress: ip,
      userAgent,
      referrer,
      deviceType,
    });

    return NextResponse.json({ 
      success: true, 
      viewId,
    });
  } catch (error) {
    console.error('[API] Error recording view:', error);
    // Don't expose error details - just return success to not break client
    // The view tracking is non-critical
    return NextResponse.json({ success: true });
  }
}
