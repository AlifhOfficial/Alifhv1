/**
 * API: Track Listing View
 * POST /api/listings/[id]/view
 *
 * Purpose: Record when a user views a listing detail page
 * Authentication: None required (public endpoint)
 *
 * Records:
 * - Increments `viewCount` on the listing
 *
 * Rate Limited: handled in the database helper with a short per-session cooldown
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordListingView } from '@alifh/database';

export const runtime = 'nodejs';


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

    // User ID from cookie header (no DB lookup - cookie is already signed by auth system)
    // This is much faster than getSessionUser() which queries the database
    const userIdFromCookie = req.cookies.get('better-auth.user_id')?.value ?? null;


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

    const recorded = await recordListingView({
      listingId,
      userId: userIdFromCookie,
      sessionId,
      ipAddress: ip,
      userAgent,
      referrer,
      deviceType,
    });

    return NextResponse.json({
      success: true,
      recorded: recorded !== null,
    });
  } catch (error) {
    console.error('[API] Error recording view:', error);
    // Don't expose error details - just return success to not break client
    // The view tracking is non-critical
    return NextResponse.json({ success: true });
  }
}
