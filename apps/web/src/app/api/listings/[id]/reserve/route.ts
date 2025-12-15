import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  reserveListing,
  unreserveListing,
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
 * POST /api/listings/[id]/reserve
 * Reserve a listing (authenticated users only)
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

    // Check if listing exists and is published
    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'published') {
      return NextResponse.json(
        { error: 'Listing is not available for reservation' },
        { status: 400 }
      );
    }

    if (listing.reservedBy) {
      return NextResponse.json(
        { error: 'Listing is already reserved' },
        { status: 409 }
      );
    }

    // Reserve the listing
    const updatedListing = await reserveListing(id, user.id);
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to reserve listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedListing,
      message: 'Listing reserved successfully'
    });
  } catch (error) {
    console.error('[listings/[id]/reserve] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to reserve listing' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]/reserve
 * Cancel reservation (unreserve listing)
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if listing exists and is reserved
    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'reserved') {
      return NextResponse.json(
        { error: 'Listing is not reserved' },
        { status: 400 }
      );
    }

    if (listing.reservedBy !== user.id) {
      return NextResponse.json(
        { error: 'You did not reserve this listing' },
        { status: 403 }
      );
    }

    // Unreserve the listing
    const updatedListing = await unreserveListing(id, user.id);
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to cancel reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedListing,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('[listings/[id]/reserve] DELETE failed', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}