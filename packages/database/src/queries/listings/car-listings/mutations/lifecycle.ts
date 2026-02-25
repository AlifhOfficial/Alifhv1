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
import { updateVinHistoryOnSold, updateVinHistoryOnExtend } from './vin-history';

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
 * Uses optimistic locking via extensionCount to prevent race conditions
 * 
 * Also resets publishedAt and originalPublishedAt to give fresh ranking position
 * after completing a full listing lifecycle (24 days).
 */
export async function extendCarListingExpiry(input: {
  listingId: string;
  userId: string;
  partnerId?: string;
  days: 7 | 14;
}): Promise<{ success: true; expiresAt: Date } | { success: false; error: string }> {
  // Validate days at runtime
  if (input.days !== 7 && input.days !== 14) {
    return { success: false, error: 'Extension days must be 7 or 14' };
  }

  const now = new Date();

  const record = await db
    .select({
      id: carListing.id,
      userId: carListing.userId,
      partnerId: carListing.partnerId,
      vin: carListing.vin,
      lifecycleStatus: carListing.lifecycleStatus,
      expiresAt: carListing.expiresAt,
      extensionCount: carListing.extensionCount,
    })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);

  if (record.length === 0) return { success: false, error: 'Listing not found' };

  const listing = record[0];
  const currentExtensionCount = listing.extensionCount ?? 0;
  
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

  // Use optimistic locking: only update if extensionCount hasn't changed
  // This prevents double-extension race conditions
  const updated = await db
    .update(carListing)
    .set({
      expiresAt: newExpiresAt,
      // Reset publish timestamps for fresh ranking position after full 24-day cycle
      publishedAt: now,
      originalPublishedAt: now,
      extensionCount: sql<number>`${carListing.extensionCount} + 1`,
      extensionHistory: sql<any>`
        coalesce(${carListing.extensionHistory}, '[]'::jsonb) || ${JSON.stringify([extensionEvent])}::jsonb
      `,
      lastExtendedAt: now,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(
      and(
        eq(carListing.id, input.listingId),
        // Optimistic lock: only proceed if count matches what we read
        eq(carListing.extensionCount, currentExtensionCount)
      )
    )
    .returning({ expiresAt: carListing.expiresAt });

  if (updated.length === 0) {
    // Either listing was deleted or another request already extended it
    return { success: false, error: 'Extension failed - listing may have been modified' };
  }

  // Update VIN history to reset originalPublishedAt for fresh ranking
  if (listing.vin) {
    await updateVinHistoryOnExtend({
      vin: listing.vin,
      userId: listing.userId,
      listingId: input.listingId,
      extendedAt: now,
    });
  }

  return { success: true, expiresAt: updated[0].expiresAt };
}

/**
 * Mark a car listing as sold
 * Supports both direct ownership (userId) and partner ownership (partnerId)
 * If soldPrice is not provided, defaults to the listing's current price
 * Also updates VIN publication history for anti-abuse tracking.
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
      vin: carListing.vin,
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
  
  // Update VIN history to mark as sold
  // This allows the VIN to be reposted by a NEW owner without abuse concern
  if (listing.vin && listing.userId) {
    try {
      await updateVinHistoryOnSold({
        vin: listing.vin,
        userId: listing.userId,
        listingId: input.listingId,
        soldAt: now,
      });
    } catch (err) {
      // Log error but don't fail the sold operation
      console.error('[vin-history] Failed to update VIN history on sold:', err);
    }
  }
  
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
