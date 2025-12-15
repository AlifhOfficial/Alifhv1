import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPendingListings,
  getReservedListings,
  getSoldListings,
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
 * GET /api/listings/admin
 * Get listings for admin/moderation purposes
 * 
 * Query params:
 * - type: 'pending' | 'reserved' | 'sold'
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 * - partnerId: string (optional filter for sold listings)
 * - userId: string (optional filter for reserved/sold listings)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add admin/moderator permission check here
    // For now, assuming authenticated user has access

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const partnerId = searchParams.get('partnerId') || undefined;
    const userId = searchParams.get('userId') || undefined;

    let listings = [];

    switch (type) {
      case 'pending':
        listings = await getPendingListings({ limit, offset });
        break;
        
      case 'reserved':
        listings = await getReservedListings(userId, { limit, offset });
        break;
        
      case 'sold':
        listings = await getSoldListings({ partnerId, userId, limit, offset });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be: pending, reserved, or sold' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data: listings,
      meta: {
        type,
        limit,
        offset,
        count: listings.length,
      }
    });
  } catch (error) {
    console.error('[listings/admin] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin listings' },
      { status: 500 }
    );
  }
}