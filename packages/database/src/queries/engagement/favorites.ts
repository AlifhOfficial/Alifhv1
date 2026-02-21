/**
 * Favorites & Superlikes Queries - Production
 * 
 * User favorite and superlike management with quota tracking.
 * 
 * QUERY FUNCTIONS:
 * - getFavoriteStatusForListings() - IDs only (fast, for listing pages with heart icons)
 * - getFavoritesWithListings()     - IDs + listing data (single JOIN query, for favorites/superlikes pages)
 * - getSuperlikeQuotaForUser()     - Get/create user quota with auto-reset
 * 
 * MUTATION FUNCTIONS:
 * - toggleFavoriteForUser() - Add/remove favorite (optimistic delete-first)
 * - toggleSuperlikeForUser() - Add/remove superlike (quota-enforced)
 * 
 * ARCHITECTURE:
 * - getFavoriteStatusForListings: Simple UNION query, no JOINs (fast for IDs only)
 * - getFavoritesWithListings: CTE with JOIN to car_listing (single query for IDs + data)
 * 
 * CACHE INVALIDATION:
 * Client-side: React Query invalidation handled by hooks (use-favorites-unified.ts)
 * 
 * @module queries/favorites
 */

import { createId } from '@paralleldrive/cuid2';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { userFavorite, userSuperlike, userSuperlikeQuota } from '../../schema/profile';
import { carListing } from '../../schema/listing';

const FAV_ID_PREFIX = 'fav_';
const SUPERLIKE_ID_PREFIX = 'superlike_';
const SUPERLIKE_PERIOD_DAYS = 30;
const SUPERLIKE_MAX_PER_PERIOD = 5;
const SUPERLIKE_PREMIUM_BONUS = 0;

const makeFavoriteId = () => `${FAV_ID_PREFIX}${createId()}`;
const makeSuperlikeId = () => `${SUPERLIKE_ID_PREFIX}${createId()}`;

export type FavoriteRecord = typeof userFavorite.$inferSelect;
export type SuperlikeRecord = typeof userSuperlike.$inferSelect;
export type SuperlikeQuotaRecord = typeof userSuperlikeQuota.$inferSelect;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

async function ensureSuperlikeQuota(userId: string) {
  const now = new Date();
  const existing = await db
    .select()
    .from(userSuperlikeQuota)
    .where(eq(userSuperlikeQuota.userId, userId))
    .limit(1);

  const current = existing[0];

  const canonicalQuota = {
    maxSuperlikesPerMonth: SUPERLIKE_MAX_PER_PERIOD,
    premiumSuperlikesBonus: SUPERLIKE_PREMIUM_BONUS,
  } as const;

  if (!current) {
    const start = now;
    const end = addDays(now, SUPERLIKE_PERIOD_DAYS);
    const newId = `superlike_quota_${createId()}`;
    await db.insert(userSuperlikeQuota).values({
      id: newId,
      userId,
      currentMonthSuperlikesUsed: 0,
      maxSuperlikesPerMonth: canonicalQuota.maxSuperlikesPerMonth,
      premiumSuperlikesBonus: canonicalQuota.premiumSuperlikesBonus,
      periodStartDate: start,
      periodEndDate: end,
      lastResetAt: now,
      totalSuperlikesUsed: 0,
      isPremium: false,
    });

    return {
      id: newId,
      userId,
      currentMonthSuperlikesUsed: 0,
      maxSuperlikesPerMonth: canonicalQuota.maxSuperlikesPerMonth,
      premiumSuperlikesBonus: canonicalQuota.premiumSuperlikesBonus,
      periodStartDate: start,
      periodEndDate: end,
      lastResetAt: now,
      totalSuperlikesUsed: 0,
      isPremium: false,
      createdAt: now,
      updatedAt: now,
    } as SuperlikeQuotaRecord;
  }

  // Reset if period expired
  if (current.periodEndDate && new Date(current.periodEndDate) <= now) {
    const start = now;
    const end = addDays(now, SUPERLIKE_PERIOD_DAYS);
    await db
      .update(userSuperlikeQuota)
      .set({
        currentMonthSuperlikesUsed: 0,
        periodStartDate: start,
        periodEndDate: end,
        lastResetAt: now,
      })
      .where(eq(userSuperlikeQuota.userId, userId));

    return { ...current, currentMonthSuperlikesUsed: 0, periodStartDate: start, periodEndDate: end, lastResetAt: now };
  }

  // Normalize legacy rows that had higher defaults (e.g., 50) or bonuses
  if (
    current.maxSuperlikesPerMonth !== canonicalQuota.maxSuperlikesPerMonth ||
    (current.premiumSuperlikesBonus || 0) !== canonicalQuota.premiumSuperlikesBonus
  ) {
    await db
      .update(userSuperlikeQuota)
      .set({
        maxSuperlikesPerMonth: canonicalQuota.maxSuperlikesPerMonth,
        premiumSuperlikesBonus: canonicalQuota.premiumSuperlikesBonus,
      })
      .where(eq(userSuperlikeQuota.userId, userId));

    return {
      ...current,
      maxSuperlikesPerMonth: canonicalQuota.maxSuperlikesPerMonth,
      premiumSuperlikesBonus: canonicalQuota.premiumSuperlikesBonus,
    };
  }

  return current;
}

