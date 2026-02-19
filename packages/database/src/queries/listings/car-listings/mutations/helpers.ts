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

/**
 * QI Score input for pre-computation
 */
export interface QiScoreInput {
  images: string[] | null;
  description: string | null;
  extras: string[] | null;
  tags: string[] | null;
  videoUrl: string | null;
  partnerVerified: boolean;
}

/**
 * Compute Quality Index score for a listing (0-70 scale)
 * 
 * Pre-computed on create/edit to avoid expensive runtime calculations.
 * This score is stored in qiScore column and used for relevance sorting.
 * 
 * Components (70 points total):
 * - Photos (25): 10+ images = full score
 * - Description (15): 250+ chars = full score  
 * - Completeness (20): extras, tags, video presence
 * - Trust (10): partner verified bonus
 */
export function computeQiScore(input: QiScoreInput): number {
  const images = input.images ?? [];
  const description = input.description ?? '';
  const extras = input.extras ?? [];
  const tags = input.tags ?? [];
  
  // Photos: 0-25 points (10+ images = full score)
  const photoScore = Math.min(images.length, 10) / 10 * 25;
  
  // Description: 0-15 points (250+ chars = full score)
  const descScore = Math.min(description.length, 250) / 250 * 15;
  
  // Completeness: 0-20 points
  const completeness = (
    Math.min(extras.length, 6) / 6 * 0.5 +
    Math.min(tags.length, 3) / 3 * 0.3 +
    (input.videoUrl ? 0.2 : 0)
  ) * 20;
  
  // Trust: 0-10 points
  const trust = input.partnerVerified ? 10 : 0;
  
  return Math.round((photoScore + descScore + completeness + trust) * 100) / 100;
}

/**
 * Keys that affect qiScore and should trigger recomputation
 * Note: partnerVerified is admin-controlled, recomputed separately
 */
export const QI_SCORE_KEYS = [
  'images',
  'description', 
  'extras',
  'tags',
  'videoUrl',
] as const;
