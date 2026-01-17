/**
 * Similar Listings Query - Optimized for Speed
 * 
 * Strict matching logic to surface only genuinely comparable vehicles.
 * Returns empty array if insufficient quality matches.
 * 
 * Philosophy: Show nothing > show garbage. Alifh means trust.
 * 
 * Matching criteria (all hard filters, no ML fluff):
 * - Same make
 * - Same model  
 * - Same body type
 * - Price within ±10%
 * - Mileage within reasonable band (±30%)
 * - Same fuel type (soft preference, not required)
 * - Exclude current listing
 * 
 * @module queries/listings/car-listings/similar-listings-query
 */

import { eq, and, ne, gte, lte, isNotNull, gt, sql, desc, SQL } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { partner } from '../../../schema/partner';
import { user } from '../../../schema/auth';
import { userProfile } from '../../../schema/profile';
import { isPublicSql, isBlkListingSql } from './sql-fragments';

// ============================================================================
// Types
// ============================================================================

export interface SimilarListingCard {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs: string | null;
  thumbnail: string | null;
  qiScore: number | null;
  isBlkListing: boolean;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  sellerUseGeneratedAvatar: boolean | null;
}

export interface SimilarListingsParams {
  excludeId: string;
  make: string;
  model: string;
  bodyType?: string | null;
  fuelType?: string | null;
  price: number;
  mileage: number;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_RESULTS = 3;
const MIN_RESULTS_TO_SHOW = 2; // Don't show section with just 1 card
const PRICE_TOLERANCE = 0.10; // ±10%
const MILEAGE_TOLERANCE = 0.30; // ±30%

// ============================================================================
// Query
// ============================================================================

/**
 * Get similar listings based on strict matching criteria.
 * Returns empty array if fewer than MIN_RESULTS_TO_SHOW matches.
 * 
 * Query is optimized for indexed columns: make, model, bodyType, price, isPublic
 */
export async function getSimilarListings(
  params: SimilarListingsParams
): Promise<SimilarListingCard[]> {
  const { excludeId, make, model, bodyType, fuelType, price, mileage } = params;
  const now = new Date();

  // Calculate price bounds (±10%)
  const priceMin = Math.floor(price * (1 - PRICE_TOLERANCE));
  const priceMax = Math.ceil(price * (1 + PRICE_TOLERANCE));

  // Calculate mileage bounds (±30%)
  const mileageMin = Math.max(0, Math.floor(mileage * (1 - MILEAGE_TOLERANCE)));
  const mileageMax = Math.ceil(mileage * (1 + MILEAGE_TOLERANCE));

  // Build conditions - all indexed for speed
  const conditions: SQL[] = [
    // Exclude current listing
    ne(carListing.id, excludeId),
    // Public visibility (approved + active + not expired)
    eq(carListing.moderationStatus, 'approved'),
    eq(carListing.lifecycleStatus, 'active'),
    eq(carListing.needsRemoderation, false),
    and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)),
    // Strict matching
    eq(carListing.make, make),
    eq(carListing.model, model),
    // Price range
    gte(carListing.price, priceMin),
    lte(carListing.price, priceMax),
    // Mileage range
    gte(carListing.mileage, mileageMin),
    lte(carListing.mileage, mileageMax),
  ];

  // Body type (if available on source listing)
  if (bodyType) {
    conditions.push(eq(carListing.bodyType, bodyType));
  }

  // Fuel type is a soft preference - we try with it first, fallback without
  const conditionsWithFuel = fuelType 
    ? [...conditions, eq(carListing.fuelType, fuelType)]
    : conditions;

  // Select fields optimized for card display
  const selectFields = {
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
    isBlkListing: isBlkListingSql(),
    partnerName: sql<string | null>`coalesce(${carListing.partnerBrandName}, ${partner.brandName})`,
    partnerLogo: partner.logo,
    partnerVerified: sql<boolean | null>`coalesce(${carListing.partnerVerified}, ${partner.isVerified})`,
    sellerName: user.name,
    sellerAvatarUrl: userProfile.avatar,
    sellerKycVerified: userProfile.kycVerified,
    sellerUseGeneratedAvatar: sql<boolean | null>`(${userProfile.preferences}->>'useGeneratedAvatar')::boolean`,
  } as const;

  // Try with fuel type preference first
  let results = await db
    .select(selectFields)
    .from(carListing)
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(and(...conditionsWithFuel))
    .orderBy(desc(carListing.qiScore), desc(carListing.originalPublishedAt))
    .limit(MAX_RESULTS);

  // If not enough results with fuel type, try without
  if (results.length < MIN_RESULTS_TO_SHOW && fuelType) {
    results = await db
      .select(selectFields)
      .from(carListing)
      .leftJoin(partner, eq(partner.id, carListing.partnerId))
      .leftJoin(user, eq(user.id, carListing.userId))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(carListing.qiScore), desc(carListing.originalPublishedAt))
      .limit(MAX_RESULTS);
  }

  // Don't show section with just 1 lonely card - looks awkward
  if (results.length < MIN_RESULTS_TO_SHOW) {
    return [];
  }

  return results.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    trim: row.trim,
    price: row.price,
    mileage: row.mileage,
    emirate: row.emirate,
    specs: row.specs,
    thumbnail: row.thumbnail,
    qiScore: row.qiScore,
    isBlkListing: row.isBlkListing ?? false,
    partnerName: row.partnerName,
    partnerLogo: row.partnerLogo,
    partnerVerified: row.partnerVerified,
    sellerName: row.sellerName,
    sellerAvatarUrl: row.sellerAvatarUrl,
    sellerKycVerified: row.sellerKycVerified,
    sellerUseGeneratedAvatar: row.sellerUseGeneratedAvatar,
  }));
}
