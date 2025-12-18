/**
 * API: Listing Detail Endpoint
 * GET /api/listings/[id]
 * 
 * Purpose: Fetch complete listing details for a single vehicle
 * Authentication: None required (public endpoint)
 * 
 * Returns:
 * - Full vehicle specifications and condition
 * - All images, videos, and media
 * - AI valuation and market data (fairValue, qiScore, priceTrend)
 * - Partner/dealer information
 * - Engagement metrics (views, favorites, superlikes)
 * - Lead generation stats (inquiries, bookings, calls)
 * 
 * Cache Strategy:
 * - No explicit caching (frequently updated data)
 * - Client-side caching via React Query (5min staleTime)
 * 
 * Standards:
 * - Returns 400 for missing/invalid ID
 * - Returns 404 for non-existent listing
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch complete listing with partner info
    const listing = await db
      .select({
        id: schema.carListing.id,
        vin: schema.carListing.vin,
        make: schema.carListing.make,
        model: schema.carListing.model,
        year: schema.carListing.year,
        trim: schema.carListing.trim,
        bodyType: schema.carListing.bodyType,
        fuelType: schema.carListing.fuelType,
        transmission: schema.carListing.transmission,
        specs: schema.carListing.specs,
        steeringSide: schema.carListing.steeringSide,
        engineSize: schema.carListing.engineSize,
        engineType: schema.carListing.engineType,
        cylinders: schema.carListing.cylinders,
        power: schema.carListing.power,
        torque: schema.carListing.torque,
        fuelEconomy: schema.carListing.fuelEconomy,
        doors: schema.carListing.doors,
        seatingCapacity: schema.carListing.seatingCapacity,
        exteriorColor: schema.carListing.exteriorColor,
        interiorColor: schema.carListing.interiorColor,
        mileage: schema.carListing.mileage,
        price: schema.carListing.price,
        currency: schema.carListing.currency,
        isNegotiable: schema.carListing.isNegotiable,
        fairValue: schema.carListing.fairValue,
        estimateMin: schema.carListing.estimateMin,
        estimateMax: schema.carListing.estimateMax,
        priceTrend: schema.carListing.priceTrend,
        qiScore: schema.carListing.qiScore,
        emirate: schema.carListing.emirate,
        city: schema.carListing.city,
        thumbnail: schema.carListing.thumbnail,
        images: schema.carListing.images,
        videoUrl: schema.carListing.videoUrl,
        description: schema.carListing.description,
        technicalFeatures: schema.carListing.technicalFeatures,
        extras: schema.carListing.extras,
        specialNotes: schema.carListing.specialNotes,
        warranty: schema.carListing.warranty,
        status: schema.carListing.status,
        exportStatus: schema.carListing.exportStatus,
        sellerType: schema.carListing.sellerType,
        isConsignment: schema.carListing.isConsignment,
        badges: schema.carListing.badges,
        tags: schema.carListing.tags,
        isFeatured: schema.carListing.isFeatured,
        isBlackMember: schema.carListing.isBlackMember,
        viewCount: schema.carListing.viewCount,
        favouriteCount: schema.carListing.favouriteCount,
        superlikeCount: schema.carListing.superlikeCount,
        shareCount: schema.carListing.shareCount,
        inquiryCount: schema.carListing.inquiryCount,
        bookingCount: schema.carListing.bookingCount,
        callCount: schema.carListing.callCount,
        whatsappCount: schema.carListing.whatsappCount,
        leadQuality: schema.carListing.leadQuality,
        conversionRate: schema.carListing.conversionRate,
        avgTimeToSale: schema.carListing.avgTimeToSale,
        slug: schema.carListing.slug,
        metaTitle: schema.carListing.metaTitle,
        metaDescription: schema.carListing.metaDescription,
        reservedAt: schema.carListing.reservedAt,
        soldAt: schema.carListing.soldAt,
        soldPrice: schema.carListing.soldPrice,
        createdAt: schema.carListing.createdAt,
        updatedAt: schema.carListing.updatedAt,
        publishedAt: schema.carListing.publishedAt,
        archivedAt: schema.carListing.archivedAt,
        reviewedAt: schema.carListing.reviewedAt,
        rejectionReason: schema.carListing.rejectionReason,
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
