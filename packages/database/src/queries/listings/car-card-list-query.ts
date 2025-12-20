/**
 * Car Card List Queries - Production
 * 
 * Optimized queries for listing cards (browse/search pages).
 * Features 2-step optimization: fetch IDs first, then batch details.
 * 
 * @module queries/listings/car-card-list-query
 */

import { eq, and, desc, inArray, SQL } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing } from '../../schema/listing';

export interface CarCardFilters {
  ids?: string[];
  status?: string;
  partnerId?: string;
  limit?: number;
  offset?: number;
}

export interface CarCardData {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  emirate: string | null;
  specs: string | null;
  thumbnail: string | null;
  qiScore: number | null;
  isBlackMember: boolean | null;
  status: string | null;
  partnerName: string | null;
  partnerVerified: boolean | null;
}

/**
 * Get listing cards with 2-step optimization
 * Step 1: Fetch IDs only (fast, index-driven)
 * Step 2: Batch fetch full details for those IDs
 */
export async function getListingCards(filters: CarCardFilters): Promise<CarCardData[]> {
  const { ids, status = 'published', partnerId, limit = 20, offset = 0 } = filters;

  // Build WHERE conditions
  const whereConditions: SQL[] = [];
  
  if (ids?.length) {
    whereConditions.push(inArray(carListing.id, ids));
  }
  
  if (partnerId) {
    whereConditions.push(eq(carListing.partnerId, partnerId));
  }
  
  // Only filter by status if not fetching specific IDs or if partnerId is provided with explicit status
  if (!ids?.length || partnerId) {
    whereConditions.push(eq(carListing.status, status as any));
  }

  // 2-STEP OPTIMIZATION: Only when NOT fetching by specific IDs
  if (!ids?.length) {
    // STEP 1: Fast query to get IDs only (index-driven, minimal data transfer)
    const listingIds = await db
      .select({ id: carListing.id })
      .from(carListing)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(carListing.createdAt))
      .limit(limit)
      .offset(offset);

    if (listingIds.length === 0) {
      return [];
    }

    // STEP 2: Batch fetch full details for those specific IDs
    const idsToFetch = listingIds.map(l => l.id);
    const listings = await db
      .select({
        id: carListing.id,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
        trim: carListing.trim,
        price: carListing.price,
        mileage: carListing.mileage,
        emirate: carListing.emirate,
        specs: carListing.specs,
        thumbnail: carListing.thumbnail,
        qiScore: carListing.qiScore,
        isBlackMember: carListing.isBlackMember,
        status: carListing.status,
        partnerName: carListing.partnerBrandName,
        partnerVerified: carListing.partnerVerified,
      })
      .from(carListing)
      .where(inArray(carListing.id, idsToFetch));

    // Restore original sort order from step 1
    const idOrder = new Map(idsToFetch.map((id, idx) => [id, idx]));
    listings.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    return listings;
  }

  // Single query when fetching by specific IDs (favorites/superlikes)
  const listings = await db
    .select({
      id: carListing.id,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      trim: carListing.trim,
      price: carListing.price,
      mileage: carListing.mileage,
      emirate: carListing.emirate,
      specs: carListing.specs,
      thumbnail: carListing.thumbnail,
      qiScore: carListing.qiScore,
      isBlackMember: carListing.isBlackMember,
      status: carListing.status,
      partnerName: carListing.partnerBrandName,
      partnerVerified: carListing.partnerVerified,
    })
    .from(carListing)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(carListing.createdAt))
    .limit(limit)
    .offset(offset);

  return listings;
}
