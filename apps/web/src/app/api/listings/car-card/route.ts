/**
 * Car Card Listings API
 * Returns listings with only fields needed for car card UI display
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc, inArray } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/listings/car-card
 * Returns listings with only UI-needed fields:
 * - id, make, model, year, trim
 * - price, mileage, emirate, specs
 * - thumbnail, images, qiScore
 * - partnerName, partnerVerified, isBlackMember
 * 
 * Query params:
 * - ids: comma-separated listing IDs (when provided, returns only those listings)
 * - status: 'published' | 'draft' | 'pending' etc. (default: published)
 * - partnerId: filter by partner ID
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 */
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

    // Build WHERE clause
    // Preserve existing behavior: if `partnerId` is provided and `status` is not explicitly set,
    // we do NOT filter by status (used by partner inventory views).
    const whereConditions = [] as any[];
    if (ids?.length) whereConditions.push(inArray(schema.carListing.id, ids));
    if (partnerId) whereConditions.push(eq(schema.carListing.partnerId, partnerId));
    if (!partnerId || statusExplicit) whereConditions.push(eq(schema.carListing.status, status as any));

    // Fetch only UI-needed fields
    const listings = await db
      .select({
        // Core fields used in CarCard
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
        
        // Partner info
        partnerName: schema.partner.brandName,
        partnerVerified: schema.partner.isVerified,
      })
      .from(schema.carListing)
      .leftJoin(schema.partner, eq(schema.carListing.partnerId, schema.partner.id))
      .where(and(...whereConditions))
      .orderBy(desc(schema.carListing.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json({
      data: listings,
      meta: {
        total: listings.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[car-card listings] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
