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
}

/**
 * Get listing cards with 2-step optimization
 * Step 1: Fetch IDs only (fast, index-driven)
 * Step 2: Batch fetch full details for those IDs
 */
function isMissingColumnError(err: unknown, columnName: string): boolean {
  const anyErr = err as any;
  const code = anyErr?.code ?? anyErr?.cause?.code;
  const message = String(anyErr?.message ?? anyErr?.cause?.message ?? '');
  return code === '42703' && message.includes(columnName);
}

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
  const prefersPublishedOrder = visibility === 'public' || status === 'published' || status === 'public';
  const orderByNewest = prefersPublishedOrder
    ? [sql`${carListing.publishedAt} desc nulls last`, desc(carListing.createdAt)]
    : [desc(carListing.createdAt)];

  // Build WHERE conditions
  const whereConditions: SQL[] = [];
  
  if (ids?.length) {
    whereConditions.push(inArray(carListing.id, ids));
  }
  
  if (partnerId) {
    whereConditions.push(eq(carListing.partnerId, partnerId));
  }

  const publicWhere = () => {
    whereConditions.push(eq(carListing.moderationStatus, 'approved'));
    whereConditions.push(eq(carListing.lifecycleStatus, 'active'));
    whereConditions.push(eq(carListing.needsRemoderation, false));
    if (!ignoreExpiryFilter) {
      whereConditions.push(and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)));
    }
  };

  // Preferred explicit filters
  if (moderationStatus) whereConditions.push(eq(carListing.moderationStatus, moderationStatus));
  if (lifecycleStatus) whereConditions.push(eq(carListing.lifecycleStatus, lifecycleStatus));

  // Legacy overall status filter (maps to new dimensions)
  if (status) {
    if (status === 'published' || status === 'public') {
      publicWhere();
    } else if (status === 'draft') {
      whereConditions.push(eq(carListing.moderationStatus, 'draft'));
    } else if (status === 'pending') {
      whereConditions.push(
        or(eq(carListing.moderationStatus, 'submitted'), eq(carListing.moderationStatus, 'pending_review'))
      );
    } else if (status === 'rejected') {
      whereConditions.push(eq(carListing.moderationStatus, 'rejected'));
    } else if (['archived', 'sold', 'expired', 'deleted'].includes(status)) {
      whereConditions.push(eq(carListing.lifecycleStatus, status as any));
    } else if (status !== 'all') {
      // Fall back to visibility rules if an unknown status is passed.
      if (visibility === 'public') publicWhere();
    }
  } else if (visibility === 'public') {
    publicWhere();
  }

  // Use 2-step pattern for better performance unless fetching specific IDs
  if (!ids?.length) {
    // STEP 1: Get IDs only with filtering and pagination
    const listingIds = await db
      .select({ id: carListing.id })
      .from(carListing)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(...orderByNewest)
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
      })
      .from(carListing)
      .leftJoin(user, eq(user.id, carListing.userId))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(partner, eq(partner.id, carListing.partnerId))
      .where(inArray(carListing.id, idsToFetch));

    // Restore original sort order from step 1
    const idOrder = new Map(idsToFetch.map((id, idx) => [id, idx]));
    listings.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    // Deduplicate by ID in case of any database anomalies
    const seen = new Set<string>();
    const uniqueListings = listings.filter(listing => {
      if (seen.has(listing.id)) return false;
      seen.add(listing.id);
      return true;
    });

    return uniqueListings;
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
    })
    .from(carListing)
    .leftJoin(user, eq(user.id, carListing.userId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .leftJoin(partner, eq(partner.id, carListing.partnerId))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(...orderByNewest)
    .limit(limit)
    .offset(offset);

  // Deduplicate by ID in case of any database anomalies
  const seen = new Set<string>();
  const uniqueListings = listings.filter(listing => {
    if (seen.has(listing.id)) return false;
    seen.add(listing.id);
    return true;
  });

  return uniqueListings;
}

export async function getListingCards(filters: CarCardFilters): Promise<CarCardData[]> {
  try {
    return await getListingCardsInternal(filters);
  } catch (err) {
    if ((filters.status === 'published' || filters.visibility === 'public') && isMissingColumnError(err, 'expires_at')) {
      return await getListingCardsInternal(filters, { ignoreExpiryFilter: true });
    }
    throw err;
  }
}
