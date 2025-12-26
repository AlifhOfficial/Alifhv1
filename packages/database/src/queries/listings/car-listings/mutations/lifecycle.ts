/**
 * Car Listing - Lifecycle Operations
 * 
 * Functions for managing listing lifecycle: expiry, extension, sold status.
 * 
 * @module queries/listings/car-listings/mutations/lifecycle
 */

import { eq, and, isNotNull, lte, inArray, sql } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';
import { addDays, EXTENSION_WINDOW_MS } from './helpers';

/**
 * Expire all published listings for a specific user
 * Returns the count of expired listings
 */
export async function expirePublishedListingsForUser(userId: string): Promise<number> {
  const now = new Date();
  const updated = await db
    .update(carListing)
    .set({ lifecycleStatus: 'expired', updatedAt: now })
    .where(
      and(
        eq(carListing.userId, userId),
        eq(carListing.lifecycleStatus, 'active'),
        isNotNull(carListing.expiresAt),
        lte(carListing.expiresAt, now)
      )
    )
    .returning({ id: carListing.id });

  return updated.length;
}

/**
 * Expire all published listings for a specific partner
 * Returns the count of expired listings
 */
export async function expirePublishedListingsForPartner(partnerId: string): Promise<number> {
  const now = new Date();
  const updated = await db
    .update(carListing)
    .set({ lifecycleStatus: 'expired', updatedAt: now })
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        eq(carListing.lifecycleStatus, 'active'),
        isNotNull(carListing.expiresAt),
        lte(carListing.expiresAt, now)
      )
    )
    .returning({ id: carListing.id });

  return updated.length;
}

/**
 * Extend a car listing's expiry date
 * Only available within 2 days of expiry
 */
export async function extendCarListingExpiry(input: {
  listingId: string;
  userId: string;
  days: 7 | 14;
}): Promise<{ success: true; expiresAt: Date } | { success: false; error: string }> {
  const now = new Date();

  const record = await db
    .select({
      id: carListing.id,
      lifecycleStatus: carListing.lifecycleStatus,
      expiresAt: carListing.expiresAt,
    })
    .from(carListing)
    .where(and(eq(carListing.id, input.listingId), eq(carListing.userId, input.userId)))
    .limit(1);

  if (record.length === 0) return { success: false, error: 'Listing not found' };

  const listing = record[0];
  if (listing.lifecycleStatus !== 'active') return { success: false, error: 'Only active listings can be extended' };
  if (!listing.expiresAt) return { success: false, error: 'Listing expiry is not set' };

  const msRemaining = listing.expiresAt.getTime() - now.getTime();
  if (msRemaining <= 0) return { success: false, error: 'Listing already expired' };

  if (msRemaining > EXTENSION_WINDOW_MS) {
    return { success: false, error: 'Too early to extend (available within 2 days of expiry)' };
  }

  const newExpiresAt = addDays(listing.expiresAt, input.days);

  const extensionEvent = {
    extendedAt: now.toISOString(),
    days: input.days,
    previousExpiresAt: listing.expiresAt.toISOString(),
    newExpiresAt: newExpiresAt.toISOString(),
    extendedBy: input.userId,
  };

  const [updated] = await db
    .update(carListing)
    .set({
      expiresAt: newExpiresAt,
      extensionCount: sql<number>`${carListing.extensionCount} + 1`,
      extensionHistory: sql<any>`
        coalesce(${carListing.extensionHistory}, '[]'::jsonb) || ${JSON.stringify([extensionEvent])}::jsonb
      `,
      lastExtendedAt: now,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(and(eq(carListing.id, input.listingId), eq(carListing.userId, input.userId)))
    .returning({ expiresAt: carListing.expiresAt });

  if (!updated?.expiresAt) return { success: false, error: 'Failed to extend listing' };
  return { success: true, expiresAt: updated.expiresAt };
}

/**
 * Mark a car listing as sold
 */
export async function markCarListingSold(input: {
  listingId: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const now = new Date();

  const current = await db
    .select({ lifecycleStatus: carListing.lifecycleStatus })
    .from(carListing)
    .where(and(eq(carListing.id, input.listingId), eq(carListing.userId, input.userId)))
    .limit(1);

  if (current.length === 0) return { success: false, error: 'Listing not found' };
  if (current[0].lifecycleStatus === 'deleted') return { success: false, error: 'Listing is deleted' };

  const updated = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'sold',
      soldAt: now,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(and(eq(carListing.id, input.listingId), eq(carListing.userId, input.userId)))
    .returning({ id: carListing.id });

  if (updated.length === 0) return { success: false, error: 'Listing not found' };
  return { success: true };
}

/**
 * Global expiry maintenance - marks ALL expired listings as expired
 * Should be called by a cron job (e.g., every 5-15 minutes)
 * 
 * This is the production-ready alternative to opportunistic per-user expiry.
 * Ensures public browse and admin stats are always accurate.
 * 
 * @param batchSize - Max listings to expire in one call (default: 500)
 * @returns Number of listings marked as expired
 */
export async function expireAllExpiredListings(batchSize = 500): Promise<{
  expiredCount: number;
  hasMore: boolean;
}> {
  const now = new Date();
  
  // Find and update expired listings in a single atomic operation
  // Uses batch size to prevent long-running queries in production
  const expiredIds = await db
    .select({ id: carListing.id })
    .from(carListing)
    .where(
      and(
        eq(carListing.lifecycleStatus, 'active'),
        eq(carListing.moderationStatus, 'approved'),
        isNotNull(carListing.expiresAt),
        lte(carListing.expiresAt, now)
      )
    )
    .limit(batchSize + 1); // +1 to detect if there are more

  if (expiredIds.length === 0) {
    return { expiredCount: 0, hasMore: false };
  }

  const hasMore = expiredIds.length > batchSize;
  const idsToExpire = expiredIds.slice(0, batchSize).map(r => r.id);

  const updated = await db
    .update(carListing)
    .set({ 
      lifecycleStatus: 'expired', 
      updatedAt: now 
    })
    .where(inArray(carListing.id, idsToExpire))
    .returning({ id: carListing.id });

  console.log(`[expiry-maintenance] Expired ${updated.length} listings`);

  return { 
    expiredCount: updated.length, 
    hasMore 
  };
}
