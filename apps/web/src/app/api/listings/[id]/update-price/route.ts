import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  updateListingPrice,
  validateListingForPublishing,
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
 * POST /api/listings/[id]/update-price
 * Update listing price with history tracking (uses service layer)
 * 
 * Body:
 * - price: number (required - new price in AED cents)
 * - reason?: string (optional - reason for price change)
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

    const body = await req.json();
    const { price, reason = 'price_adjustment' } = body;

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required (must be positive number in AED cents)' },
        { status: 400 }
      );
    }

    // Use service layer for price update with history tracking
    const result = await updateListingPrice(id, price, reason, user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update price' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: result.listing.id,
        oldPrice: listing.price,
        newPrice: result.listing.price,
        priceChanges: result.listing.priceChanges,
        lastPriceChange: result.listing.lastPriceChange,
      },
      message: 'Price updated successfully with history tracking'
    });
  } catch (error) {
    console.error('[listings/[id]/update-price] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings/[id]/validate
 * Validate listing completeness for publishing (uses service layer)
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
        { error: 'You do not have permission to access this listing' },
        { status: 403 }
      );
    }

    // Use service layer for validation
    const validation = validateListingForPublishing(listing);

    return NextResponse.json({
      data: {
        listingId: id,
        isValid: validation.isValid,
        canPublish: validation.isValid,
        missingFields: validation.missingFields,
        warnings: validation.warnings,
        currentStatus: listing.status,
      }
    });
  } catch (error) {
    console.error('[listings/[id]/validate] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to validate listing' },
      { status: 500 }
    );
  }
}