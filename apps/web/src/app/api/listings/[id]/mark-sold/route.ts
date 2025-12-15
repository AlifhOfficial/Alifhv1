import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  markListingAsSold,
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
  
  // Check if user's partner owns this listing
  const partner = await getPartnerById(userId);
  const hasAccess = listing.partnerId === partner?.id;
  
  return { listing, hasAccess };
}

/**
 * POST /api/listings/[id]/mark-sold
 * Mark listing as sold (listing owner only)
 * 
 * Body:
 * - soldToUserId: string (required)
 * - soldPrice?: number (optional - actual sale price in AED cents)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
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
        { error: 'You do not have permission to modify this listing' },
        { status: 403 }
      );
    }

    if (listing.status === 'sold') {
      return NextResponse.json(
        { error: 'Listing is already marked as sold' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { soldToUserId, soldPrice } = body;

    if (!soldToUserId) {
      return NextResponse.json(
        { error: 'soldToUserId is required' },
        { status: 400 }
      );
    }

    // Mark as sold
    const updatedListing = await markListingAsSold(id, soldToUserId, soldPrice);
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to mark listing as sold' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedListing,
      message: 'Listing marked as sold successfully'
    });
  } catch (error) {
    console.error('[listings/[id]/mark-sold] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to mark listing as sold' },
      { status: 500 }
    );
  }
}