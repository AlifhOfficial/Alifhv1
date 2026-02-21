/**
 * Listing Analytics - Views & Impressions
 * 
 * Track listing engagement metrics:
 * - Views: User clicks into detail page
 * - Impressions: Listing appears in search results
 * 
 * @module queries/listings/car-listings/analytics
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing, listingView } from '../../../schema/listing';

const VIEW_ID_PREFIX = 'view_';

/**
 * Generate a unique ID for view records
 */
export const makeViewId = () => `${VIEW_ID_PREFIX}${createId()}`;

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
 * - Inserts detailed view record for analytics
 * - Increments viewCount on the listing (fire-and-forget, only if insert succeeds)
 * 
 * @returns The created view record ID, or null if rate limited
 */
export async function recordListingView(input: RecordViewInput): Promise<string | null> {
  // Check rate limit first
  if (isViewRateLimited(input)) {
    return null; // Silently skip rate-limited views
  }
  
  const viewId = makeViewId();
  
  try {
    // Insert view record first (must succeed before incrementing counter)
    await db.insert(listingView).values({
      id: viewId,
      listingId: input.listingId,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType: input.deviceType ?? null,
    });
    
    // Fire-and-forget: Increment viewCount (don't block response)
    db.update(carListing)
      .set({
        viewCount: sql`${carListing.viewCount} + 1`,
      })
      .where(eq(carListing.id, input.listingId))
      .catch((err) => {
        console.error(`[analytics] Failed to increment viewCount for ${input.listingId}:`, err.message);
      });
    
    return viewId;
  } catch (err) {
    console.error(`[analytics] Failed to record view for ${input.listingId}:`, err);
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
  
  // Deduplicate IDs
  const uniqueIds = [...new Set(listingIds)];
  
  // Single bulk update - very efficient
  const result = await db.update(carListing)
    .set({
      impressionCount: sql`${carListing.impressionCount} + 1`,
    })
    .where(inArray(carListing.id, uniqueIds));
  
  return (result as any).count ?? (result as any).rowCount ?? uniqueIds.length;
}

/**
 * Get view statistics for a listing
 * Useful for seller analytics dashboard
 */
export async function getListingViewStats(listingId: string) {
  const [stats] = await db
    .select({
      totalViews: sql<number>`COUNT(*)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${listingView.userId}) FILTER (WHERE ${listingView.userId} IS NOT NULL)`,
      uniqueSessions: sql<number>`COUNT(DISTINCT ${listingView.sessionId}) FILTER (WHERE ${listingView.sessionId} IS NOT NULL)`,
      viewsToday: sql<number>`COUNT(*) FILTER (WHERE ${listingView.createdAt} >= CURRENT_DATE)`,
      viewsThisWeek: sql<number>`COUNT(*) FILTER (WHERE ${listingView.createdAt} >= CURRENT_DATE - INTERVAL '7 days')`,
      viewsThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${listingView.createdAt} >= CURRENT_DATE - INTERVAL '30 days')`,
    })
    .from(listingView)
    .where(eq(listingView.listingId, listingId));
  
  return stats;
}
