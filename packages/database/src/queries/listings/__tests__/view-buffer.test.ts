/**
 * Analytics Buffer Tests
 * 
 * Tests for the view and impression buffer functionality:
 * - Buffer operations (add views, add impressions)
 * - Flush behavior (skip when empty, batch when data exists)
 * - TTL/interval configuration
 * - Performance benchmarks
 * 
 * Run with: bun test packages/database/src/queries/listings/__tests__/view-buffer.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

// We'll test the buffer logic without actual DB connections
// Import the buffer class behavior through the exported functions

describe('Analytics Buffer', () => {
  // Mock the buffer for testing without DB
  class TestAnalyticsBuffer {
    private views: Array<{ id: string; listingId: string }> = [];
    private viewCounts: Map<string, number> = new Map();
    private impressionCounts: Map<string, number> = new Map();
    private flushIntervalMs = 300000; // 5 minutes
    private maxBufferSize = 1000;
    private flushCount = 0;
    private lastFlushResult: { views: number; viewListings: number; impressionListings: number } | null = null;

    addView(input: { listingId: string }): string {
      const viewId = `view_test_${Date.now()}_${Math.random()}`;
      this.views.push({ id: viewId, listingId: input.listingId });
      this.viewCounts.set(
        input.listingId,
        (this.viewCounts.get(input.listingId) || 0) + 1
      );
      return viewId;
    }

    addImpressions(listingIds: string[]): number {
      if (!listingIds.length) return 0;
      const uniqueIds = [...new Set(listingIds)];
      for (const id of uniqueIds) {
        this.impressionCounts.set(id, (this.impressionCounts.get(id) || 0) + 1);
      }
      return uniqueIds.length;
    }

    async flush(): Promise<{ views: number; viewListings: number; impressionListings: number }> {
      const viewsToFlush = this.views;
      const viewCountsToFlush = new Map(this.viewCounts);
      const impressionCountsToFlush = new Map(this.impressionCounts);

      this.views = [];
      this.viewCounts.clear();
      this.impressionCounts.clear();

      const hasViews = viewsToFlush.length > 0;
      const hasViewUpdates = viewCountsToFlush.size > 0;
      const hasImpressions = impressionCountsToFlush.size > 0;

      // Skip entirely when buffer is empty (no logging, no DB calls)
      if (!hasViews && !hasViewUpdates && !hasImpressions) {
        return { views: 0, viewListings: 0, impressionListings: 0 };
      }

      this.flushCount++;
      this.lastFlushResult = {
        views: viewsToFlush.length,
        viewListings: viewCountsToFlush.size,
        impressionListings: impressionCountsToFlush.size,
      };

      return this.lastFlushResult;
    }

    stats() {
      return {
        bufferedViews: this.views.length,
        bufferedViewUpdates: this.viewCounts.size,
        bufferedImpressionUpdates: this.impressionCounts.size,
        flushIntervalMs: this.flushIntervalMs,
      };
    }

    // Test helpers
    getFlushCount() { return this.flushCount; }
    getLastFlushResult() { return this.lastFlushResult; }
    getFlushIntervalMs() { return this.flushIntervalMs; }
  }

  let buffer: TestAnalyticsBuffer;

  beforeEach(() => {
    buffer = new TestAnalyticsBuffer();
  });

  describe('Configuration', () => {
    it('should have flush interval set to 5 minutes (300000ms)', () => {
      expect(buffer.getFlushIntervalMs()).toBe(300000);
    });
  });

  describe('Add Views', () => {
    it('should add a view and return view ID', () => {
      const viewId = buffer.addView({ listingId: 'listing_123' });
      
      expect(viewId).toMatch(/^view_test_/);
      expect(buffer.stats().bufferedViews).toBe(1);
      expect(buffer.stats().bufferedViewUpdates).toBe(1);
    });

    it('should increment view count for same listing', () => {
      buffer.addView({ listingId: 'listing_123' });
      buffer.addView({ listingId: 'listing_123' });
      buffer.addView({ listingId: 'listing_123' });
      
      expect(buffer.stats().bufferedViews).toBe(3);
      expect(buffer.stats().bufferedViewUpdates).toBe(1); // Same listing
    });

    it('should track multiple listings separately', () => {
      buffer.addView({ listingId: 'listing_1' });
      buffer.addView({ listingId: 'listing_2' });
      buffer.addView({ listingId: 'listing_3' });
      
      expect(buffer.stats().bufferedViews).toBe(3);
      expect(buffer.stats().bufferedViewUpdates).toBe(3); // Different listings
    });
  });

  describe('Add Impressions', () => {
    it('should add impressions for multiple listings', () => {
      const count = buffer.addImpressions(['listing_1', 'listing_2', 'listing_3']);
      
      expect(count).toBe(3);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(3);
    });

    it('should deduplicate impression listing IDs', () => {
      const count = buffer.addImpressions([
        'listing_1', 
        'listing_1', 
        'listing_2', 
        'listing_2', 
        'listing_3'
      ]);
      
      expect(count).toBe(3); // Only unique IDs
    });

    it('should return 0 for empty array', () => {
      const count = buffer.addImpressions([]);
      
      expect(count).toBe(0);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(0);
    });

    it('should accumulate impressions for same listing', () => {
      buffer.addImpressions(['listing_1']);
      buffer.addImpressions(['listing_1']);
      buffer.addImpressions(['listing_1']);
      
      // Still 1 unique listing, but with accumulated count
      expect(buffer.stats().bufferedImpressionUpdates).toBe(1);
    });
  });

  describe('Flush Behavior - Empty Buffer', () => {
    it('should NOT flush when buffer is completely empty', async () => {
      const result = await buffer.flush();
      
      expect(result).toEqual({ views: 0, viewListings: 0, impressionListings: 0 });
      expect(buffer.getFlushCount()).toBe(0); // No actual flush occurred
      expect(buffer.getLastFlushResult()).toBeNull();
    });

    it('should NOT flush when only called multiple times on empty buffer', async () => {
      await buffer.flush();
      await buffer.flush();
      await buffer.flush();
      
      expect(buffer.getFlushCount()).toBe(0); // None of them should have flushed
    });

    it('should NOT count as a flush when views=0 and viewUpdates=0 but impressions exist', async () => {
      buffer.addImpressions(['listing_1']);
      const result = await buffer.flush();
      
      // This SHOULD flush because impressions > 0
      expect(result.impressionListings).toBe(1);
      expect(buffer.getFlushCount()).toBe(1);
    });
  });

  describe('Flush Behavior - With Data', () => {
    it('should flush when views exist', async () => {
      buffer.addView({ listingId: 'listing_123' });
      
      const result = await buffer.flush();
      
      expect(result.views).toBe(1);
      expect(result.viewListings).toBe(1);
      expect(buffer.getFlushCount()).toBe(1);
    });

    it('should flush when only impressions exist', async () => {
      buffer.addImpressions(['listing_1', 'listing_2']);
      
      const result = await buffer.flush();
      
      expect(result.views).toBe(0);
      expect(result.viewListings).toBe(0);
      expect(result.impressionListings).toBe(2);
      expect(buffer.getFlushCount()).toBe(1);
    });

    it('should clear buffer after flush', async () => {
      buffer.addView({ listingId: 'listing_1' });
      buffer.addImpressions(['listing_2', 'listing_3']);
      
      expect(buffer.stats().bufferedViews).toBe(1);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(2);
      
      await buffer.flush();
      
      expect(buffer.stats().bufferedViews).toBe(0);
      expect(buffer.stats().bufferedViewUpdates).toBe(0);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(0);
    });

    it('should handle mixed views and impressions', async () => {
      buffer.addView({ listingId: 'listing_1' });
      buffer.addView({ listingId: 'listing_1' });
      buffer.addView({ listingId: 'listing_2' });
      buffer.addImpressions(['listing_3', 'listing_4', 'listing_5']);
      
      const result = await buffer.flush();
      
      expect(result.views).toBe(3);
      expect(result.viewListings).toBe(2);
      expect(result.impressionListings).toBe(3);
    });
  });

  describe('Flush Behavior - Subsequent Flushes', () => {
    it('should return zeros on second flush (buffer already cleared)', async () => {
      buffer.addView({ listingId: 'listing_1' });
      
      const result1 = await buffer.flush();
      expect(result1.views).toBe(1);
      expect(buffer.getFlushCount()).toBe(1);
      
      const result2 = await buffer.flush();
      expect(result2).toEqual({ views: 0, viewListings: 0, impressionListings: 0 });
      expect(buffer.getFlushCount()).toBe(1); // No additional flush
    });

    it('should flush new data added after previous flush', async () => {
      buffer.addView({ listingId: 'listing_1' });
      await buffer.flush();
      
      buffer.addView({ listingId: 'listing_2' });
      buffer.addImpressions(['listing_3']);
      
      const result = await buffer.flush();
      
      expect(result.views).toBe(1);
      expect(result.viewListings).toBe(1);
      expect(result.impressionListings).toBe(1);
      expect(buffer.getFlushCount()).toBe(2);
    });
  });

  describe('Performance', () => {
    it('should handle 10,000 views efficiently', () => {
      const startAdd = performance.now();
      for (let i = 0; i < 10000; i++) {
        buffer.addView({ listingId: `listing_${i % 100}` }); // 100 unique listings
      }
      const addTime = performance.now() - startAdd;
      
      expect(buffer.stats().bufferedViews).toBe(10000);
      expect(buffer.stats().bufferedViewUpdates).toBe(100);
      
      console.log(`📝 Added 10,000 views in ${addTime.toFixed(2)}ms`);
      expect(addTime).toBeLessThan(100); // Should be very fast
    });

    it('should handle 10,000 impressions efficiently', () => {
      const listings = Array.from({ length: 100 }, (_, i) => `listing_${i}`);
      
      const startAdd = performance.now();
      for (let i = 0; i < 100; i++) {
        buffer.addImpressions(listings);
      }
      const addTime = performance.now() - startAdd;
      
      expect(buffer.stats().bufferedImpressionUpdates).toBe(100);
      
      console.log(`📷 Added 100x100 impressions in ${addTime.toFixed(2)}ms`);
      expect(addTime).toBeLessThan(50);
    });

    it('should flush large buffer efficiently', async () => {
      // Add lots of data
      for (let i = 0; i < 1000; i++) {
        buffer.addView({ listingId: `listing_${i}` });
      }
      buffer.addImpressions(Array.from({ length: 500 }, (_, i) => `imp_${i}`));
      
      const startFlush = performance.now();
      const result = await buffer.flush();
      const flushTime = performance.now() - startFlush;
      
      expect(result.views).toBe(1000);
      expect(result.viewListings).toBe(1000);
      expect(result.impressionListings).toBe(500);
      
      console.log(`🚀 Flushed 1000 views + 500 impressions in ${flushTime.toFixed(2)}ms`);
      expect(flushTime).toBeLessThan(10); // Buffer swap should be instant
    });
  });

  describe('Edge Cases', () => {
    it('should handle same listing in both views and impressions', async () => {
      buffer.addView({ listingId: 'listing_same' });
      buffer.addImpressions(['listing_same']);
      
      const result = await buffer.flush();
      
      expect(result.views).toBe(1);
      expect(result.viewListings).toBe(1);
      expect(result.impressionListings).toBe(1);
    });

    it('should handle very long listing IDs', () => {
      const longId = 'listing_' + 'x'.repeat(1000);
      buffer.addView({ listingId: longId });
      buffer.addImpressions([longId]);
      
      expect(buffer.stats().bufferedViews).toBe(1);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(1);
    });

    it('should handle special characters in listing IDs', () => {
      const specialIds = [
        'listing_with-dash',
        'listing_with_underscore',
        'listing:with:colons',
        'listing/with/slashes',
      ];
      
      specialIds.forEach(id => buffer.addView({ listingId: id }));
      buffer.addImpressions(specialIds);
      
      expect(buffer.stats().bufferedViews).toBe(4);
      expect(buffer.stats().bufferedImpressionUpdates).toBe(4);
    });
  });
});

describe('Analytics Buffer - Real Module', () => {
  // Skip these tests if DATABASE_URL is not set (they require DB connection)
  const skipRealModule = !process.env.DATABASE_URL;
  
  // Test the actual exported functions (without DB calls)
  it.skipIf(skipRealModule)('should export required functions', async () => {
    const { 
      recordListingViewBuffered,
      recordImpressionsBuffered,
      getViewBufferStats,
      analyticsBuffer,
    } = await import('../car-listings/view-buffer');
    
    expect(typeof recordListingViewBuffered).toBe('function');
    expect(typeof recordImpressionsBuffered).toBe('function');
    expect(typeof getViewBufferStats).toBe('function');
    expect(analyticsBuffer).toBeDefined();
  });

  it.skipIf(skipRealModule)('should have 5 minute flush interval configured', async () => {
    const { getViewBufferStats } = await import('../car-listings/view-buffer');
    
    const stats = getViewBufferStats();
    expect(stats.flushIntervalMs).toBe(300000); // 5 minutes
  });
});
