import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  updateConversionMetrics,
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
 * PATCH /api/listings/[id]/analytics
 * Update conversion metrics for a listing (owner only)
 * 
 * Body:
 * - leadQuality?: number (0-100)
 * - conversionRate?: number (0-100)
 * - avgTimeToSale?: number (days)
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
        { error: 'You do not have permission to modify this listing\'s analytics' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { leadQuality, conversionRate, avgTimeToSale } = body;

    // Validate metrics
    if (leadQuality !== undefined && (leadQuality < 0 || leadQuality > 100)) {
      return NextResponse.json(
        { error: 'Lead quality must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (conversionRate !== undefined && (conversionRate < 0 || conversionRate > 100)) {
      return NextResponse.json(
        { error: 'Conversion rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (avgTimeToSale !== undefined && avgTimeToSale < 0) {
      return NextResponse.json(
        { error: 'Average time to sale must be positive' },
        { status: 400 }
      );
    }

    const updatedListing = await updateConversionMetrics(id, {
      leadQuality,
      conversionRate,
      avgTimeToSale,
    });

    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to update analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: updatedListing.id,
        leadQuality: updatedListing.leadQuality,
        conversionRate: updatedListing.conversionRate,
        avgTimeToSale: updatedListing.avgTimeToSale,
        updatedAt: updatedListing.updatedAt,
      },
      message: 'Analytics updated successfully'
    });
  } catch (error) {
    console.error('[listings/[id]/analytics] PATCH failed', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}