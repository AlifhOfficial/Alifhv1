/**
 * Car Listing Detail API
 * Returns full listing details for a single car
 * 
 * GET /api/listings/[id]
 * 
 * Returns:
 * - All base fields from car card
 * - Complete vehicle specifications
 * - All images and media
 * - Technical features (JSON)
 * - Special notes (JSON)
 * - AI valuation data
 * - Partner information
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/listings/[id]
 * Fetch complete listing details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[listing detail] Fetching ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch complete listing with partner info
    const listing = await db
      .select({
        // Primary identification
        id: schema.carListing.id,
        vin: schema.carListing.vin,
        
        // Basic Vehicle Information
        make: schema.carListing.make,
        model: schema.carListing.model,
        year: schema.carListing.year,
        trim: schema.carListing.trim,
        
        // Vehicle Specifications
        bodyType: schema.carListing.bodyType,
        fuelType: schema.carListing.fuelType,
        transmission: schema.carListing.transmission,
        specs: schema.carListing.specs,
        steeringSide: schema.carListing.steeringSide,
        
        // Engine & Performance
        engineSize: schema.carListing.engineSize,
        engineType: schema.carListing.engineType,
        cylinders: schema.carListing.cylinders,
        power: schema.carListing.power,
        torque: schema.carListing.torque,
        fuelEconomy: schema.carListing.fuelEconomy,
        
        // Physical Details
        doors: schema.carListing.doors,
        seatingCapacity: schema.carListing.seatingCapacity,
        exteriorColor: schema.carListing.exteriorColor,
        interiorColor: schema.carListing.interiorColor,
        
        // Condition & Mileage
        mileage: schema.carListing.mileage,
        
        // Pricing
        price: schema.carListing.price,
        currency: schema.carListing.currency,
        isNegotiable: schema.carListing.isNegotiable,
        
        // AI Valuation & Market Intelligence
        fairValue: schema.carListing.fairValue,
        estimateMin: schema.carListing.estimateMin,
        estimateMax: schema.carListing.estimateMax,
        priceTrend: schema.carListing.priceTrend,
        qiScore: schema.carListing.qiScore,
        
        // Location
        emirate: schema.carListing.emirate,
        city: schema.carListing.city,
        
        // Media & Content
        thumbnail: schema.carListing.thumbnail,
        images: schema.carListing.images,
        videoUrl: schema.carListing.videoUrl,
        description: schema.carListing.description,
        
        // Features & Extras
        technicalFeatures: schema.carListing.technicalFeatures,
        extras: schema.carListing.extras,
        specialNotes: schema.carListing.specialNotes,
        
        // Warranty & Documentation
        warranty: schema.carListing.warranty,
        
        // Status & Publication
        status: schema.carListing.status,
        exportStatus: schema.carListing.exportStatus,
        sellerType: schema.carListing.sellerType,
        isConsignment: schema.carListing.isConsignment,
        
        // Badges & Tags
        badges: schema.carListing.badges,
        tags: schema.carListing.tags,
        isFeatured: schema.carListing.isFeatured,
        isBlackMember: schema.carListing.isBlackMember,
        
        // Engagement Metrics (public-facing)
        viewCount: schema.carListing.viewCount,
        favouriteCount: schema.carListing.favouriteCount,
        superlikeCount: schema.carListing.superlikeCount,
        
        // Timestamps
        createdAt: schema.carListing.createdAt,
        updatedAt: schema.carListing.updatedAt,
        publishedAt: schema.carListing.publishedAt,
        
        // Partner info
        partnerId: schema.carListing.partnerId,
        partnerName: schema.partner.brandName,
        partnerCompanyName: schema.partner.companyNameLegal,
        partnerVerified: schema.partner.isVerified,
        partnerLogo: schema.partner.logo,
        partnerPhone: schema.partner.phone,
        partnerWebsite: schema.partner.website,
        partnerEmirate: schema.partner.emirate,
        partnerCity: schema.partner.city,
        partnerRating: schema.partner.platformRating,
        partnerReviewCount: schema.partner.platformReviewCount,
        partnerActiveListings: schema.partner.activeListings,
      })
      .from(schema.carListing)
      .leftJoin(schema.partner, eq(schema.carListing.partnerId, schema.partner.id))
      .where(eq(schema.carListing.id, id))
      .limit(1);

    if (!listing || listing.length === 0) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listingData = listing[0];

    // Only show published listings to public (unless accessing via partner dashboard)
    // For now, we'll return any status and let the frontend handle access control
    
    return NextResponse.json({
      data: listingData,
    });
  } catch (error) {
    console.error('[listing detail] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing details' },
      { status: 500 }
    );
  }
}
