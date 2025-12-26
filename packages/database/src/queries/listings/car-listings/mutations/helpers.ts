/**
 * Car Listing Mutations - Helper Functions
 * 
 * Utility functions used across mutation operations.
 * 
 * @module queries/listings/car-listings/mutations/helpers
 */

import { createId } from '@paralleldrive/cuid2';
import { db } from '../../../../dbclient';
import { listingPriceHistory } from '../../../../schema/listing';

const PRICE_HISTORY_ID_PREFIX = 'price_';

/**
 * Generate a unique ID for price history records
 */
export const makePriceHistoryId = () => `${PRICE_HISTORY_ID_PREFIX}${createId()}`;

/**
 * Generate a unique ID for car listings
 */
export const makeListingId = () => `listing_${createId()}`;

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Escape special LIKE pattern characters in user input
 * Prevents % and _ from being interpreted as wildcards
 */
export function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Record a price change in the price history table
 * Called automatically by update functions when price changes
 */
export async function recordPriceChange(
  listingId: string,
  oldPrice: number,
  newPrice: number,
  changedBy: string | null,
  reason?: string
): Promise<void> {
  if (oldPrice === newPrice) return; // No change, skip recording

  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

  await db.insert(listingPriceHistory).values({
    id: makePriceHistoryId(),
    listingId,
    oldPrice,
    newPrice,
    changePercent,
    reason: reason ?? null,
    changedBy,
  });
}

/**
 * Check if a listing is currently public (visible to browse)
 * Must match the SQL expression in sql-fragments.ts
 */
export function isListingPublic(
  moderationStatus: string,
  lifecycleStatus: string,
  expiresAt: Date | null,
  now: Date = new Date(),
  needsRemoderation: boolean = false
): boolean {
  return (
    moderationStatus === 'approved' &&
    lifecycleStatus === 'active' &&
    needsRemoderation === false &&
    expiresAt !== null &&
    expiresAt.getTime() > now.getTime()
  );
}

/**
 * Default listing expiry duration in days
 */
export const DEFAULT_LISTING_EXPIRY_DAYS = 24;

/**
 * Extension window in milliseconds (2 days before expiry)
 */
export const EXTENSION_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
