import { NextRequest, NextResponse } from "next/server";
import {
  getListingById,
  incrementFavouriteCount,
  decrementFavouriteCount,
  incrementShareCount,
  incrementInquiryCount,
  incrementCallCount,
  incrementWhatsappCount,
} from "@alifh/database";

export const runtime = "nodejs";

/**
 * POST /api/listings/[id]/engage
 * Track engagement actions on a listing (public)
 * 
 * Body:
 * - action: 'favourite' | 'unfavourite' | 'share' | 'inquiry' | 'call' | 'whatsapp'
 * 
 * Increments atomic counters for analytics
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;
    
    // Validate action
    const validActions = [
      'favourite',
      'unfavourite', 
      'share',
      'inquiry',
      'call',
      'whatsapp'
    ];
    
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { 
          error: 'Invalid action',
          details: `Action must be one of: ${validActions.join(', ')}`
        },
        { status: 400 }
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
        { error: 'Cannot engage with unpublished listing' },
        { status: 400 }
      );
    }
    
    // Track engagement
    switch (action) {
      case 'favourite':
        await incrementFavouriteCount(id);
        break;
      case 'unfavourite':
        await decrementFavouriteCount(id);
        break;
      case 'share':
        await incrementShareCount(id);
        break;
      case 'inquiry':
        await incrementInquiryCount(id);
        break;
      case 'call':
        await incrementCallCount(id);
        break;
      case 'whatsapp':
        await incrementWhatsappCount(id);
        break;
    }
    
    return NextResponse.json({ 
      data: { 
        success: true,
        message: `${action} tracked successfully`,
        listingId: id,
        action,
      }
    });
  } catch (error) {
    console.error('[listings/[id]/engage] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}
