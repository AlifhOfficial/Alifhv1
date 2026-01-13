/**
 * Car Card Listing Queries - Production
 * 
 * Optimized queries for listing cards (browse/search pages).
 * Features 2-step optimization: fetch IDs first, then batch details.
 * For CRUD operations, use a dedicated listing management module.
 * 
 * @module queries/listings/car-card-query
 */

import { eq, and, desc, inArray, SQL, sql, or, isNotNull, gt } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { user } from '../../../schema/auth';
import { userProfile } from '../../../schema/profile';
import { partner } from '../../../schema/partner';
import { isPublicSql, isBlkListingSql } from './sql-fragments';
import { isMissingColumnError } from './error-utils';

export interface CarCardFilters {
  ids?: string[];
  /**
   * Legacy overall status filter (kept for compatibility).
   * Prefer `visibility`, `moderationStatus`, or `lifecycleStatus`.
   */
  status?: string;
  /**
   * Public browse visibility.
   * - 'public': approved + active + not expired
   * - 'all': no visibility filtering
   */
  visibility?: 'public' | 'all';
  moderationStatus?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus?: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
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
  isBlkListing: boolean | null;
  postedByRole: 'user' | 'staff' | null;
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | null;
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted' | null;
  isPublic: boolean | null;
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
  sellerUseGeneratedAvatar: boolean | null;
}

/**
 * Build the common select fields for car card queries
 * Extracted to avoid duplication between query paths
 */
function buildCardSelectFields(now: Date) {
  return {
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
    postedByRole: carListing.postedByRole,
    moderationStatus: carListing.moderationStatus,
    lifecycleStatus: carListing.lifecycleStatus,
    isPublic: isPublicSql(now),
    partnerName: sql<string | null>`coalesce(${carListing.partnerBrandName}, ${partner.brandName})`,
    partnerLogo: partner.logo,
    partnerVerified: sql<boolean | null>`coalesce(${carListing.partnerVerified}, ${partner.isVerified})`,
    sellerName: user.name,
    sellerAvatarUrl: userProfile.avatar,
    sellerKycVerified: userProfile.kycVerified,
    sellerUseGeneratedAvatar: sql<boolean | null>`(${userProfile.preferences}->>'useGeneratedAvatar')::boolean`,
  } as const;
}

/**
 * Build public visibility conditions (approved, active, not expired)
 * Returns conditions array instead of mutating external array
 */
function buildPublicConditions(now: Date, includeExpiryCheck: boolean): SQL[] {
  const conditions: SQL[] = [
    eq(carListing.moderationStatus, 'approved'),
    eq(carListing.lifecycleStatus, 'active'),
    eq(carListing.needsRemoderation, false),
  ];
  
  if (includeExpiryCheck) {
    conditions.push(and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now))!);
  }
  
  return conditions;
}

/**
 * Deduplicate listings by ID (handles potential DB anomalies)
 */
function deduplicateById<T extends { id: string }>(listings: T[]): T[] {
  const seen = new Set<string>();
  return listings.filter(listing => {
    if (seen.has(listing.id)) return false;
    seen.add(listing.id);
    return true;
  });
}

/**
 * Get listing cards with 2-step optimization
 * Step 1: Fetch IDs only (fast, index-driven)
 * Step 2: Batch fetch full details for those IDs
 */
