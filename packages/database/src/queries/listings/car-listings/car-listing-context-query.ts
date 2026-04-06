/**
 * Car Listing Context Queries
 *
 * Small, purpose-built reads to support API authorization and flow decisions
 * without importing the raw `db` client in API routes.
 *
 * @module queries/listings/car-listings/car-listing-context-query
 */

import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';

export interface ListingModerationContext {
  id: string;
  userId: string;
  partnerId: string | null;
  postedByRole: 'user' | 'staff';
  moderationStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected';
  lifecycleStatus: 'active' | 'archived' | 'sold' | 'expired' | 'deleted';
  publishedAt: Date | null;
  expiresAt: Date | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  // For re-moderation comparison
  description: string | null;
  price: number | null;
}

export async function getListingModerationContext(
  listingId: string
): Promise<ListingModerationContext | null> {
  const result = await db
    .select({
      id: carListing.id,
      userId: sql<string>`${carListing.userId}`,
      partnerId: carListing.partnerId,
      postedByRole: carListing.postedByRole,
      moderationStatus: carListing.moderationStatus,
      lifecycleStatus: carListing.lifecycleStatus,
      publishedAt: carListing.publishedAt,
      expiresAt: carListing.expiresAt,
      rejectionReason: carListing.rejectionReason,
      suspensionReason: sql<string | null>`
        coalesce(
          ${carListing.specialNotes} ->> 'suspensionReason',
          ${carListing.specialNotes} -> 'moderation' ->> 'reason'
        )
      `,
      // For re-moderation comparison
      description: carListing.description,
      price: carListing.price,
    })
    .from(carListing)
    .where(and(eq(carListing.id, listingId), isNotNull(carListing.userId)))
    .limit(1);

  const row = result[0];
  if (!row || !row.userId) {
    return null;
  }

  return {
    ...row,
    userId: row.userId,
  };
}
/**
 * Get listing images for cleanup (before hard delete)
 * Returns array of image URLs/keys to be deleted from storage
 */
export async function getListingImagesForCleanup(
  listingId: string
): Promise<string[]> {
  const result = await db
    .select({
      images: carListing.images,
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  if (!result[0]) return [];
  
  // Images are stored as string[] in JSONB
  const images = result[0].images;
  if (!Array.isArray(images)) return [];
  
  return images.filter((img): img is string => typeof img === 'string' && img.length > 0);
}