export async function getSuperlikeQuotaForUser(userId: string) {
  return ensureSuperlikeQuota(userId);
}

export async function getFavoriteStatusForListings(userId: string) {
  if (!userId) return { favorites: [], superlikes: [] };

  // ⚡ OPTIMIZED: Use raw SQL for maximum performance (bypasses ORM overhead)
  // NOTE: No server-side cache - React Query handles client-side caching efficiently
  // Order by created_at DESC so newest favorites come first
  const results = await db.execute(sql`
    SELECT listing_id, 'fav' as type, created_at FROM user_favorite WHERE user_id = ${userId}
    UNION ALL
    SELECT listing_id, 'super' as type, created_at FROM user_superlike WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `);
  
  // Split results by type (already ordered by created_at DESC)
  // postgres-js returns rows directly (no .rows)
  const favorites: string[] = [];
  const superlikes: string[] = [];
  const rows = Array.isArray(results) ? results : [];
  
  for (const row of rows as Array<{ listing_id: string; type: string }>) {
    if (row.type === 'fav') {
      favorites.push(row.listing_id);
    } else {
      superlikes.push(row.listing_id);
    }
  }
  
  return { favorites, superlikes };
}

/**
 * Listing card data returned from getFavoritesWithListings
 * Matches CarCardData fields for UI compatibility
 */
export interface FavoriteListingData {
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
  partnerName: string | null;
  partnerLogo: string | null;
  partnerVerified: boolean | null;
  sellerName: string | null;
  sellerAvatarUrl: string | null;
  sellerKycVerified: boolean | null;
}

/**
 * Get user's favorites/superlikes WITH listing data in a single query
 * 
 * ⚡ OPTIMIZED: Single round-trip instead of:
 *    1. getFavoriteStatusForListings → [ids]
 *    2. getListingCards({ ids }) → [listings]
 * 
 * @param userId - User ID
 * @param options.limit - Max favorites to return listing data for (default: 50)
 * @returns favorites IDs, superlike IDs, and listing data for favorites
 */
export async function getFavoritesWithListings(
  userId: string,
  options?: { limit?: number }
): Promise<{
  favorites: string[];
  superlikes: string[];
  listings: FavoriteListingData[];
}> {
  if (!userId) return { favorites: [], superlikes: [], listings: [] };

  const limit = options?.limit ?? 50;

  // Single query: get favorites/superlikes IDs + listing data for favorites
  // Uses LEFT JOIN so we get IDs even if listing was deleted
  const results = await db.execute(sql`
    WITH user_engagements AS (
      SELECT listing_id, 'fav' as type, created_at FROM user_favorite WHERE user_id = ${userId}
      UNION ALL
      SELECT listing_id, 'super' as type, created_at FROM user_superlike WHERE user_id = ${userId}
    ),
    favorite_listings AS (
      SELECT 
        l.id,
        l.make,
        l.model,
        l.year,
        l.trim,
        l.price,
        l.mileage,
        l.emirate,
        l.specs,
        l.thumbnail,
        l.qi_score as "qiScore",
        l.is_black_member as "isBlkListing",
        COALESCE(p.brand_name, l.partner_brand_name) as "partnerName",
        p.logo as "partnerLogo",
        COALESCE(p.is_verified, l.partner_verified) as "partnerVerified",
        u.name as "sellerName",
        up.avatar as "sellerAvatarUrl",
        up.kyc_verified as "sellerKycVerified",
        ue.created_at as fav_created_at
      FROM user_engagements ue
      JOIN car_listing l ON l.id = ue.listing_id
      LEFT JOIN "user" u ON u.id = l.user_id
      LEFT JOIN user_profile up ON up.user_id = l.user_id
      LEFT JOIN partner p ON p.id = l.partner_id
      WHERE ue.type = 'fav'
        AND l.moderation_status = 'approved'
        AND l.lifecycle_status = 'active'
        AND (l.expires_at IS NULL OR l.expires_at > NOW())
      ORDER BY ue.created_at DESC
      LIMIT ${limit}
    )
    SELECT 
      (SELECT json_agg(listing_id ORDER BY created_at DESC) FROM user_engagements WHERE type = 'fav') as favorites,
      (SELECT json_agg(listing_id ORDER BY created_at DESC) FROM user_engagements WHERE type = 'super') as superlikes,
      (SELECT json_agg(
        json_build_object(
          'id', id,
          'make', make,
          'model', model,
          'year', year,
          'trim', trim,
          'price', price,
          'mileage', mileage,
          'emirate', emirate,
          'specs', specs,
          'thumbnail', thumbnail,
          'qiScore', "qiScore",
          'isBlkListing', "isBlkListing",
          'partnerName', "partnerName",
          'partnerLogo', "partnerLogo",
          'partnerVerified', "partnerVerified",
          'sellerName', "sellerName",
          'sellerAvatarUrl', "sellerAvatarUrl",
          'sellerKycVerified', "sellerKycVerified"
        ) ORDER BY fav_created_at DESC
      ) FROM favorite_listings) as listings
  `);

  // postgres-js returns rows directly (no .rows)
  const rows = Array.isArray(results) ? results : [];
  const row = rows[0] as {
    favorites: string[] | null;
    superlikes: string[] | null;
    listings: FavoriteListingData[] | null;
  } | undefined;

  return {
    favorites: row?.favorites ?? [],
    superlikes: row?.superlikes ?? [],
    listings: row?.listings ?? [],
  };
}

