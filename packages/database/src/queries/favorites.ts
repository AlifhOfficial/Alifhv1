/**
 * Favorites & Superlikes Queries - Production
 * 
 * User favorite and superlike management with quota tracking.
 * Optimized queries with memory caching for performance.
 * 
 * @module queries/favorites
 */

import { createId } from '@paralleldrive/cuid2';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../dbclient';
import { userFavorite, userSuperlike, userSuperlikeQuota } from '../schema/profile';

const FAV_ID_PREFIX = 'fav_';
const SUPERLIKE_ID_PREFIX = 'superlike_';
const SUPERLIKE_PERIOD_DAYS = 30;

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

  if (!current) {
    const start = now;
    const end = addDays(now, SUPERLIKE_PERIOD_DAYS);
    const newId = `superlike_quota_${createId()}`;
    await db.insert(userSuperlikeQuota).values({
      id: newId,
      userId,
      currentMonthSuperlikesUsed: 0,
      maxSuperlikesPerMonth: 5,
      premiumSuperlikesBonus: 0,
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
      maxSuperlikesPerMonth: 5,
      premiumSuperlikesBonus: 0,
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

  return current;
}

export async function getSuperlikeQuotaForUser(userId: string) {
  return ensureSuperlikeQuota(userId);
}

export async function getFavoriteStatusForListings(userId: string) {
  if (!userId) return { favorites: [], superlikes: [] };

  // ⚡ MEMORY CACHE: Check cache first (30s TTL)
  // IMPORTANT: Only cache for authenticated users with valid session
  const { memoryCache, CacheKeys, CacheTTL } = await import('../memory-cache');
  const cacheKey = CacheKeys.userFavorites(userId);
  const cached = memoryCache.get<{ favorites: string[]; superlikes: string[] }>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // ⚡ OPTIMIZED: Use raw SQL for maximum performance (bypasses ORM overhead)
  const queryStart = performance.now();
  
  // Single query using UNION ALL - faster than 2 parallel queries
  const results = await db.execute(sql`
    SELECT listing_id, 'fav' as type FROM user_favorite WHERE user_id = ${userId}
    UNION ALL
    SELECT listing_id, 'super' as type FROM user_superlike WHERE user_id = ${userId}
  `);
  
  const queryTime = performance.now() - queryStart;
  
  // Split results by type
  const favorites: string[] = [];
  const superlikes: string[] = [];
  
  for (const row of results.rows as Array<{ listing_id: string; type: string }>) {
    if (row.type === 'fav') {
      favorites.push(row.listing_id);
    } else {
      superlikes.push(row.listing_id);
    }
  }
  
  const result = { favorites, superlikes };
  
  // Store in cache
  memoryCache.set(cacheKey, result, CacheTTL.userFavorites);

  return result;
}

// Removed: getAllFavoritesForUser - use getFavoriteStatusForListings instead

export async function toggleFavoriteForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  // Optimized: Try to delete first, if nothing deleted then insert
  // This reduces from 3 round trips to 2 round trips (or 1 if we guess right)
  
  // Invalidate cache
  const { memoryCache, CacheKeys } = await import('../memory-cache');
  memoryCache.delete(CacheKeys.userFavorites(userId));
  
  // Try to delete existing favorite
  const deleted = await db
    .delete(userFavorite)
    .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
    .returning({ id: userFavorite.id });

  if (deleted.length > 0) {
    // Favorite was removed - check superlike status
    const superlike = await db
      .select({ id: userSuperlike.id })
      .from(userSuperlike)
      .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
      .limit(1);
    
    return { isFavorite: false, isSuperliked: superlike.length > 0 };
  }

  // No favorite existed, so insert new one
  await db.insert(userFavorite).values({
    id: makeFavoriteId(),
    userId,
    listingId,
    addedFrom,
  });

  // Check superlike status
  const superlike = await db
    .select({ id: userSuperlike.id })
    .from(userSuperlike)
    .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
    .limit(1);

  return { isFavorite: true, isSuperliked: superlike.length > 0 };
}

export async function toggleSuperlikeForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  // Get quota first (required for validation)
  const quota = await ensureSuperlikeQuota(userId);
  const allowed = (quota.maxSuperlikesPerMonth || 0) + (quota.premiumSuperlikesBonus || 0);
  
  // Invalidate cache
  const { memoryCache, CacheKeys } = await import('../memory-cache');
  memoryCache.delete(CacheKeys.userFavorites(userId));
  
  // Try to delete existing superlike
  const deleted = await db
    .delete(userSuperlike)
    .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
    .returning({ id: userSuperlike.id });

  if (deleted.length > 0) {
    // Superlike was removed - check favorite status
    const favorite = await db
      .select({ id: userFavorite.id })
      .from(userFavorite)
      .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
      .limit(1);
    
    // Note: We don't refund quota - once used, it stays consumed for the period
    return { isFavorite: favorite.length > 0, isSuperliked: false, quota };
  }

  // Check quota before adding
  const currentUsed = quota.currentMonthSuperlikesUsed || 0;
  const remaining = allowed - currentUsed;

  if (remaining <= 0) {
    throw new Error('Superlike limit reached');
  }

  // No superlike existed, so insert new one and update quota in parallel
  await Promise.all([
    db.insert(userSuperlike).values({
      id: makeSuperlikeId(),
      userId,
      listingId,
      addedFrom,
    }),
    db
      .update(userSuperlikeQuota)
      .set({
        currentMonthSuperlikesUsed: sql`${userSuperlikeQuota.currentMonthSuperlikesUsed} + 1`,
        totalSuperlikesUsed: sql`${userSuperlikeQuota.totalSuperlikesUsed} + 1`,
      })
      .where(eq(userSuperlikeQuota.userId, userId))
  ]);

  // Check favorite status
  const favorite = await db
    .select({ id: userFavorite.id })
    .from(userFavorite)
    .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
    .limit(1);

  // Return updated quota (calculated)
  const updatedQuota = {
    ...quota,
    currentMonthSuperlikesUsed: currentUsed + 1,
    totalSuperlikesUsed: (quota.totalSuperlikesUsed || 0) + 1,
  };

  return { isFavorite: favorite.length > 0, isSuperliked: true, quota: updatedQuota };
}

// Removed: getFavoriteAndSuperlikeCounts - use getFavoriteStatusForListings().length instead
