import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  updateListing,
  deleteListing,
  addPriceChange,
  getPartnerById,
  type ListingUpdate,
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
 * GET /api/listings/[id]
 * Get listing details (public for published, owner for drafts)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // If published, anyone can view
    if (listing.status === 'published') {
      return NextResponse.json({ data: listing });
    }
    
    // If not published, only owner can view
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { hasAccess } = await checkListingOwnership(id, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error('[listings/[id]] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/[id]
 * Update listing (owner only)
 */
export async function PATCH(
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
    if (!listing || !hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Track price changes
    if (body.price && body.price !== listing.price) {
      await addPriceChange(
        id,
        listing.price,
        body.price,
        body.priceChangeReason || 'Price updated',
        user.id
      );
    }
    
    const updates: ListingUpdate = body;
    const updatedListing = await updateListing(id, updates);
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing });
  } catch (error) {
    console.error('[listings/[id]] PATCH failed', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]
 * Delete listing (soft delete - archive) (owner only)
 */
export async function DELETE(
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
    
    const { hasAccess } = await checkListingOwnership(id, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const success = await deleteListing(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: { success: true, message: 'Listing archived successfully' } 
    });
  } catch (error) {
    console.error('[listings/[id]] DELETE failed', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
