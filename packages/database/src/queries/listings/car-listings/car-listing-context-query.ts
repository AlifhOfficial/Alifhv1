/**
 * Car Listing Context Queries
 *
 * Small, purpose-built reads to support API authorization and flow decisions
 * without importing the raw `db` client in API routes.
 *
 * @module queries/listings/car-listings/car-listing-context-query
 */

import { eq, sql } from 'drizzle-orm';
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
}

export async function getListingModerationContext(
  listingId: string
): Promise<ListingModerationContext | null> {
  const result = await db
    .select({
      id: carListing.id,
      userId: carListing.userId,
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
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  return result[0] ?? null;
}
