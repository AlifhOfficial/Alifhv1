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
 * Supports both direct ownership (userId) and partner ownership (partnerId)
 * Only available within 2 days of expiry
 */
export async function extendCarListingExpiry(input: {
  listingId: string;
  userId: string;
  partnerId?: string;
  days: 7 | 14;
}): Promise<{ success: true; expiresAt: Date } | { success: false; error: string }> {
  const now = new Date();

  const record = await db
    .select({
      id: carListing.id,
      userId: carListing.userId,
      partnerId: carListing.partnerId,
      lifecycleStatus: carListing.lifecycleStatus,
      expiresAt: carListing.expiresAt,
    })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (record.length === 0) return { success: false, error: 'Listing not found' };

  const listing = record[0];
  
  // Verify ownership
  const isDirectOwner = listing.userId === input.userId;
  const isPartnerOwner = input.partnerId && listing.partnerId === input.partnerId;
  
  if (!isDirectOwner && !isPartnerOwner) {
    return { success: false, error: 'Not authorized to extend this listing' };
  }
  
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
    .where(eq(carListing.id, input.listingId))
    .returning({ expiresAt: carListing.expiresAt });

  if (!updated?.expiresAt) return { success: false, error: 'Failed to extend listing' };
  return { success: true, expiresAt: updated.expiresAt };
}

/**
 * Mark a car listing as sold
 * Supports both direct ownership (userId) and partner ownership (partnerId)
 * If soldPrice is not provided, defaults to the listing's current price
 */
export async function markCarListingSold(input: {
  listingId: string;
  userId: string;
  partnerId?: string; // Optional: for partner staff marking listings as sold
  soldPrice?: number; // Optional: defaults to listing price if not provided
}): Promise<{ success: true; soldPrice: number } | { success: false; error: string }> {
  const now = new Date();

  const current = await db
    .select({ 
      lifecycleStatus: carListing.lifecycleStatus,
      partnerId: carListing.partnerId,
      userId: carListing.userId,
      price: carListing.price,
    })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (current.length === 0) return { success: false, error: 'Listing not found' };
  
  const listing = current[0];
  
  // Verify ownership
  const isDirectOwner = listing.userId === input.userId;
  const isPartnerOwner = input.partnerId && listing.partnerId === input.partnerId;
  
  if (!isDirectOwner && !isPartnerOwner) {
    return { success: false, error: 'Not authorized to update this listing' };
  }
  
  if (listing.lifecycleStatus === 'deleted') return { success: false, error: 'Listing is deleted' };

  // Use provided soldPrice or default to listing price
  const finalSoldPrice = input.soldPrice ?? listing.price;

  const updated = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'sold',
      soldAt: now,
      soldPrice: finalSoldPrice,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(eq(carListing.id, input.listingId))
    .returning({ id: carListing.id });

  if (updated.length === 0) return { success: false, error: 'Failed to update listing' };
  return { success: true, soldPrice: finalSoldPrice };
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