// Removed: getAllFavoritesForUser - use getFavoriteStatusForListings instead

export async function toggleFavoriteForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  // ⚡ OPTIMIZED: Try delete + check superlike in parallel (saves ~50-100ms)
  const [deleted, existingSuperlike] = await Promise.all([
    db.delete(userFavorite)
      .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
      .returning({ id: userFavorite.id }),
    db.select({ id: userSuperlike.id })
      .from(userSuperlike)
      .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
      .limit(1),
  ]);

  const isSuperliked = existingSuperlike.length > 0;

  if (deleted.length > 0) {
    // Favorite was removed - decrement counter atomically
    await db.update(carListing)
      .set({ favouriteCount: sql`GREATEST(0, ${carListing.favouriteCount} - 1)` })
      .where(eq(carListing.id, listingId));
    
    return { isFavorite: false, isSuperliked };
  }

  // No favorite existed, so insert new one and increment counter atomically
  await Promise.all([
    db.insert(userFavorite).values({
      id: makeFavoriteId(),
      userId,
      listingId,
      addedFrom,
    }),
    db.update(carListing)
      .set({ favouriteCount: sql`${carListing.favouriteCount} + 1` })
      .where(eq(carListing.id, listingId)),
  ]);

  return { isFavorite: true, isSuperliked };
}

export async function toggleSuperlikeForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  // ⚡ OPTIMIZED: Fetch quota + check favorite + try delete in parallel (saves ~100-150ms)
  const [quota, existingFavorite, deleted] = await Promise.all([
    ensureSuperlikeQuota(userId),
    db.select({ id: userFavorite.id })
      .from(userFavorite)
      .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
      .limit(1),
    db.delete(userSuperlike)
      .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
      .returning({ id: userSuperlike.id }),
  ]);
  
  const isFavorite = existingFavorite.length > 0;

  if (deleted.length > 0) {
    // Superlike was removed - decrement counter atomically
    await db.update(carListing)
      .set({ superlikeCount: sql`GREATEST(0, ${carListing.superlikeCount} - 1)` })
      .where(eq(carListing.id, listingId));
    
    // Note: We don't refund quota - once used, it stays consumed for the period
    return { isFavorite, isSuperliked: false, quota };
  }

  // Check quota before adding
  const allowed = (quota.maxSuperlikesPerMonth || 0) + (quota.premiumSuperlikesBonus || 0);
  const currentUsed = quota.currentMonthSuperlikesUsed || 0;
  const remaining = allowed - currentUsed;

  if (remaining <= 0) {
    throw new Error('Superlike limit reached');
  }

  // No superlike existed, so insert new one, update quota, and increment counter in parallel
  await Promise.all([
    db.insert(userSuperlike).values({
      id: makeSuperlikeId(),
      userId,
      listingId,
      addedFrom,
    }),
    db.update(userSuperlikeQuota)
      .set({
        currentMonthSuperlikesUsed: sql`${userSuperlikeQuota.currentMonthSuperlikesUsed} + 1`,
        totalSuperlikesUsed: sql`${userSuperlikeQuota.totalSuperlikesUsed} + 1`,
      })
      .where(eq(userSuperlikeQuota.userId, userId)),
    db.update(carListing)
      .set({ superlikeCount: sql`${carListing.superlikeCount} + 1` })
      .where(eq(carListing.id, listingId)),
  ]);

  // Return updated quota (calculated - no extra DB call needed)
  const updatedQuota = {
    ...quota,
    currentMonthSuperlikesUsed: currentUsed + 1,
    totalSuperlikesUsed: (quota.totalSuperlikesUsed || 0) + 1,
  };

  return { isFavorite, isSuperliked: true, quota: updatedQuota };
}

// Removed: getFavoriteAndSuperlikeCounts - use getFavoriteStatusForListings().length instead