async function getListingCardsInternal(
  filters: CarCardFilters,
  options?: { ignoreExpiryFilter?: boolean }
): Promise<CarCardData[]> {
  const {
    ids,
    status,
    visibility = 'public',
    moderationStatus,
    lifecycleStatus,
    partnerId,
    limit = 20,
    offset = 0,
  } = filters;
  
  const now = new Date();
  const ignoreExpiryFilter = options?.ignoreExpiryFilter === true;
  const selectFields = buildCardSelectFields(now);

  // Build WHERE conditions
  const whereConditions: SQL[] = [];
  
  if (ids?.length) {
    whereConditions.push(inArray(carListing.id, ids));
  }
  
  if (partnerId) {
    whereConditions.push(eq(carListing.partnerId, partnerId));
  }

  // Preferred explicit filters
  if (moderationStatus) {
    whereConditions.push(eq(carListing.moderationStatus, moderationStatus));
  }
  if (lifecycleStatus) {
    whereConditions.push(eq(carListing.lifecycleStatus, lifecycleStatus));
  }

  // Determine if we need public visibility conditions
  const needsPublicConditions = 
    visibility === 'public' || 
    status === 'published' || 
    status === 'public';

  // Legacy overall status filter (maps to new dimensions)
  if (status) {
    switch (status) {
      case 'published':
      case 'public':
        whereConditions.push(...buildPublicConditions(now, !ignoreExpiryFilter));
        break;
      case 'draft':
        whereConditions.push(eq(carListing.moderationStatus, 'draft'));
        break;
      case 'pending':
        whereConditions.push(
          or(eq(carListing.moderationStatus, 'submitted'), eq(carListing.moderationStatus, 'pending_review'))!
        );
        break;
      case 'rejected':
        whereConditions.push(eq(carListing.moderationStatus, 'rejected'));
        break;
      case 'archived':
      case 'sold':
      case 'expired':
      case 'deleted':
        whereConditions.push(eq(carListing.lifecycleStatus, status as any));
        break;
      case 'all':
        // No additional conditions
        break;
      default:
        // Unknown status - apply visibility rules
        if (visibility === 'public') {
          whereConditions.push(...buildPublicConditions(now, !ignoreExpiryFilter));
        }
    }
  } else if (visibility === 'public') {
    whereConditions.push(...buildPublicConditions(now, !ignoreExpiryFilter));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // FAST PATH: Fetching by specific IDs (favorites/superlikes)
  // Skip pagination/sorting - we want exactly those IDs
  if (ids?.length) {
    const listings = await db
      .select(selectFields)
      .from(carListing)
      .leftJoin(user, eq(user.id, carListing.userId))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(partner, eq(partner.id, carListing.partnerId))
      .where(whereClause);

    // Preserve original ID order from input
    const idOrder = new Map(ids.map((id, idx) => [id, idx]));
    listings.sort((a, b) => (idOrder.get(a.id) ?? Infinity) - (idOrder.get(b.id) ?? Infinity));

    return deduplicateById(listings);
  }

  // 2-STEP PATTERN: Browse/search with pagination
  // Use originalPublishedAt for public browsing to prevent repost "bump to top" abuse
  const prefersPublishedOrder = needsPublicConditions;
  const orderByNewest = prefersPublishedOrder
    ? [sql`${carListing.originalPublishedAt} desc nulls last`, desc(carListing.createdAt)]
    : [desc(carListing.createdAt)];

  // STEP 1: Get IDs only with filtering and pagination (fast, index-driven)
  const listingIds = await db
    .select({ id: carListing.id })
    .from(carListing)
    .where(whereClause)
    .orderBy(...orderByNewest)
    .limit(limit)
    .offset(offset);

  if (listingIds.length === 0) {
    return [];
  }

  // STEP 2: Batch fetch full details for those specific IDs
  const idsToFetch = listingIds.map(l => l.id);
  const listings = await db
    .select(selectFields)
    .from(carListing)
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .where(inArray(carListing.id, idsToFetch));

  // Restore original sort order from step 1
  const idOrder = new Map(idsToFetch.map((id, idx) => [id, idx]));
  listings.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

  return deduplicateById(listings);
}

export async function getListingCards(filters: CarCardFilters): Promise<CarCardData[]> {
  try {
    return await getListingCardsInternal(filters);
  } catch (err) {
    // Graceful degradation for missing expires_at column (schema migration)
    if ((filters.status === 'published' || filters.visibility === 'public') && isMissingColumnError(err, 'expires_at')) {
      return await getListingCardsInternal(filters, { ignoreExpiryFilter: true });
    }
    throw err;
  }
}
