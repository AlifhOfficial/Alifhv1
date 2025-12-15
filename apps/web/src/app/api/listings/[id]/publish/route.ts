import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  updateListing,
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
    return { listing: null, partner: null, hasAccess: false };
  }
  
  const partner = await getPartnerById(userId);
  const hasAccess = listing.partnerId === partner?.id;
  
  return { listing, partner, hasAccess };
}

/**
 * Validate listing has all required fields for publishing
 */
function validateListingCompleteness(listing: any) {
  const required = [
    'title',
    'make',
    'model',
    'year',
    'price',
    'mileage',
    'condition',
    'bodyType',
    'fuelType',
    'transmission',
    'emirate',
    'description',
  ];
  
  const missing = required.filter(field => !listing[field]);
  
  // Must have at least one image
  if (!listing.images || listing.images.length === 0) {
    missing.push('images');
  }
  
  return {
    isComplete: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Generate listing slug from make, model, year and ID
 */
function generateSlug(listing: any): string {
  const base = `${listing.make}-${listing.model}-${listing.year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return `${base}-${listing.id.slice(0, 8)}`;
}

/**
 * POST /api/listings/[id]/publish
 * Publish a listing (workflow)
 * 
 * Steps:
 * 1. Verify partner authentication
 * 2. Check listing ownership
 * 3. Validate listing completeness
 * 4. Generate slug if missing
 * 5. Update status to published
 * 6. Set publishedAt timestamp
 * 7. Send notification (future enhancement)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Verify partner authentication
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Check listing ownership
    const { listing, partner, hasAccess } = await checkListingOwnership(id, user.id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    if (!hasAccess || !partner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Can't publish if already published
    if (listing.status === 'published') {
      return NextResponse.json(
        { error: 'Listing is already published' },
        { status: 400 }
      );
    }
    
    // Can't publish if archived
    if (listing.status === 'archived') {
      return NextResponse.json(
        { error: 'Cannot publish archived listing' },
        { status: 400 }
      );
    }
    
    // 3. Validate listing completeness
    const { isComplete, missingFields } = validateListingCompleteness(listing);
    
    if (!isComplete) {
      return NextResponse.json(
        { 
          error: 'Listing is incomplete',
          details: {
            missingFields,
            message: `Please complete the following fields: ${missingFields.join(', ')}`
          }
        },
        { status: 400 }
      );
    }
    
    // 4. Generate slug if missing
    const slug = listing.slug || generateSlug(listing);
    
    // 5-6. Update status and set publishedAt
    const updatedListing = await updateListing(id, {
      status: 'published',
      slug,
      publishedAt: new Date(),
    });
    
    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Failed to publish listing' },
        { status: 500 }
      );
    }
    
    // 7. TODO: Send notification (future enhancement)
    // - Notify partner of successful publication
    // - Send to moderation queue if needed
    // - Update search indexes
    
    return NextResponse.json({ 
      data: updatedListing,
      message: 'Listing published successfully' 
    });
  } catch (error) {
    console.error('[listings/[id]/publish] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to publish listing' },
      { status: 500 }
    );
  }
}
