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

/**
 * Record a listing view
 * - Inserts detailed view record for analytics
 * - Increments viewCount on the listing (fire-and-forget)
 * 
 * @returns The created view record ID
 */
export async function recordListingView(input: RecordViewInput): Promise<string> {
  const viewId = makeViewId();
  
  // Insert view record + increment counter in parallel
  await Promise.all([
    // Insert detailed view record
    db.insert(listingView).values({
      id: viewId,
      listingId: input.listingId,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType: input.deviceType ?? null,
    }),
    
    // Increment viewCount on listing
    db.update(carListing)
      .set({
        viewCount: sql`${carListing.viewCount} + 1`,
      })
      .where(eq(carListing.id, input.listingId)),
  ]);
  
  return viewId;
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
  
  return result.rowCount ?? uniqueIds.length;
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
