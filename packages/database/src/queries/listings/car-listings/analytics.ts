/**
 * Listing Analytics - Counter-only views & impressions
 *
 * The write path only updates `car_listing.view_count` and
 * `car_listing.impression_count`. Raw event storage has been intentionally
 * removed to minimize Neon write, WAL, and PITR costs.
 *
 * @module queries/listings/car-listings/analytics
 */

import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';

/**
 * Input for recording a listing view
 */
export interface RecordViewInput {
  listingId: string;
  userId?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | null;
}

// Simple in-memory rate limiter for view spam prevention
// Key: `${listingId}:${userId || sessionId || ipAddress}` -> last view timestamp
const viewRateLimiter = new Map<string, number>();
const VIEW_COOLDOWN_MS = 30_000; // 30 seconds between views of same listing by same user

// Cleanup old entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewRateLimiter) {
    if (now - timestamp > VIEW_COOLDOWN_MS * 2) {
      viewRateLimiter.delete(key);
    }
  }
}, 60_000); // Clean every minute

/**
 * Check if view should be rate limited
 */
function isViewRateLimited(input: RecordViewInput): boolean {
  const identifier = input.userId || input.sessionId || input.ipAddress;
  if (!identifier) return false; // Can't rate limit anonymous without any identifier
  
  const key = `${input.listingId}:${identifier}`;
  const lastView = viewRateLimiter.get(key);
  const now = Date.now();
  
  if (lastView && (now - lastView) < VIEW_COOLDOWN_MS) {
    return true; // Rate limited
  }
  
  viewRateLimiter.set(key, now);
  return false;
}

/**
 * Record a listing view
 * - Rate limited: 30s cooldown per user/session per listing
 * - Increments `viewCount` on the listing
 *
 * @returns A synthetic success token, or null if rate limited
 */
export async function recordListingView(input: RecordViewInput): Promise<string | null> {
  if (isViewRateLimited(input)) {
    return null;
  }

  try {
    await db.update(carListing)
      .set({
        viewCount: sql`${carListing.viewCount} + 1`,
      })
      .where(eq(carListing.id, input.listingId));

    return input.listingId;
  } catch (err) {
    console.error(`[analytics] Failed to increment viewCount for ${input.listingId}:`, err);
    return null;
  }
}

/**
 * Batch increment impressions for multiple listings
 * Called when listings appear in search results
 * 
 * Single efficient UPDATE query for all listings
 * 
 * @param listingIds - Array of listing IDs that were displayed
 * @returns Number of listings updated
 */
export async function incrementImpressions(listingIds: string[]): Promise<number> {
  if (!listingIds.length) return 0;

  const uniqueIds = [...new Set(listingIds)];

  const result = await db.update(carListing)
    .set({
      impressionCount: sql`${carListing.impressionCount} + 1`,
    })
    .where(inArray(carListing.id, uniqueIds));
  
  return result.rowCount ?? uniqueIds.length;
}

/**
 * Deprecated compatibility helper.
 *
 * Raw listing-view events are no longer stored, so only the total view counter
 * remains available here.
 */
export async function getListingViewStats(listingId: string) {
  const [stats] = await db
    .select({
      totalViews: carListing.viewCount,
    })
    .from(carListing)
    .where(eq(carListing.id, listingId))
    .limit(1);

  return {
    totalViews: stats?.totalViews ?? 0,
    uniqueUsers: 0,
    uniqueSessions: 0,
    viewsToday: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
  };
}
