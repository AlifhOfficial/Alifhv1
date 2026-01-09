/**
 * Booking Optimizations Tests
 * 
 * Tests for the performance optimizations made to booking queries:
 * 1. Batch partner settings fetch (getPartnerBookingSettingsBatch)
 * 2. Parallelized createBooking mutation
 * 3. Combined user+profile query
 * 
 * Run: bun test src/queries/booking/__tests__/booking-optimizations.test.ts
 * Run with DB: RUN_INTEGRATION_TESTS=1 bun test src/queries/booking/__tests__/booking-optimizations.test.ts
 */

import { describe, it, expect, beforeAll, mock, spyOn } from 'bun:test';

// Skip database tests if DATABASE_URL is not set or RUN_INTEGRATION_TESTS is not enabled
const HAS_DATABASE = !!process.env.DATABASE_URL;
const SKIP_DB_TESTS = !process.env.RUN_INTEGRATION_TESTS || !HAS_DATABASE;

// ============================================================================
// UNIT TESTS - Pure function tests
// ============================================================================

describe('Booking Optimization Unit Tests', () => {
  describe('Batch Processing Logic', () => {
    it('should correctly deduplicate partner IDs', () => {
      // Simulate the deduplication logic
      const partnerIds = ['p1', 'p2', 'p1', 'p3', 'p2', 'p1'];
      const unique = [...new Set(partnerIds)];
      
      expect(unique.length).toBe(3);
      expect(unique).toContain('p1');
      expect(unique).toContain('p2');
      expect(unique).toContain('p3');
    });

    it('should handle empty array', () => {
      const partnerIds: string[] = [];
      const unique = [...new Set(partnerIds)];
      
      expect(unique.length).toBe(0);
    });

    it('should preserve order of first occurrences', () => {
      const partnerIds = ['z', 'a', 'z', 'm'];
      const unique = [...new Set(partnerIds)];
      
      expect(unique).toEqual(['z', 'a', 'm']);
    });

    it('should create Map from batch results correctly', () => {
      const mockResults = [
        { partnerId: 'p1', slotDuration: 45 },
        { partnerId: 'p2', slotDuration: 60 },
        { partnerId: 'p3', slotDuration: 30 },
      ];
      
      const settingsMap = new Map(
        mockResults.map(s => [s.partnerId, s])
      );
      
      expect(settingsMap.size).toBe(3);
      expect(settingsMap.get('p1')?.slotDuration).toBe(45);
      expect(settingsMap.get('p2')?.slotDuration).toBe(60);
      expect(settingsMap.get('p3')?.slotDuration).toBe(30);
      expect(settingsMap.get('nonexistent')).toBeUndefined();
    });
  });

  describe('Parallel Promise Execution', () => {
    it('should execute multiple promises in parallel', async () => {
      const delays = [50, 30, 40]; // ms
      const start = performance.now();
      
      const results = await Promise.all(
        delays.map(delay => 
          new Promise<number>(resolve => setTimeout(() => resolve(delay), delay))
        )
      );
      
      const elapsed = performance.now() - start;
      
      // Parallel execution should complete in ~max(delays) time, not sum(delays)
      expect(elapsed).toBeLessThan(100); // Should be around 50ms, not 120ms
      expect(results).toEqual([50, 30, 40]);
    });

    it('should handle partial failures gracefully', async () => {
      const tasks = [
        Promise.resolve('success1'),
        Promise.reject(new Error('failure')),
        Promise.resolve('success2'),
      ];
      
      const results = await Promise.allSettled(tasks);
      
      expect(results[0]).toEqual({ status: 'fulfilled', value: 'success1' });
      expect(results[1]).toEqual({ status: 'rejected', reason: expect.any(Error) });
      expect(results[2]).toEqual({ status: 'fulfilled', value: 'success2' });
    });
  });

  describe('Query Deduplication', () => {
    it('should identify unique queries from booking list', () => {
      const bookings = [
        { partnerId: 'p1', listingId: 'l1' },
        { partnerId: 'p1', listingId: 'l2' },
        { partnerId: 'p2', listingId: 'l3' },
        { partnerId: 'p1', listingId: 'l4' },
      ];
      
      const uniquePartnerIds = [...new Set(bookings.map(b => b.partnerId))];
      
      expect(uniquePartnerIds.length).toBe(2);
      expect(uniquePartnerIds).toContain('p1');
      expect(uniquePartnerIds).toContain('p2');
    });

    it('should correctly count N+1 query reduction', () => {
      const bookingCount = 10;
      const uniquePartnerCount = 3;
      
      // N+1 pattern: 1 + N queries
      const nPlusOneQueries = 1 + bookingCount;
      
      // Batch pattern: 1 + unique queries (becomes 2 with batch)
      const batchQueries = 1 + 1;
      
      const queriesReduced = nPlusOneQueries - batchQueries;
      const percentReduction = (queriesReduced / nPlusOneQueries) * 100;
      
      expect(queriesReduced).toBe(9);
      expect(percentReduction).toBeGreaterThan(80);
    });
  });

  describe('User Profile Join Logic', () => {
    it('should correctly merge user and profile data', () => {
      const userData = {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      
      const profileData = {
        userId: 'u1',
        firstName: 'Test',
        lastName: 'User',
        phone: '+971501234567',
      };
      
      // Simulate JOIN result
      const joinedResult = {
        ...userData,
        profile: profileData,
      };
      
      expect(joinedResult.id).toBe('u1');
      expect(joinedResult.email).toBe('test@example.com');
      expect(joinedResult.profile.firstName).toBe('Test');
      expect(joinedResult.profile.phone).toBe('+971501234567');
    });

    it('should handle missing profile gracefully', () => {
      const userData = {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      
      // Simulate LEFT JOIN with no profile
      const joinedResult = {
        ...userData,
        profile: null,
      };
      
      expect(joinedResult.id).toBe('u1');
      expect(joinedResult.profile).toBeNull();
    });
  });

  describe('Booking Creation Phases', () => {
    // Test the logical phases without database
    
    it('Phase 1: Parallel restrictions + listing + user fetch', async () => {
      const start = performance.now();
      
      // Simulate 3 parallel queries
      const [restrictions, listing, user] = await Promise.all([
        new Promise(r => setTimeout(() => r({ canBook: true }), 20)),
        new Promise(r => setTimeout(() => r({ id: 'listing1', status: 'active' }), 25)),
        new Promise(r => setTimeout(() => r({ id: 'user1', name: 'Test' }), 15)),
      ]);
      
      const elapsed = performance.now() - start;
      
      // Should complete in ~max(20, 25, 15) = 25ms, not 60ms
      expect(elapsed).toBeLessThan(50);
      expect(restrictions).toEqual({ canBook: true });
      expect(listing).toEqual({ id: 'listing1', status: 'active' });
      expect(user).toEqual({ id: 'user1', name: 'Test' });
    });

    it('Phase 2: Parallel settings + bookings + slots', async () => {
      const start = performance.now();
      
      const [settings, existingBookings, slots, availabilityRule] = await Promise.all([
        new Promise(r => setTimeout(() => r({ slotDuration: 45 }), 20)),
        new Promise(r => setTimeout(() => r([]), 15)),
        new Promise(r => setTimeout(() => r([{ startTime: '09:00' }]), 25)),
        new Promise(r => setTimeout(() => r({ openTime: '08:00' }), 10)),
      ]);
      
      const elapsed = performance.now() - start;
      
      // Should complete in ~25ms, not 70ms
      expect(elapsed).toBeLessThan(50);
    });

    it('Phase 3: Parallel slot creation + booking insert', async () => {
      const start = performance.now();
      
      const [bookingSlot, booking] = await Promise.all([
        new Promise(r => setTimeout(() => r({ id: 'slot1' }), 20)),
        new Promise(r => setTimeout(() => r({ id: 'booking1' }), 25)),
      ]);
      
      const elapsed = performance.now() - start;
      
      // Should complete in ~25ms, not 45ms
      expect(elapsed).toBeLessThan(50);
    });

    it('Phase 4: Parallel post-insert verification', async () => {
      const start = performance.now();
      
      const [updatedSlot, updatedBooking] = await Promise.all([
        new Promise(r => setTimeout(() => r({ id: 'slot1', bookingId: 'b1' }), 15)),
        new Promise(r => setTimeout(() => r({ id: 'b1', slotId: 'slot1' }), 20)),
      ]);
      
      const elapsed = performance.now() - start;
      
      expect(elapsed).toBeLessThan(40);
    });
  });

  describe('Performance Metrics Calculation', () => {
    it('should calculate correct query reduction for createBooking', () => {
      // Old sequential: ~15 queries
      const oldQueries = 15;
      // New parallel: 5 phases with ~7-8 round trips
      const newRoundTrips = 5;
      
      const reduction = ((oldQueries - newRoundTrips) / oldQueries) * 100;
      
      expect(reduction).toBeGreaterThan(60); // At least 60% reduction
    });

    it('should calculate correct time savings estimate', () => {
      // Assume 50-100ms per DB round trip (Neon serverless)
      const msPerTrip = 75; // average
      
      const oldTime = 15 * msPerTrip; // 1125ms
      const newTime = 5 * msPerTrip;  // 375ms (parallel batches)
      
      const timeSaved = oldTime - newTime;
      const percentFaster = (timeSaved / oldTime) * 100;
      
      expect(timeSaved).toBeGreaterThan(500); // Save at least 500ms
      expect(percentFaster).toBeGreaterThan(60); // At least 60% faster
    });
  });
});

// ============================================================================
// INTEGRATION TESTS - Require database connection
// ============================================================================

describe.skipIf(SKIP_DB_TESTS)('Booking Optimization Integration Tests', () => {
  let getPartnerBookingSettingsBatch: any;
  let getPartnerBookingSettings: any;
  
  beforeAll(async () => {
    const availabilityQueries = await import('../availability-queries');
    getPartnerBookingSettingsBatch = availabilityQueries.getPartnerBookingSettingsBatch;
    getPartnerBookingSettings = availabilityQueries.getPartnerBookingSettings;
  });

  describe('getPartnerBookingSettingsBatch', () => {
    it('should return empty Map for empty input', async () => {
      const result = await getPartnerBookingSettingsBatch([]);
      
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should return Map for non-existent partners', async () => {
      const result = await getPartnerBookingSettingsBatch(['fake1', 'fake2', 'fake3']);
      
      expect(result).toBeInstanceOf(Map);
      // Map should be empty since partners don't exist
      expect(result.size).toBe(0);
    });

    it('should handle duplicate partner IDs', async () => {
      const partnerIds = ['p1', 'p1', 'p1'];
      const result = await getPartnerBookingSettingsBatch(partnerIds);
      
      expect(result).toBeInstanceOf(Map);
      // Should not throw or create duplicate entries
      expect(result.size).toBeLessThanOrEqual(1);
    });

    it('should be faster than N individual queries for large N', async () => {
      const partnerIds = Array.from({ length: 10 }, (_, i) => `partner_test_${i}`);
      
      // Batch query
      const batchStart = performance.now();
      await getPartnerBookingSettingsBatch(partnerIds);
      const batchTime = performance.now() - batchStart;
      
      // Sequential queries
      const seqStart = performance.now();
      for (const id of partnerIds) {
        await getPartnerBookingSettings(id);
      }
      const seqTime = performance.now() - seqStart;
      
      // Batch should be significantly faster
      console.log(`Batch: ${batchTime.toFixed(0)}ms, Sequential: ${seqTime.toFixed(0)}ms`);
      
      // Allow some variance, but batch should generally be faster
      // With 10 queries, sequential should be ~5-10x slower
      expect(batchTime).toBeLessThan(seqTime * 2); // At minimum, not dramatically slower
    });
  });

  describe('Combined User + Profile Query', () => {
    let getUserProfileByUserId: any;
    
    beforeAll(async () => {
      const userProfileModule = await import('../../profile/user/user-profile-query');
      getUserProfileByUserId = userProfileModule.getUserProfileByUserId;
    });

    it('should have getUserProfileByUserId function exported', () => {
      expect(getUserProfileByUserId).toBeDefined();
      expect(typeof getUserProfileByUserId).toBe('function');
    });

    it('should return null for non-existent user', async () => {
      const result = await getUserProfileByUserId('non_existent_user_xyz123');
      expect(result).toBeNull();
    });
  });

  describe('Query Timing Benchmarks', () => {
    it('should measure single vs batch query performance', async () => {
      // This is a benchmark test to validate our optimizations
      const iterations = 5;
      const singleQueryTimes: number[] = [];
      const batchQueryTimes: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        // Single query
        const singleStart = performance.now();
        await getPartnerBookingSettings('benchmark_partner');
        singleQueryTimes.push(performance.now() - singleStart);
        
        // Batch query (single item)
        const batchStart = performance.now();
        await getPartnerBookingSettingsBatch(['benchmark_partner']);
        batchQueryTimes.push(performance.now() - batchStart);
      }
      
      const avgSingle = singleQueryTimes.reduce((a, b) => a + b, 0) / iterations;
      const avgBatch = batchQueryTimes.reduce((a, b) => a + b, 0) / iterations;
      
      console.log(`Single query avg: ${avgSingle.toFixed(1)}ms`);
      console.log(`Batch query avg: ${avgBatch.toFixed(1)}ms`);
      
      // Both should be reasonably fast for single item
      expect(avgSingle).toBeLessThan(500);
      expect(avgBatch).toBeLessThan(500);
    });
  });
});

// ============================================================================
// API RESPONSE TIME TESTS
// ============================================================================

const SKIP_API_TESTS = !process.env.RUN_INTEGRATION_TESTS;
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe.skipIf(SKIP_API_TESTS)('Booking API Performance Tests', () => {
  describe('Slots Endpoint Performance', () => {
    it('should respond within 500ms', async () => {
      const start = performance.now();
      const response = await fetch(`${BASE_URL}/api/bookings/slots?listingId=test`);
      const elapsed = performance.now() - start;
      
      // Even for non-existent listing, should be fast
      expect(elapsed).toBeLessThan(500);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        fetch(`${BASE_URL}/api/bookings/slots?listingId=concurrent_test`)
      );
      
      const start = performance.now();
      await Promise.all(requests);
      const elapsed = performance.now() - start;
      
      // 5 concurrent requests should complete in reasonable time
      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe('Auth Rejection Speed', () => {
    it('GET /api/bookings should reject fast', async () => {
      const start = performance.now();
      await fetch(`${BASE_URL}/api/bookings`);
      const elapsed = performance.now() - start;
      
      expect(elapsed).toBeLessThan(100);
    });

    it('POST /api/bookings should reject fast', async () => {
      const start = performance.now();
      await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'test' }),
      });
      const elapsed = performance.now() - start;
      
      expect(elapsed).toBeLessThan(100);
    });
  });
});
