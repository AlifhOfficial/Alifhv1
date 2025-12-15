import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingsByPartnerId,
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
 * GET /api/listings/partner/[partnerId]
 * Get all listings for a specific partner
 * 
 * Public for viewing published listings
 * Private (owner only) for viewing all listings including drafts
 * 
 * Query params:
 * - status: 'draft' | 'published' | 'archived' (default: published)
 * - sortBy: 'recent' | 'price' | 'views' | 'engagement' (default: recent)
 * - limit: number (default: 20, max: 100)
 * - offset: number (default: 0)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { searchParams } = new URL(req.url);
    
    // Verify partner exists
    const partner = await getPartnerById(partnerId);
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }
    
    const user = await getSessionUser(req);
    const isOwner = user?.id === partnerId;
    
    // Parse filters
    const status = searchParams.get('status') || 'published';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Non-owners can only view published listings
    if (!isOwner && status !== 'published') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const listings = await getListingsByPartnerId(
      partnerId,
      {
        status: status as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        limit,
        offset,
      }
    );
    
    return NextResponse.json({ 
      data: listings,
      meta: {
        partnerId,
        partnerName: partner.businessName,
        status,
        sortBy,
        limit,
        offset,
        count: listings.length,
      }
    });
  } catch (error) {
    console.error('[listings/partner/[partnerId]] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner listings' },
      { status: 500 }
    );
  }
}
