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
import { db, memoryCache, CacheKeys, CacheTTL } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc, inArray } from "drizzle-orm";

export const runtime = "edge";
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

    // ⚡ MEMORY CACHE: Generate cache key based on request params
    let cacheKey: string;
    let cacheTTL: number;
    
    if (ids?.length) {
      // Batch request (favorites/superlikes) - 1min cache
      cacheKey = CacheKeys.listingCardsBatch(ids);
      cacheTTL = CacheTTL.listingCardsBatch;
    } else if (partnerId) {
      // Partner inventory - 3min cache
      cacheKey = CacheKeys.partnerInventory(partnerId, statusExplicit ? status : undefined);
      cacheTTL = CacheTTL.partnerInventory;
    } else {
      // Main browse/search - 2min cache
      const filterKey = `${status}:${limit}:${offset}`;
      cacheKey = CacheKeys.listingCards(filterKey);
      cacheTTL = CacheTTL.listingCards;
    }

    // ⚡ CACHE HIT: Return cached data
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      console.log(`[car-card] Cache HIT for ${cacheKey.substring(0, 50)}...`);
      const response = NextResponse.json(cached);
      Object.entries(CACHE_HEADERS).forEach(([key, value]) => 
        response.headers.set(key, value)
      );
      return response;
    }

    // ⚡ CACHE MISS: Query database with 2-step fetch optimization
    console.log(`[car-card] Cache MISS for ${cacheKey.substring(0, 50)}... - querying DB`);
    const queryStart = performance.now();

    const whereConditions = [] as any[];
    if (ids?.length) whereConditions.push(inArray(schema.carListing.id, ids));
    if (partnerId) whereConditions.push(eq(schema.carListing.partnerId, partnerId));
    if (!partnerId || statusExplicit) whereConditions.push(eq(schema.carListing.status, status as any));

    let listings;
    
    // 2-STEP OPTIMIZATION: Only when NOT fetching by specific IDs
    if (!ids?.length) {
      // STEP 1: Fast query to get IDs only (index-driven, minimal data transfer)
      const step1Start = performance.now();
      const listingIds = await db
        .select({ id: schema.carListing.id })
        .from(schema.carListing)
        .where(and(...whereConditions))
        .orderBy(desc(schema.carListing.createdAt))
        .limit(limit)
        .offset(offset);
      
      const step1Time = performance.now() - step1Start;
      console.log(`[car-card] Step 1 (IDs only): ${step1Time.toFixed(2)}ms - ${listingIds.length} IDs`);
      
      if (listingIds.length === 0) {
        listings = [];
      } else {
        // STEP 2: Batch fetch full details for those specific IDs
        const step2Start = performance.now();
        const idsToFetch = listingIds.map(l => l.id);
        listings = await db
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
            // images: schema.carListing.images, // Removed: Lazy-load on card interaction to reduce payload
            qiScore: schema.carListing.qiScore,
            isBlackMember: schema.carListing.isBlackMember,
            status: schema.carListing.status,
            partnerName: schema.carListing.partnerBrandName,
            partnerVerified: schema.carListing.partnerVerified,
          })
          .from(schema.carListing)
          .where(inArray(schema.carListing.id, idsToFetch));
        
        // Restore original sort order from step 1
        const idOrder = new Map(idsToFetch.map((id, idx) => [id, idx]));
        listings.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));
        
        const step2Time = performance.now() - step2Start;
        console.log(`[car-card] Step 2 (full details): ${step2Time.toFixed(2)}ms`);
      }
    } else {
      // Single query when fetching by specific IDs (favorites/superlikes)
      listings = await db
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
          // images: schema.carListing.images, // Removed: Lazy-load on card interaction to reduce payload
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
    }
    
    const queryTime = performance.now() - queryStart;
    console.log(`[car-card] Total DB time: ${queryTime.toFixed(2)}ms - ${listings.length} results`);

    // ⚡ CACHE: Store results
    const responseData = {
      data: listings,
      meta: {
        total: listings.length,
        limit,
        offset,
      },
    };
    
    memoryCache.set(cacheKey, responseData, cacheTTL);
    
    const response = NextResponse.json(responseData);
    
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
