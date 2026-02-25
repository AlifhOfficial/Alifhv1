/**
 * VIN Publication History - Anti-abuse Protection
 * 
 * Tracks VIN publication history to prevent delete-and-repost abuse.
 * Users cannot "bump" their listing to the top by deleting and reposting
 * the same car.
 * 
 * Key behaviors:
 * - Same VIN + same user within 24 days: Inherit originalPublishedAt from history
 * - Same VIN + same user after 24 days: Fresh timestamp (cooldown expired)
 * - Same VIN + different user: Fresh timestamp (ownership transfer)
 * - Different VIN: Fresh timestamp (genuinely new car)
 * 
 * @module queries/listings/car-listings/mutations/vin-history
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../../dbclient';
import { vinPublicationHistory } from '../../../../schema/listing';

const VIN_HISTORY_ID_PREFIX = 'vinh_';

/**
 * Cooldown period in days before a VIN gets a fresh originalPublishedAt.
 * Matches the listing expiry duration - if a user lets their listing expire
 * and reposts after this period, they get a fresh timestamp.
 */
export const VIN_REPOST_COOLDOWN_DAYS = 24;

/**
 * Generate a unique ID for VIN history records
 */
export const makeVinHistoryId = () => `${VIN_HISTORY_ID_PREFIX}${createId()}`;

/**
 * Result of looking up VIN publication history
 */
export interface VinHistoryLookupResult {
  /** Whether this VIN was previously published by this user */
  hasPreviousHistory: boolean;
  /** The original publish date to use (from history or null for fresh) */
  originalPublishedAt: Date | null;
  /** How many times this VIN has been reposted by this user */
  repostCount: number;
  /** The history record ID if it exists */
  historyId: string | null;
}

/**
 * Look up VIN publication history for a user
 * 
 * This is called when creating a new listing to check if the user
 * has previously published a listing with the same VIN.
 * 
 * @param vin - The VIN to look up (should be uppercase/trimmed)
 * @param userId - The user ID creating the listing
 * @returns VinHistoryLookupResult with previous publish date if found
 */
export async function lookupVinHistory(
  vin: string,
  userId: string
): Promise<VinHistoryLookupResult> {
  if (!vin) {
    return {
      hasPreviousHistory: false,
      originalPublishedAt: null,
      repostCount: 0,
      historyId: null,
    };
  }

  const normalizedVin = vin.toUpperCase().trim();

  const history = await db
    .select({
      id: vinPublicationHistory.id,
      originalPublishedAt: vinPublicationHistory.originalPublishedAt,
      repostCount: vinPublicationHistory.repostCount,
    })
    .from(vinPublicationHistory)
    .where(
      and(
        eq(vinPublicationHistory.vin, normalizedVin),
        eq(vinPublicationHistory.userId, userId)
      )
    )
    .limit(1);

  if (history.length === 0) {
    return {
      hasPreviousHistory: false,
      originalPublishedAt: null,
      repostCount: 0,
      historyId: null,
    };
  }

  return {
    hasPreviousHistory: true,
    originalPublishedAt: history[0].originalPublishedAt,
    repostCount: history[0].repostCount,
    historyId: history[0].id,
  };
}

/**
 * Record or update VIN publication history when a listing is published
 * 
 * If the previous originalPublishedAt is older than VIN_REPOST_COOLDOWN_DAYS,
 * the user gets a fresh timestamp (cooldown expired, fair to refresh).
 * 
 * @param vin - The VIN being published (should be uppercase/trimmed)
 * @param userId - The user ID publishing the listing
 * @param listingId - The listing ID being created
 * @param publishedAt - The publish timestamp
 * @returns The originalPublishedAt to use for this listing
 */
export async function recordVinPublication(input: {
  vin: string;
  userId: string;
  listingId: string;
  publishedAt: Date;
}): Promise<{ originalPublishedAt: Date; isRepost: boolean; cooldownReset: boolean }> {
  const { vin, userId, listingId, publishedAt } = input;
  
  if (!vin) {
    // No VIN provided - use current timestamp
    return { originalPublishedAt: publishedAt, isRepost: false, cooldownReset: false };
  }

  const normalizedVin = vin.toUpperCase().trim();
  const cooldownMs = VIN_REPOST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const cooldownThreshold = new Date(publishedAt.getTime() - cooldownMs);
  
  const historyEntry = {
    listingId,
    publishedAt: publishedAt.toISOString(),
  };

  // Use atomic upsert to prevent race conditions
  // INSERT ... ON CONFLICT ensures exactly one record per VIN+user
  // Note: current_listing_id is NOT set here to avoid FK constraint issues
  // when this is called before the listing is inserted. It should be 
  // updated separately after the listing exists.
  const result = await db.execute(sql`
    INSERT INTO vin_publication_history (
      id, vin, user_id, original_published_at, current_listing_id, 
      listing_history, repost_count, created_at, updated_at
    )
    VALUES (
      ${makeVinHistoryId()},
      ${normalizedVin},
      ${userId},
      ${publishedAt},
      NULL,
      ${JSON.stringify([historyEntry])}::jsonb,
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (vin, user_id) DO UPDATE SET
      repost_count = vin_publication_history.repost_count + 1,
      -- Reset originalPublishedAt if cooldown expired (older than threshold)
      original_published_at = CASE
        WHEN vin_publication_history.original_published_at < ${cooldownThreshold}
        THEN EXCLUDED.original_published_at
        ELSE vin_publication_history.original_published_at
      END,
      listing_history = vin_publication_history.listing_history || EXCLUDED.listing_history,
      updated_at = NOW()
    RETURNING 
      original_published_at,
      repost_count,
      (xmax = 0) AS is_insert,
      (original_published_at = ${publishedAt}) AS cooldown_was_reset
  `);

  const row = (result as any).rows?.[0] ?? (result as any)[0];
  
  if (!row) {
    // Fallback if RETURNING fails
    console.error('[vin-history] Upsert returned no rows, falling back');
    return { originalPublishedAt: publishedAt, isRepost: false, cooldownReset: false };
  }

  const originalPublishedAt = row.original_published_at instanceof Date 
    ? row.original_published_at 
    : new Date(row.original_published_at);
  const isInsert = row.is_insert === true || row.is_insert === 't';
  const cooldownReset = !isInsert && (row.cooldown_was_reset === true || row.cooldown_was_reset === 't');

  return {
    originalPublishedAt,
    isRepost: !isInsert,
    cooldownReset,
  };
}

