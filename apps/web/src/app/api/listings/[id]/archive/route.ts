import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  archiveListing,
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
  
  // Check if user's partner owns this listing
  const partner = await getPartnerById(userId);
  const hasAccess = listing.partnerId === partner?.id;
  
  return { listing, hasAccess };
}

/**
 * POST /api/listings/[id]/archive
 * Archive a listing (owner only)
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

    if (listing.status === 'archived') {
      return NextResponse.json(
        { error: 'Listing is already archived' },
        { status: 400 }
      );
    }

    const updatedListing = await archiveListing(id);
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to archive listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedListing,
      message: 'Listing archived successfully'
    });
  } catch (error) {
    console.error('[listings/[id]/archive] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to archive listing' },
      { status: 500 }
    );
  }
}