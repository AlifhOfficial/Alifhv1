import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingStats,
  getListingById,
  getPartnerById,
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
 * Helper to check if user owns the listing
 */
async function checkListingOwnership(listingId: string, userId: string) {
  const listing = await getListingById(listingId);
  if (!listing) {
    return { listing: null, hasAccess: false };
  }
  
  const partner = await getPartnerById(userId);
  const hasAccess = listing.partnerId === partner?.id;
  
  return { listing, hasAccess };
}

/**
 * GET /api/listings/[id]/stats
 * Get listing analytics/stats (owner only)
 * 
 * Returns comprehensive stats:
 * - Total views
 * - Unique views
 * - Recent views (last 24h, 7d, 30d)
 * - Engagement metrics (favourites, shares, inquiries, calls, whatsapp)
 * - Performance score
 * - Days on market
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { listing, hasAccess } = await checkListingOwnership(id, user.id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const stats = await getListingStats(id);
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('[listings/[id]/stats] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
