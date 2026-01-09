/**
 * View & Impression Buffer - Batched Analytics Tracking
 * 
 * Instead of DB writes per view/impression, we buffer in memory
 * and flush periodically. This reduces DB writes by ~98%.
 * 
 * Flow:
 * 1. User views listing → Add to buffer (instant, no DB)
 * 2. Search results shown → Buffer impressions (instant, no DB)
 * 3. Every 5 minutes → Flush buffer to DB (single batch operation)
 * 
 * Trade-off: May lose up to 5 minutes of data if server crashes (acceptable for analytics)
 * 
 * @module queries/listings/car-listings/view-buffer
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, sql, inArray } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing, listingView } from '../../../schema/listing';

const VIEW_ID_PREFIX = 'view_';

/**
 * Buffered view data
 */
interface BufferedView {
  id: string;
  listingId: string;
  userId: string | null;
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | null;
  createdAt: Date;
}

/**
 * Analytics buffer - stores views and impressions until flush
 */
class AnalyticsBuffer {
  private views: BufferedView[] = [];
  private viewCounts: Map<string, number> = new Map();
  private impressionCounts: Map<string, number> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private flushIntervalMs = 300000; // 5 minutes
  private maxBufferSize = 1000; // Force flush if buffer gets too large
  
  constructor() {
    this.startAutoFlush();
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush().catch(err => {
        console.error('[analytics-buffer] Auto-flush error:', err);
      });
    }, this.flushIntervalMs);

    // Don't prevent process exit
    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  /**
   * Add a view to the buffer (instant, no DB)
   */
  addView(input: {
    listingId: string;
    userId?: string | null;
    sessionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
    deviceType?: 'desktop' | 'mobile' | 'tablet' | null;
  }): string {
    const viewId = `${VIEW_ID_PREFIX}${createId()}`;
    
    // Add to detailed views buffer
    this.views.push({
      id: viewId,
      listingId: input.listingId,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      deviceType: input.deviceType ?? null,
      createdAt: new Date(),
    });

    // Increment view counter
    this.viewCounts.set(
      input.listingId, 
      (this.viewCounts.get(input.listingId) || 0) + 1
    );

    // Force flush if buffer is too large
    if (this.views.length >= this.maxBufferSize) {
      this.flush().catch(err => {
        console.error('[analytics-buffer] Max-size flush error:', err);
      });
    }

    return viewId;
  }

  /**
   * Add impressions to the buffer (instant, no DB)
   * Called when listings appear in search results
   */
  addImpressions(listingIds: string[]): number {
    if (!listingIds.length) return 0;
    
    // Deduplicate
    const uniqueIds = [...new Set(listingIds)];
    
    for (const id of uniqueIds) {
      this.impressionCounts.set(
        id,
        (this.impressionCounts.get(id) || 0) + 1
      );
    }

    return uniqueIds.length;
  }

  /**
   * Flush buffer to database
   * - Batch insert all view records
   * - Batch update all view counts
   * - Batch update all impression counts
   */
  async flush(): Promise<{ views: number; viewListings: number; impressionListings: number }> {
    // Swap buffers to avoid race conditions
    const viewsToFlush = this.views;
    const viewCountsToFlush = new Map(this.viewCounts);
    const impressionCountsToFlush = new Map(this.impressionCounts);
    
    this.views = [];
    this.viewCounts.clear();
    this.impressionCounts.clear();

    const hasViews = viewsToFlush.length > 0;
    const hasViewUpdates = viewCountsToFlush.size > 0;
    const hasImpressions = impressionCountsToFlush.size > 0;

    // Skip DB operations entirely when buffer is empty (no logging, no DB calls)
    if (!hasViews && !hasViewUpdates && !hasImpressions) {
      return { views: 0, viewListings: 0, impressionListings: 0 };
    }

    const startTime = Date.now();

    try {
      const operations: Promise<any>[] = [];

      // Batch insert view records
      if (viewsToFlush.length > 0) {
        operations.push(
          db.insert(listingView).values(
            viewsToFlush.map(v => ({
              id: v.id,
              listingId: v.listingId,
              userId: v.userId,
              sessionId: v.sessionId,
              ipAddress: v.ipAddress,
              userAgent: v.userAgent,
              referrer: v.referrer,
              deviceType: v.deviceType,
              createdAt: v.createdAt,
            }))
          )
        );
      }

      // Batch update view counts
      if (viewCountsToFlush.size > 0) {
        for (const [listingId, count] of viewCountsToFlush) {
          operations.push(
            db.update(carListing)
              .set({
                viewCount: sql`${carListing.viewCount} + ${count}`,
              })
              .where(eq(carListing.id, listingId))
          );
        }
      }

      // Batch update impression counts
      if (impressionCountsToFlush.size > 0) {
        for (const [listingId, count] of impressionCountsToFlush) {
          operations.push(
            db.update(carListing)
              .set({
                impressionCount: sql`${carListing.impressionCount} + ${count}`,
              })
              .where(eq(carListing.id, listingId))
          );
        }
      }

      // Execute all operations in parallel
      await Promise.all(operations);

      const elapsed = Date.now() - startTime;
      console.log(
        `[analytics-buffer] Flushed: ${viewsToFlush.length} views, ` +
        `${viewCountsToFlush.size} view updates, ` +
        `${impressionCountsToFlush.size} impression updates, ` +
        `${elapsed}ms`
      );

      return { 
        views: viewsToFlush.length, 
        viewListings: viewCountsToFlush.size,
        impressionListings: impressionCountsToFlush.size,
      };
    } catch (error) {
      // On error, try to restore the buffer (best effort)
      console.error('[analytics-buffer] Flush error, attempting recovery:', error);
      this.views.push(...viewsToFlush);
      viewCountsToFlush.forEach((count, listingId) => {
        this.viewCounts.set(listingId, (this.viewCounts.get(listingId) || 0) + count);
      });
      impressionCountsToFlush.forEach((count, listingId) => {
        this.impressionCounts.set(listingId, (this.impressionCounts.get(listingId) || 0) + count);
      });
      throw error;
    }
  }

  /**
   * Get buffer stats
   */
  stats() {
    return {
      pendingViews: this.views.length,
      pendingViewListings: this.viewCounts.size,
      pendingImpressionListings: this.impressionCounts.size,
      totalPendingImpressions: Array.from(this.impressionCounts.values()).reduce((a, b) => a + b, 0),
      flushIntervalMs: this.flushIntervalMs,
    };
  }

  /**
   * Cleanup - call on server shutdown
   */
  async destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Final flush
    await this.flush();
  }
}

