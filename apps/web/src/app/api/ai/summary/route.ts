/**
 * API: AI Listing Summary
 * POST /api/ai/summary
 * 
 * Purpose: Generate AI-powered listing quick-summary for mobile info sheets
 * Authentication: None (public — rate-limited instead, like detailed endpoint)
 * 
 * Input: listingId — fetches all data server-side
 * Output: Structured summary with car highlights, seller highlights, verdicts
 * 
 * Cost: GPT-4o-mini ~$0.0001/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getListingDetailed, 
  getDealerBaseProfile, 
  getUserProfileByUserId,
} from '@alifh/database';
import { generateSummary, type SummaryInput } from '@alifh/ai/summary';


export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const { listingId } = body;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: listingId' },
        { status: 400 }
      );
    }

    // Fetch listing data
    const listing = await getListingDetailed(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Fetch seller data
    let sellerName: string | null = null;
    let sellerDescription: string | null = null;
    let sellerVerified = false;
    let sellerTier: string | null = null;
    let sellerLocation: string | null = null;
    let sellerRating: number | null = null;
    let sellerReviewCount: number | null = null;
    const sellerActiveListings: number | null = null;
    let sellerBadges: string[] | null = null;
    let sellerSpecialties: string[] | null = null;
    let sellerType: 'partner' | 'user' = 'user';

    if (listing.partnerId) {
      sellerType = 'partner';
      const partner = await getDealerBaseProfile(listing.partnerId);
      if (partner) {
        sellerName = partner.brandName;
        sellerDescription = partner.description ?? null;
        sellerVerified = partner.isVerified ?? false;
        sellerTier = partner.tier ?? null;
        sellerLocation = [partner.city, partner.emirate].filter(Boolean).join(', ') || null;
        sellerRating = partner.googleRating ?? partner.platformRating ?? null;
        sellerReviewCount = partner.googleReviewCount ?? partner.platformReviewCount ?? null;
        sellerBadges = partner.badges ?? null;
        sellerSpecialties = partner.specialties ?? null;
      }
    } else if (listing.userId) {
      sellerType = 'user';
      const userProfile = await getUserProfileByUserId(listing.userId);
      if (userProfile) {
        const fullName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ');
        sellerName = userProfile.userName || fullName || null;
        sellerDescription = userProfile.description || null;
        sellerVerified = userProfile.kycVerified || false;
        sellerRating = userProfile.platformRating || null;
        sellerBadges = userProfile.badges || null;
      }
    }

    // Build AI input
    const input: SummaryInput = {
      make: listing.make,
      model: listing.model,
      year: listing.year,
      trim: listing.trim,
      mileage: listing.mileage,
      price: listing.price,
      specs: listing.specs,
      emirate: listing.emirate,
      condition: listing.condition as 'new' | 'used' | null,
      bodyType: listing.bodyType,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      engineSize: listing.engineSize,
      cylinders: listing.cylinders,
      exteriorColor: listing.exteriorColor,
      interiorColor: listing.interiorColor,
      description: listing.description,
      extras: listing.extras,
      isNegotiable: listing.isNegotiable,
      isBlkListing: listing.isBlkListing,
      viewCount: listing.viewCount,
      favouriteCount: listing.favouriteCount,
      sellerType,
      sellerName,
      sellerDescription,
      sellerVerified,
      sellerTier,
      sellerLocation,
      sellerRating,
      sellerReviewCount,
      sellerActiveListings,
      sellerBadges,
      sellerSpecialties,
    };

    const result = await generateSummary(input);

    // Include factual context — the data DarkWeave based its read on
    const responseData = {
      ...result,
      context: {
        year: listing.year,
        mileage: listing.mileage,
        specs: listing.specs || null,
        condition: listing.condition || null,
        trim: listing.trim || null,
        emirate: listing.emirate || null,
        featureCount: Array.isArray(listing.extras) ? listing.extras.length : 0,
        bodyType: listing.bodyType || null,
        fuelType: listing.fuelType || null,
        transmission: listing.transmission || null,
        sellerType,
        sellerRating: sellerRating,
        sellerReviewCount: sellerReviewCount,
        sellerVerified,
      },
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('[AI Summary API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
