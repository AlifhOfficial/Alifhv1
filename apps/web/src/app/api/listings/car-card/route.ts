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
  const startTime = performance.now();
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

    const queryStart = performance.now();
    // Fetch only UI-needed fields (using denormalized partner data - no JOIN needed!)
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
        
        // Partner info (denormalized - avoids LEFT JOIN with partner table)
        partnerName: schema.carListing.partnerBrandName,
        partnerVerified: schema.carListing.partnerVerified,
      })
      .from(schema.carListing)
      .where(and(...whereConditions))
      .orderBy(desc(schema.carListing.createdAt))
      .limit(limit)
      .offset(offset);
    const queryTime = performance.now() - queryStart;

    const totalTime = performance.now() - startTime;
    console.log(`[car-card] GET completed in ${totalTime.toFixed(0)}ms (query: ${queryTime.toFixed(0)}ms, count: ${listings.length}, ids: ${ids?.length || 'none'})`);
    
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
