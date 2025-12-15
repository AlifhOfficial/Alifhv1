import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  submitForReview,
  approveListing,
  rejectListing,
  publishListing,
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
 * POST /api/listings/[id]/workflow
 * Handle listing workflow actions
 * 
 * Body:
 * - action: 'publish' | 'submit_for_review' | 'approve' | 'reject'
 * - rejectionReason?: string (for reject action by admin)
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

    const body = await req.json();
    const { action } = body;

    if (!action || !['publish', 'submit_for_review', 'approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: publish, submit_for_review, approve, or reject' },
        { status: 400 }
      );
    }

    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    let updatedListing = null;

    switch (action) {
      case 'publish': {
        // Check ownership for publish action
        const { hasAccess } = await checkListingOwnership(id, user.id);
        if (!hasAccess) {
          return NextResponse.json(
            { error: 'You do not have permission to modify this listing' },
            { status: 403 }
          );
        }

        if (listing.status !== 'draft') {
          return NextResponse.json(
            { error: 'Only draft listings can be published directly' },
            { status: 400 }
          );
        }

        updatedListing = await publishListing(id);
        break;
      }

      case 'submit_for_review': {
        // Check ownership for submit action
        const { hasAccess } = await checkListingOwnership(id, user.id);
        if (!hasAccess) {
          return NextResponse.json(
            { error: 'You do not have permission to modify this listing' },
            { status: 403 }
          );
        }

        if (listing.status !== 'draft') {
          return NextResponse.json(
            { error: 'Only draft listings can be submitted for review' },
            { status: 400 }
          );
        }

        updatedListing = await submitForReview(id);
        break;
      }

      case 'approve': {
        // TODO: Check if user has admin/moderator permissions
        if (listing.status !== 'pending') {
          return NextResponse.json(
            { error: 'Only pending listings can be approved' },
            { status: 400 }
          );
        }

        updatedListing = await approveListing(id, user.id);
        break;
      }

      case 'reject': {
        // TODO: Check if user has admin/moderator permissions
        const { rejectionReason } = body;
        if (!rejectionReason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }

        if (listing.status !== 'pending') {
          return NextResponse.json(
            { error: 'Only pending listings can be rejected' },
            { status: 400 }
          );
        }

        updatedListing = await rejectListing(id, user.id, rejectionReason);
        break;
      }
    }

    if (!updatedListing) {
      return NextResponse.json(
        { error: `Failed to ${action} listing` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedListing,
      message: `Listing ${action.replace('_', ' ')} successful`
    });
  } catch (error) {
    console.error('[listings/[id]/workflow] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to process listing action' },
      { status: 500 }
    );
  }
}