import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllListings,
  createListing,
  getPartnerById,
  type ListingInsert,
} from "@alifh/database";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Helper to get authenticated user from session
 */
async function getSessionUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

/**
 * Helper to require partner authentication
 */
async function requirePartner(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const user = session?.user;
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  // Check if user has partner
  const partner = await getPartnerById(user.id);
  if (!partner || partner.status !== 'active') {
    throw new Error('Partner access required');
  }
  
  return { user, partner };
}

/**
 * GET /api/listings
 * List all published listings (public search)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse filters from query params
    const filters: any = {
      status: searchParams.get('status') || 'published',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };
    
    // Location
    if (searchParams.get('emirate')) {
      filters.emirate = searchParams.get('emirate');
    }
    
    // Vehicle filters
    if (searchParams.get('make')) {
      filters.make = searchParams.get('make');
    }
    if (searchParams.get('model')) {
      filters.model = searchParams.get('model');
    }
    if (searchParams.get('year')) {
      filters.year = parseInt(searchParams.get('year')!);
    }
    if (searchParams.get('minYear')) {
      filters.minYear = parseInt(searchParams.get('minYear')!);
    }
    if (searchParams.get('maxYear')) {
      filters.maxYear = parseInt(searchParams.get('maxYear')!);
    }
    
    // Price range (in AED cents)
    if (searchParams.get('minPrice')) {
      filters.minPrice = parseInt(searchParams.get('minPrice')!);
    }
    if (searchParams.get('maxPrice')) {
      filters.maxPrice = parseInt(searchParams.get('maxPrice')!);
    }
    
    // Mileage range
    if (searchParams.get('minMileage')) {
      filters.minMileage = parseInt(searchParams.get('minMileage')!);
    }
    if (searchParams.get('maxMileage')) {
      filters.maxMileage = parseInt(searchParams.get('maxMileage')!);
    }
    
    // Array filters
    if (searchParams.get('bodyType')) {
      filters.bodyType = searchParams.get('bodyType')!.split(',');
    }
    if (searchParams.get('fuelType')) {
      filters.fuelType = searchParams.get('fuelType')!.split(',');
    }
    if (searchParams.get('transmission')) {
      filters.transmission = searchParams.get('transmission')!.split(',');
    }
    
    // Seller type
    if (searchParams.get('sellerType')) {
      filters.sellerType = searchParams.get('sellerType');
    }
    
    // Premium features
    if (searchParams.get('isFeatured') !== null) {
      filters.isFeatured = searchParams.get('isFeatured') === 'true';
    }
    if (searchParams.get('isBlackMember') !== null) {
      filters.isBlackMember = searchParams.get('isBlackMember') === 'true';
    }
    
    // Sorting
    if (searchParams.get('sortBy')) {
      filters.sortBy = searchParams.get('sortBy');
    }
    if (searchParams.get('sortOrder')) {
      filters.sortOrder = searchParams.get('sortOrder');
    }

    // Fetch listings with partner info using join
    const listingsWithPartner = await db
      .select({
        // Primary identification
        id: schema.carListing.id,
        vin: schema.carListing.vin,
        
        // Ownership & Seller
        partnerId: schema.carListing.partnerId,
        userId: schema.carListing.userId,
        sellerType: schema.carListing.sellerType,
        isConsignment: schema.carListing.isConsignment,
        
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
        warranty: schema.carListing.warranty,
        
        // Status & Publication
        status: schema.carListing.status,
        exportStatus: schema.carListing.exportStatus,
        
        // Badges & Tags
        badges: schema.carListing.badges,
        tags: schema.carListing.tags,
        isFeatured: schema.carListing.isFeatured,
        isBlackMember: schema.carListing.isBlackMember,
        
        // Engagement Metrics
        viewCount: schema.carListing.viewCount,
        favouriteCount: schema.carListing.favouriteCount,
        superlikeCount: schema.carListing.superlikeCount,
        shareCount: schema.carListing.shareCount,
        
        // Lead Generation Metrics
        inquiryCount: schema.carListing.inquiryCount,
        bookingCount: schema.carListing.bookingCount,
        callCount: schema.carListing.callCount,
        whatsappCount: schema.carListing.whatsappCount,
        
        // SEO & Discovery
        slug: schema.carListing.slug,
        
        // Timestamps
        createdAt: schema.carListing.createdAt,
        updatedAt: schema.carListing.updatedAt,
        publishedAt: schema.carListing.publishedAt,
        
        // Partner data
        partnerName: schema.partner.brandName,
        partnerVerified: schema.partner.isVerified,
        partnerLogo: schema.partner.logo,
        partnerTier: schema.partner.tier,
      })
      .from(schema.carListing)
      .leftJoin(schema.partner, eq(schema.carListing.partnerId, schema.partner.id))
      .where(eq(schema.carListing.status, 'published'))
      .orderBy(desc(schema.carListing.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);
    
    return NextResponse.json({
      data: listingsWithPartner,
      meta: {
        total: listingsWithPartner.length,
        limit: filters.limit,
        offset: filters.offset,
      },
    });
  } catch (error) {
    console.error('[listings] GET failed', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch listings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new listing (partner only)
 */
export async function POST(req: NextRequest) {
  try {
    const { partner } = await requirePartner(req);
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.price || !body.mileage || !body.emirate) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, price, mileage, emirate' },
        { status: 400 }
      );
    }
    
    // Create listing with partner ID
    const listingData: Omit<ListingInsert, 'id'> = {
      ...body,
      partnerId: partner.id,
      sellerType: 'dealer',
      status: 'draft', // Always start as draft
    };
    
    const listing = await createListing(listingData);

    return NextResponse.json(
      { data: listing },
      { status: 201 }
    );
  } catch (error) {
    console.error('[listings] POST failed', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message === 'Partner access required') {
      return NextResponse.json(
        { error: 'Partner access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
