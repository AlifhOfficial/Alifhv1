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

  // Simplified: Always fetch ALL user favorites/superlikes (typically <50 items)
  // With unique indexes on (userId, listingId), queries are fast
  const queryStart = performance.now();
  const [favorites, superlikes] = await Promise.all([
    db.select({ listingId: userFavorite.listingId })
      .from(userFavorite)
      .where(eq(userFavorite.userId, userId)),
    
    db.select({ listingId: userSuperlike.listingId })
      .from(userSuperlike)
      .where(eq(userSuperlike.userId, userId)),
  ]);
  const queryTime = performance.now() - queryStart;
  
  console.log(`[getFavoriteStatusForListings] Query: ${queryTime.toFixed(0)}ms, favs: ${favorites.length}, superlikes: ${superlikes.length}`);

  // Return simple arrays - client builds hash map instantly
  return {
    favorites: favorites.map(f => f.listingId),
    superlikes: superlikes.map(s => s.listingId),
  };
}

// Removed: getAllFavoritesForUser - use getFavoriteStatusForListings instead

export async function toggleFavoriteForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  // Optimized: Try to delete first, if nothing deleted then insert
  // This reduces from 3 round trips to 2 round trips (or 1 if we guess right)
  
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