// Singleton - use globalThis to survive hot reloads
const globalKey = '__alifh_analytics_buffer__';
const globalObj = globalThis as unknown as { [key: string]: AnalyticsBuffer };

if (!globalObj[globalKey]) {
  globalObj[globalKey] = new AnalyticsBuffer();
}

export const analyticsBuffer = globalObj[globalKey];

// Keep backward compatibility alias
export const viewBuffer = analyticsBuffer;

/**
 * Record a listing view (buffered - instant response)
 * 
 * @returns The generated view ID
 */
export function recordListingViewBuffered(input: {
  listingId: string;
  userId?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | null;
}): string {
  return analyticsBuffer.addView(input);
}

/**
 * Record impressions for multiple listings (buffered - instant response)
 * Called when listings appear in search results
 * 
 * @returns Number of unique listings tracked
 */
export function recordImpressionsBuffered(listingIds: string[]): number {
  return analyticsBuffer.addImpressions(listingIds);
}

/**
 * Force flush the analytics buffer (call from cron/cleanup)
 */
export async function flushViewBuffer() {
  return analyticsBuffer.flush();
}

/**
 * Alias for flushViewBuffer
 */
export const flushAnalyticsBuffer = flushViewBuffer;

/**
 * Get buffer statistics
 */
export function getViewBufferStats() {
  return analyticsBuffer.stats();
}

/**
 * Alias for getViewBufferStats
 */
export const getAnalyticsBufferStats = getViewBufferStats;
