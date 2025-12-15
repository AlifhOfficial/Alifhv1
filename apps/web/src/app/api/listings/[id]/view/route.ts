import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  recordListingView,
  incrementViewCount,
  getListingById,
} from "@alifh/database";

export const runtime = "nodejs";

/**
 * Helper to get authenticated user from session
 */
async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

/**
 * POST /api/listings/[id]/view
 * Track a listing view (public)
 * 
 * Body:
 * - viewerIpAddress?: string (optional, for anonymous tracking)
 * 
 * Records view in listingView table and increments viewCount
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if listing exists
    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Only track views for published listings
    if (listing.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot track views for unpublished listing' },
        { status: 400 }
      );
    }
    
    const user = await getSessionUser(req);
    const body = await req.json();
    
    // Determine viewer identity
    const userId = user?.id || null;
    const ipAddress = body.ipAddress || 
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      null;
    
    // Record detailed view
    await recordListingView({
      listingId: id,
      userId,
      ipAddress,
      userAgent: req.headers.get('user-agent') || undefined,
      referrer: req.headers.get('referer') || undefined,
    });
    
    // Note: incrementViewCount is already called inside recordListingView
    // So we don't need to call it again here
    
    return NextResponse.json({ 
      data: { 
        success: true,
        message: 'View tracked successfully',
        listingId: id,
      }
    });
  } catch (error) {
    console.error('[listings/[id]/view] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
