/**
 * Similar Listings Query - Price-focused for Discovery
 * 
 * Lenient matching to surface cross-shopping opportunities.
 * Shows cars in the same price range regardless of make/model.
 * 
 * Philosophy: Help users discover alternatives in their budget.
 * 
 * Matching criteria (relaxed for more results):
 * - Price within ±15% (hard requirement)
 * - Same body type (soft preference via ranking)
 * - Exclude current listing
 * - Sorted by qiScore for quality
 * 
 * Does NOT require:
 * - Same make/model (users cross-shop brands)
 * - Similar mileage (price matters more)
 * - Same fuel type (not critical)
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
  isBlackTierPartner: boolean;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  sellerUseGeneratedAvatar: boolean | null;
}

export interface SimilarListingsParams {
  excludeId: string;
  price: number;
  bodyType?: string | null;
  // Optional: pass these for future stricter matching when data grows
  make?: string;
  model?: string;
  mileage?: number;
  fuelType?: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_RESULTS = 4;
const MIN_RESULTS_TO_SHOW = 1; // Show even 1 result - users need discovery
const PRICE_TOLERANCE = 0.15; // ±15% (relaxed from 10%)

// ============================================================================
// Query
// ============================================================================

/**
 * Get similar listings based on price range.
 * Returns empty array if fewer than MIN_RESULTS_TO_SHOW matches.
 * 
 * Query is optimized for indexed columns: price, bodyType, isPublic.
 * Uses one ranked query instead of a two-pass fallback flow.
 */
export async function getSimilarListings(
  params: SimilarListingsParams
): Promise<SimilarListingCard[]> {
  const { excludeId, price, bodyType } = params;
  const now = new Date();

  // Calculate price bounds (±15%)
  const priceMin = Math.floor(price * (1 - PRICE_TOLERANCE));
  const priceMax = Math.ceil(price * (1 + PRICE_TOLERANCE));

  // Build base conditions - price-focused
  const baseConditions: SQL[] = [
    // Exclude current listing
    ne(carListing.id, excludeId),
    // Public visibility (approved + active + not expired)
    eq(carListing.moderationStatus, 'approved'),
    eq(carListing.lifecycleStatus, 'active'),
    eq(carListing.needsRemoderation, false),
    and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)),
    // Price range (the main filter)
    gte(carListing.price, priceMin),
    lte(carListing.price, priceMax),
  ];

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
    partnerName: sql<string | null>`coalesce(${partner.brandName}, ${carListing.partnerBrandName})`,
    partnerLogo: partner.logo,
    partnerVerified: sql<boolean | null>`coalesce(${partner.isVerified}, ${carListing.partnerVerified})`,
    partnerTier: partner.tier,
    sellerName: user.name,
    sellerAvatarUrl: userProfile.avatar,
    sellerKycVerified: userProfile.kycVerified,
    sellerUseGeneratedAvatar: sql<boolean | null>`(${userProfile.preferences}->>'useGeneratedAvatar')::boolean`,
  } as const;

  const bodyTypeRankExpr = bodyType
    ? sql<number>`CASE WHEN ${carListing.bodyType} = ${bodyType} THEN 1 ELSE 0 END`
    : sql<number>`0`;
  const priceDeltaExpr = sql<number>`ABS(${carListing.price} - ${price})`;

  const results = await db
    .select({
      ...selectFields,
      bodyTypeRank: bodyTypeRankExpr.as('body_type_rank'),
      priceDelta: priceDeltaExpr.as('price_delta'),
    })
    .from(carListing)
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(and(...baseConditions))
    .orderBy(
      sql`body_type_rank DESC`,
      sql`price_delta ASC`,
      desc(carListing.qiScore),
      desc(carListing.originalPublishedAt)
    )
    .limit(MAX_RESULTS);

  // Show even 1 result - users need discovery options
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
    isBlackTierPartner: row.partnerTier === 'black',
    sellerName: row.sellerName,
    sellerAvatarUrl: row.sellerAvatarUrl,
    sellerKycVerified: row.sellerKycVerified,
    sellerUseGeneratedAvatar: row.sellerUseGeneratedAvatar,
  }));
}