/**
 * Update the current_listing_id in VIN history after a listing is created
 * Call this after successfully inserting a listing to link it in VIN history
 */
export async function updateVinHistoryCurrentListing(input: {
  vin: string;
  userId: string;
  listingId: string;
}): Promise<void> {
  const { vin, userId, listingId } = input;
  
  if (!vin) return;

  const normalizedVin = vin.toUpperCase().trim();

  await db
    .update(vinPublicationHistory)
    .set({
      currentListingId: listingId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vinPublicationHistory.vin, normalizedVin),
        eq(vinPublicationHistory.userId, userId)
      )
    );
}

/**
 * Update VIN history when a listing is deleted or sold
 * Clears the currentListingId and records the event in history
 */
export async function updateVinHistoryOnDelete(input: {
  vin: string;
  userId: string;
  listingId: string;
  deletedAt: Date;
}): Promise<void> {
  const { vin, userId, listingId, deletedAt } = input;
  
  if (!vin) return;

  const normalizedVin = vin.toUpperCase().trim();

  // Update the history record to mark this listing as deleted
  await db
    .update(vinPublicationHistory)
    .set({
      currentListingId: null, // Clear current listing
      listingHistory: sql`
        (
          SELECT jsonb_agg(
            CASE 
              WHEN elem->>'listingId' = ${listingId}
              THEN elem || ${JSON.stringify({ deletedAt: deletedAt.toISOString() })}::jsonb
              ELSE elem
            END
          )
          FROM jsonb_array_elements(${vinPublicationHistory.listingHistory}) elem
        )
      `,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vinPublicationHistory.vin, normalizedVin),
        eq(vinPublicationHistory.userId, userId)
      )
    );
}

/**
 * Update VIN history when a listing is marked as sold
 */
export async function updateVinHistoryOnSold(input: {
  vin: string;
  userId: string;
  listingId: string;
  soldAt: Date;
}): Promise<void> {
  const { vin, userId, listingId, soldAt } = input;
  
  if (!vin) return;

  const normalizedVin = vin.toUpperCase().trim();

  // Update the history record to mark this listing as sold
  await db
    .update(vinPublicationHistory)
    .set({
      currentListingId: null, // Clear current listing (sold)
      listingHistory: sql`
        (
          SELECT jsonb_agg(
            CASE 
              WHEN elem->>'listingId' = ${listingId}
              THEN elem || ${JSON.stringify({ soldAt: soldAt.toISOString() })}::jsonb
              ELSE elem
            END
          )
          FROM jsonb_array_elements(${vinPublicationHistory.listingHistory}) elem
        )
      `,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vinPublicationHistory.vin, normalizedVin),
        eq(vinPublicationHistory.userId, userId)
      )
    );
}

/**
 * Update VIN history when a listing is extended
 * Resets originalPublishedAt to give fresh ranking after full lifecycle (24 days)
 */
export async function updateVinHistoryOnExtend(input: {
  vin: string;
  userId: string;
  listingId: string;
  extendedAt: Date;
}): Promise<void> {
  const { vin, userId, listingId, extendedAt } = input;
  
  if (!vin) return;

  const normalizedVin = vin.toUpperCase().trim();

  // Reset originalPublishedAt and record extension in history
  await db
    .update(vinPublicationHistory)
    .set({
      originalPublishedAt: extendedAt, // Fresh timestamp for ranking
      listingHistory: sql`
        (
          SELECT jsonb_agg(
            CASE 
              WHEN elem->>'listingId' = ${listingId}
              THEN elem || ${JSON.stringify({ extendedAt: extendedAt.toISOString() })}::jsonb
              ELSE elem
            END
          )
          FROM jsonb_array_elements(${vinPublicationHistory.listingHistory}) elem
        )
      `,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vinPublicationHistory.vin, normalizedVin),
        eq(vinPublicationHistory.userId, userId)
      )
    );
}

/**
 * Get VIN publication stats for a user (for admin/analytics)
 */
export async function getVinPublicationStats(userId: string): Promise<{
  totalVinsPublished: number;
  totalReposts: number;
}> {
  const result = await db
    .select({
      count: sql<number>`count(*)`,
      totalReposts: sql<number>`coalesce(sum(${vinPublicationHistory.repostCount}), 0)`,
    })
    .from(vinPublicationHistory)
    .where(eq(vinPublicationHistory.userId, userId));

  return {
    totalVinsPublished: Number(result[0]?.count ?? 0),
    totalReposts: Number(result[0]?.totalReposts ?? 0),
  };
}
