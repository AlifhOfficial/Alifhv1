import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../dbclient';
import { userFavorite, userSuperlike, userSuperlikeQuota } from '../schema/profile';
import { carListing } from '../schema/listing';

const FAV_ID_PREFIX = 'fav_';
const SUPERLIKE_ID_PREFIX = 'superlike_';
const SUPERLIKE_PERIOD_DAYS = 30;

const makeFavoriteId = () => `${FAV_ID_PREFIX}${createId()}`;
const makeSuperlikeId = () => `${SUPERLIKE_ID_PREFIX}${createId()}`;

type DbClient = typeof db;
type TxClient = Parameters<Parameters<DbClient['transaction']>[0]>[0];
type DbOrTx = DbClient | TxClient;

export type FavoriteRecord = typeof userFavorite.$inferSelect;
export type SuperlikeRecord = typeof userSuperlike.$inferSelect;
export type SuperlikeQuotaRecord = typeof userSuperlikeQuota.$inferSelect;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

async function ensureSuperlikeQuota(userId: string, tx: DbOrTx = db) {
  const now = new Date();
  const existing = await tx
    .select()
    .from(userSuperlikeQuota)
    .where(eq(userSuperlikeQuota.userId, userId))
    .limit(1);

  const current = existing[0];

  if (!current) {
    const start = now;
    const end = addDays(now, SUPERLIKE_PERIOD_DAYS);
    const newId = `superlike_quota_${createId()}`;
    await tx.insert(userSuperlikeQuota).values({
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
    await tx
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

export async function getFavoriteStatusForListings(
  userId: string,
  listingIds?: string[]
) {
  if (!userId) return {} as Record<string, { isFavorite: boolean; isSuperliked: boolean }>;

  // Optimized: Build where clauses once, use indexed columns
  const favoriteWhere = listingIds?.length
    ? and(eq(userFavorite.userId, userId), inArray(userFavorite.listingId, listingIds))
    : eq(userFavorite.userId, userId);
  
  const superlikeWhere = listingIds?.length
    ? and(eq(userSuperlike.userId, userId), inArray(userSuperlike.listingId, listingIds))
    : eq(userSuperlike.userId, userId);

  // Query both tables in parallel with minimal data transfer
  const [favorites, superlikes] = await Promise.all([
    db.select({ listingId: userFavorite.listingId })
      .from(userFavorite)
      .where(favoriteWhere),
    db.select({ listingId: userSuperlike.listingId })
      .from(userSuperlike)
      .where(superlikeWhere),
  ]);

  // Create sets for O(1) lookup
  const favoriteSet = new Set(favorites.map(f => f.listingId));
  const superlikeSet = new Set(superlikes.map(s => s.listingId));

  // Build result map combining both
  const allListingIds = new Set([...favoriteSet, ...superlikeSet]);
  const result: Record<string, { isFavorite: boolean; isSuperliked: boolean }> = {};
  
  allListingIds.forEach(listingId => {
    result[listingId] = {
      isFavorite: favoriteSet.has(listingId),
      isSuperliked: superlikeSet.has(listingId),
    };
  });

  return result;
}

export async function getAllFavoritesForUser(userId: string) {
  if (!userId) return { favorites: [] as FavoriteRecord[], superlikes: [] as SuperlikeRecord[] };

  // Optimized: Use indexed queries and only select needed fields
  const [favorites, superlikes] = await Promise.all([
    db.select({
      id: userFavorite.id,
      userId: userFavorite.userId,
      listingId: userFavorite.listingId,
      addedFrom: userFavorite.addedFrom,
      createdAt: userFavorite.createdAt,
    }).from(userFavorite).where(eq(userFavorite.userId, userId)),
    db.select({
      id: userSuperlike.id,
      userId: userSuperlike.userId,
      listingId: userSuperlike.listingId,
      addedFrom: userSuperlike.addedFrom,
      createdAt: userSuperlike.createdAt,
    }).from(userSuperlike).where(eq(userSuperlike.userId, userId)),
  ]);

  return { favorites, superlikes };
}

export async function toggleFavoriteForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  return db.transaction(async (tx) => {
    // Check if favorite exists
    const existing = await tx
      .select()
      .from(userFavorite)
      .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
      .limit(1);

    const record = existing[0];

    // Check if superlike exists (independent of favorite)
    const superlikeExists = await tx
      .select()
      .from(userSuperlike)
      .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
      .limit(1);

    const hasSuperlike = superlikeExists.length > 0;

    if (record) {
      // Remove favorite
      await tx.delete(userFavorite).where(eq(userFavorite.id, record.id));
      await tx
        .update(carListing)
        .set({ favouriteCount: sql`${carListing.favouriteCount} - 1` })
        .where(eq(carListing.id, listingId));

      return { isFavorite: false, isSuperliked: hasSuperlike };
    } else {
      // Add favorite
      await tx.insert(userFavorite).values({
        id: makeFavoriteId(),
        userId,
        listingId,
        addedFrom,
      });

      await tx
        .update(carListing)
        .set({ favouriteCount: sql`${carListing.favouriteCount} + 1` })
        .where(eq(carListing.id, listingId));

      return { isFavorite: true, isSuperliked: hasSuperlike };
    }
  });
}

export async function toggleSuperlikeForUser(
  userId: string,
  listingId: string,
  addedFrom?: string
) {
  return db.transaction(async (tx) => {
    const quota = await ensureSuperlikeQuota(userId, tx);
    const allowed = (quota.maxSuperlikesPerMonth || 0) + (quota.premiumSuperlikesBonus || 0);

    // Check if superlike exists
    const existing = await tx
      .select()
      .from(userSuperlike)
      .where(and(eq(userSuperlike.userId, userId), eq(userSuperlike.listingId, listingId)))
      .limit(1);

    const record = existing[0];

    // Check if favorite exists (independent of superlike)
    const favoriteExists = await tx
      .select()
      .from(userFavorite)
      .where(and(eq(userFavorite.userId, userId), eq(userFavorite.listingId, listingId)))
      .limit(1);

    const hasFavorite = favoriteExists.length > 0;

    if (record) {
      // Remove superlike (quota stays consumed - no refund)
      await tx.delete(userSuperlike).where(eq(userSuperlike.id, record.id));
      await tx
        .update(carListing)
        .set({ superlikeCount: sql`${carListing.superlikeCount} - 1` })
        .where(eq(carListing.id, listingId));

      // Note: We don't refund quota - once used, it stays consumed for the period
      const updatedQuota = await ensureSuperlikeQuota(userId, tx);
      return { isFavorite: hasFavorite, isSuperliked: false, quota: updatedQuota };
    }

    // Check quota before adding
    const currentUsed = quota.currentMonthSuperlikesUsed || 0;
    const remaining = allowed - currentUsed;

    if (remaining <= 0) {
      throw new Error('Superlike limit reached');
    }

    // Add new superlike
    await tx.insert(userSuperlike).values({
      id: makeSuperlikeId(),
      userId,
      listingId,
      addedFrom,
    });

    await tx
      .update(carListing)
      .set({ superlikeCount: sql`${carListing.superlikeCount} + 1` })
      .where(eq(carListing.id, listingId));

    await tx
      .update(userSuperlikeQuota)
      .set({
        currentMonthSuperlikesUsed: sql`${userSuperlikeQuota.currentMonthSuperlikesUsed} + 1`,
        totalSuperlikesUsed: sql`${userSuperlikeQuota.totalSuperlikesUsed} + 1`,
      })
      .where(eq(userSuperlikeQuota.userId, userId));

    const updatedQuota = await ensureSuperlikeQuota(userId, tx);
    return { isFavorite: hasFavorite, isSuperliked: true, quota: updatedQuota };
  });
}

export async function getFavoriteAndSuperlikeCounts(userId: string) {
  const [favorites, superlikes] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(userFavorite)
      .where(eq(userFavorite.userId, userId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userSuperlike)
      .where(eq(userSuperlike.userId, userId)),
  ]);

  return {
    favorites: Number(favorites?.[0]?.count ?? 0),
    superlikes: Number(superlikes?.[0]?.count ?? 0),
  };
}
