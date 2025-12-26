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
 * Only allows deletion by the listing owner
 */
export async function deleteCarListing(
  listingId: string,
  userId: string
): Promise<boolean> {
  const now = new Date();
  const result = await db
    .update(carListing)
    .set({
      lifecycleStatus: 'deleted',
      deletedAt: now,
      updatedAt: now,
      lastEditedAt: now,
    })
    .where(
      and(
        eq(carListing.id, listingId),
        eq(carListing.userId, userId)
      )
    )
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
 * Use with caution - permanent deletion
 */
export async function hardDeleteCarListing(input: {
  listingId: string;
  userId: string;
}): Promise<boolean> {
  const deleted = await db
    .delete(carListing)
    .where(and(eq(carListing.id, input.listingId), eq(carListing.userId, input.userId)))
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
 * Check if user owns a listing
 * Useful for permission checks
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
