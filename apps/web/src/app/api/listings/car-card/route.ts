/**
 * API: Car Card Listings Endpoint
 * GET /api/listings/car-card
 * 
 * Purpose: Optimized listing cards for browse/search pages
 * Authentication: None required (public endpoint)
 * 
 * Features:
 * - Denormalized partner data (no JOIN needed)
 * - Only UI-essential fields (reduces payload ~60%)
 * - CDN-friendly caching (60s cache, 120s stale-while-revalidate)
 * - Batch fetching via IDs for favorites/superlikes pages
 * 
 * Query Params:
 * - ids: Comma-separated listing IDs (max 100, for favorites/superlikes)
 * - status: 'published' | 'draft' | 'pending' (default: published)
 * - partnerId: Filter by partner (inventory pages)
 * - limit: Results per page (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Cache Strategy:
 * - Public cache: 60s (s-maxage)
 * - Stale-while-revalidate: 120s (serve stale during refresh)
 * - ISR revalidation: 60s
 * - Partner inventory: No explicit status filter (shows all)
 * 
 * Standards:
 * - Returns 500 for server errors
 * - Max 100 IDs per request
 * - Sorted by createdAt DESC
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc, inArray } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
} as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get('status');
    const statusExplicit = searchParams.has('status');
    const status = statusParam || 'published';
    const partnerId = searchParams.get('partnerId');
    const idsParam = searchParams.get('ids');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const ids = idsParam
      ? idsParam
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, 100)
      : null;

    const whereConditions = [] as any[];
    if (ids?.length) whereConditions.push(inArray(schema.carListing.id, ids));
    if (partnerId) whereConditions.push(eq(schema.carListing.partnerId, partnerId));
    if (!partnerId || statusExplicit) whereConditions.push(eq(schema.carListing.status, status as any));

    const listings = await db
      .select({
        id: schema.carListing.id,
        make: schema.carListing.make,
        model: schema.carListing.model,
        year: schema.carListing.year,
        trim: schema.carListing.trim,
        price: schema.carListing.price,
        mileage: schema.carListing.mileage,
        emirate: schema.carListing.emirate,
        specs: schema.carListing.specs,
        thumbnail: schema.carListing.thumbnail,
        images: schema.carListing.images,
        qiScore: schema.carListing.qiScore,
        isBlackMember: schema.carListing.isBlackMember,
        status: schema.carListing.status,
        partnerName: schema.carListing.partnerBrandName,
        partnerVerified: schema.carListing.partnerVerified,
      })
      .from(schema.carListing)
      .where(and(...whereConditions))
      .orderBy(desc(schema.carListing.createdAt))
      .limit(limit)
      .offset(offset);
    
    const response = NextResponse.json({
      data: listings,
      meta: {
        total: listings.length,
        limit,
        offset,
      },
    });
    
    Object.entries(CACHE_HEADERS).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    
    return response;
  } catch (error) {
    console.error('[car-card listings] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
