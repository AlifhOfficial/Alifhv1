/**
 * Car Listing - Delete Operations
 * 
 * Functions for soft and hard deletion of car listings.
 * 
 * @module queries/listings/car-listings/mutations/delete
 */

import { eq, and, lte, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { carListing } from '../../../../schema/listing';

/**
 * Soft delete a car listing (set lifecycleStatus to 'deleted')
 * Supports both direct ownership (userId) and partner ownership (partnerId)
 */
export async function deleteCarListing(
  listingId: string,
  userId: string,
  partnerId?: string
): Promise<boolean> {
  const now = new Date();
  
  // First verify ownership
  const listing = await db
    .select({ userId: carListing.userId, partnerId: carListing.partnerId })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);
  
  if (listing.length === 0) return false;
  
  const isDirectOwner = listing[0].userId === userId;
  const isPartnerOwner = partnerId && listing[0].partnerId === partnerId;
  
  if (!isDirectOwner && !isPartnerOwner) return false;
  
  const result = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'deleted',
      deletedAt: now,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(eq(carListing.id, listingId))
    .returning({ id: carListing.id });

  return result.length > 0;
}

/**
 * Hard delete a car listing by staff
 * Use with caution - permanent deletion
 */
export async function deleteCarListingByStaff(listingId: string): Promise<boolean> {
  const result = await db
    .delete(carListing)
    .where(eq(carListing.id, listingId))
    .returning({ id: carListing.id });

  return result.length > 0;
}

/**
 * Hard delete a single listing by owner
 * Supports both direct ownership (userId) and partner ownership (partnerId)
 * Use with caution - permanent deletion
 */
export async function hardDeleteCarListing(input: {
  listingId: string;
  userId: string;
  partnerId?: string;
}): Promise<boolean> {
  // First verify ownership
  const listing = await db
    .select({ userId: carListing.userId, partnerId: carListing.partnerId })
    .from(carListing)
    .where(eq(carListing.id, input.listingId))
    .limit(1);
  
  if (listing.length === 0) return false;
  
  const isDirectOwner = listing[0].userId === input.userId;
  const isPartnerOwner = input.partnerId && listing[0].partnerId === input.partnerId;
  
  if (!isDirectOwner && !isPartnerOwner) return false;
  
  const deleted = await db
    .delete(carListing)
    .where(eq(carListing.id, input.listingId))
    .returning({ id: carListing.id });

  return deleted.length > 0;
}

/**
 * Hard delete all soft-deleted listings for a user
 * Optionally filter by age and listing type
 */
export async function hardDeleteDeletedCarListingsForUser(input: {
  userId: string;
  olderThanDays?: number;
  listingType?: 'personal' | 'work';
}): Promise<number> {
  const now = new Date();
  const olderThanDays = input.olderThanDays ?? 0;
  const cutoff =
    olderThanDays > 0 ? new Date(now.getTime() - olderThanDays * 24 * 60 * 60 * 1000) : null;

  const whereConditions = [
    eq(carListing.userId, input.userId),
    eq(carListing.lifecycleStatus, 'deleted'),
    isNotNull(carListing.deletedAt),
  ];

  if (input.listingType === 'personal') whereConditions.push(isNull(carListing.partnerId));
  if (input.listingType === 'work') whereConditions.push(isNotNull(carListing.partnerId));
  if (cutoff) whereConditions.push(lte(carListing.deletedAt, cutoff));

  const deleted = await db
    .delete(carListing)
    .where(and(...whereConditions))
    .returning({ id: carListing.id });

  return deleted.length;
}

/**
 * Check if user owns a listing (direct ownership only)
 * For partner listings, use checkListingAccess instead
 */
export async function checkListingOwnership(
  listingId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .select({ id: carListing.id })
    .from(carListing)
    .where(
      and(
        eq(carListing.id, listingId),
        eq(carListing.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Check if user or partner has access to a listing
 * Returns true if:
 * - User directly owns the listing (userId match)
 * - Listing belongs to the specified partner (partnerId match)
 */
export async function checkListingAccess(
  listingId: string,
  userId: string,
  partnerId?: string
): Promise<{ hasAccess: boolean; isDirectOwner: boolean; isPartnerListing: boolean }> {
  const result = await db
    .select({ 
      userId: carListing.userId,
      partnerId: carListing.partnerId 
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  if (result.length === 0) {
    return { hasAccess: false, isDirectOwner: false, isPartnerListing: false };
  }
  
  const listing = result[0];
  const isDirectOwner = listing.userId === userId;
  const isPartnerListing = listing.partnerId !== null;
  const isPartnerMatch = partnerId && listing.partnerId === partnerId;
  
  return {
    hasAccess: isDirectOwner || !!isPartnerMatch,
    isDirectOwner,
    isPartnerListing,
  };
}
