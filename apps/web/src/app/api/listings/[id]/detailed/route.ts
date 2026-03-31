/**
 * API: Detailed Car Listing Endpoint
 * GET /api/listings/[id]/detailed
 * 
 * Purpose: Fetch comprehensive listing data with seller profile for detailed view pages
 * Authentication: None required (public endpoint), but admin can view unpublished listings
 * 
 * Features:
 * - Full specifications, features, and pricing insights
 * - Seller profile data (partner OR user) - NO stats (loaded separately via /api/sellers/stats)
 * - Admin preview: Admins can view non-public listings for moderation
 * 
 * Performance:
 * - Stats are fetched separately via /api/sellers/stats to avoid blocking
 * 
 * Standards:
 * - Returns 404 for non-existent listings
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from '@/lib/auth/session-context';
import { 
  getListingDetailed,
} from "@alifh/database";
import {
  getCachedDealerProfile,
  getCachedListingDetailed,
  getCachedStaffContact,
  getCachedUserProfile,
} from '@/lib/listing-detail-cache';


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


interface RouteParams {
  params: Promise<{ id: string }>;
}

// Extracted outside handler to avoid recreation on each request
type ListingResult = NonNullable<Awaited<ReturnType<typeof getListingDetailed>>>;

async function fetchSellerData(listing: ListingResult) {
  const start = performance.now();
  
  if (listing.partnerId) {
    // Partner listing - fetch dealer profile and staff phone (NO stats - loaded separately)
    const [partnerProfile, staffContact] = await Promise.all([
      getCachedDealerProfile(listing.partnerId),
      // Get contact info for currently assigned staff (userId is updated when reassigned)
      listing.postedByRole === 'staff' && listing.userId
        ? getCachedStaffContact(listing.userId, listing.partnerId)
        : Promise.resolve(null),
    ]);
    console.log(`[fetchSellerData] partner (getDealerBaseProfile + staffPhone): ${(performance.now() - start).toFixed(0)}ms`);
    
    return { 
      type: 'partner' as const, 
      partnerId: listing.partnerId,
      partner: partnerProfile, 
      // Stats loaded separately via /api/sellers/stats
      partnerStats: null,
      // Staff contact info (phone priority: staff work → company → staff personal)
      staffContact: staffContact ? {
        phone: staffContact.phone,
        displayName: staffContact.displayName,
      } : null,
    };
  } else {
    // User listing - fetch profile only (NO stats - loaded separately)
    const userProfile = await getCachedUserProfile(listing.userId);
    console.log(`[fetchSellerData] user (getUserProfileByUserId): ${(performance.now() - start).toFixed(0)}ms`);
    
    return { 
      type: 'user' as const, 
      userId: listing.userId,
      userProfile,
    };
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const timingMarks = new Map<string, number>();
  const logTiming = (label: string) => {
    const duration = Math.round(performance.now() - startTime);
    timingMarks.set(label, duration);
    console.log(`[listing-detailed] ${label}: ${duration}ms`);
  };

  try {
    logTiming('rate-limit');

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const listing = await getCachedListingDetailed(id);
    logTiming('listing-query');

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    let isAdminPreview = false;

    // Session lookup is only needed for non-public listings.
    if (!listing.isPublic) {
      const user = await getSessionUser();
      logTiming('session-check');

      const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
      isAdminPreview = isAdmin;

      // Non-public listings: only allow admin preview
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }
    }

    const sellerData = await fetchSellerData(listing);
    logTiming('seller-query');

    // Filter sensitive data based on visibility settings
    // VIN: Only expose if vinVisibility is 'public' (or admin preview)
    const filteredListing = {
      ...listing,
      vin: (listing.vinVisibility === 'public' || isAdminPreview) ? listing.vin : null,
    };

    // User profile phone: Only expose if seller opted to show phone
    if (sellerData.type === 'user' && sellerData.userProfile) {
      const showPhone = sellerData.userProfile.privacySettings?.showPhone !== false;
      if (!showPhone) {
        sellerData.userProfile = {
          ...sellerData.userProfile,
          phone: null,
        };
      }
    }

    // Build response with filtered listing + seller data
    const responseData = { 
      listing: filteredListing, 
      sellerData,
      // Flag for UI to show admin preview banner
      isAdminPreview,
    };

    logTiming('total');

    const response = NextResponse.json(responseData);
    const serverTiming = [
      timingMarks.get('listing-query') != null ? `listing-query;dur=${timingMarks.get('listing-query')}` : null,
      timingMarks.get('session-check') != null ? `session-check;dur=${timingMarks.get('session-check')}` : null,
      timingMarks.get('seller-query') != null ? `seller-query;dur=${timingMarks.get('seller-query')}` : null,
      timingMarks.get('total') != null ? `total;dur=${timingMarks.get('total')}` : null,
    ].filter(Boolean).join(', ');
    if (serverTiming) {
      response.headers.set('Server-Timing', serverTiming);
    }
    return response;
  } catch (error) {
    console.error('[API] Error fetching detailed listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
