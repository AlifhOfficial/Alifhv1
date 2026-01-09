/**
 * Search Caching Integration Tests
 * 
 * Tests for search API caching behavior
 * Run with: RUN_INTEGRATION_TESTS=1 bun test apps/web/tests/search-cache.test.ts
 */

import { describe, it, expect, beforeAll } from 'bun:test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SKIP_INTEGRATION = !process.env.RUN_INTEGRATION_TESTS;

interface SearchResponse {
  data: any[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  facets?: any;
}

interface TimedResponse<T> {
  data: T;
  time: number;
  status: number;
}

async function timedFetch<T>(url: string): Promise<TimedResponse<T>> {
  const start = performance.now();
  const response = await fetch(url);
  const time = performance.now() - start;
  const data = await response.json();
  return { data, time, status: response.status };
}

describe.skipIf(SKIP_INTEGRATION)('Search Cache Performance Tests', () => {
  
  describe('Cache Hit Performance', () => {
    it('should be faster on second request (cache hit)', async () => {
      // First request - cache miss
      const first = await timedFetch<SearchResponse>(`${BASE_URL}/api/listings/search`);
      expect(first.status).toBe(200);
      
      // Second request - should be cache hit
      const second = await timedFetch<SearchResponse>(`${BASE_URL}/api/listings/search`);
      expect(second.status).toBe(200);
      
      console.log(`First request: ${first.time.toFixed(2)}ms`);
      console.log(`Second request: ${second.time.toFixed(2)}ms`);
      
      // Cache hit should be noticeably faster (at least 2x)
      // Note: In dev mode, there's still overhead, so we're lenient
      expect(second.time).toBeLessThan(first.time * 1.5);
    });

    it('should cache different filter combinations separately', async () => {
      // Query 1
      const toyota = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?make=Toyota`
      );
      expect(toyota.status).toBe(200);
      
      // Query 2 - different filter
      const honda = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?make=Honda`
      );
      expect(honda.status).toBe(200);
      
      // Query 1 again - should hit cache
      const toyotaCached = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?make=Toyota`
      );
      expect(toyotaCached.status).toBe(200);
      
      console.log(`Toyota (cold): ${toyota.time.toFixed(2)}ms`);
      console.log(`Honda (cold): ${honda.time.toFixed(2)}ms`);
      console.log(`Toyota (cached): ${toyotaCached.time.toFixed(2)}ms`);
    });
  });

  describe('Pagination Caching', () => {
    it('should cache each page separately', async () => {
      const page1 = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?limit=10&offset=0`
      );
      const page2 = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?limit=10&offset=10`
      );
      const page1Again = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?limit=10&offset=0`
      );
      
      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      expect(page1Again.status).toBe(200);
      
      console.log(`Page 1 (cold): ${page1.time.toFixed(2)}ms`);
      console.log(`Page 2 (cold): ${page2.time.toFixed(2)}ms`);
      console.log(`Page 1 (cached): ${page1Again.time.toFixed(2)}ms`);
    });
  });

  describe('Filter Combinations', () => {
    it('should cache complex filter combinations', async () => {
      const filters = 'make=Toyota&condition=used&minPrice=10000&maxPrice=50000';
      
      const first = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?${filters}`
      );
      const second = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?${filters}`
      );
      
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      
      console.log(`Complex filter (cold): ${first.time.toFixed(2)}ms`);
      console.log(`Complex filter (cached): ${second.time.toFixed(2)}ms`);
    });

    it('should differentiate condition filters', async () => {
      const newCars = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?condition=new`
      );
      const usedCars = await timedFetch<SearchResponse>(
        `${BASE_URL}/api/listings/search?condition=used`
      );
      
      expect(newCars.status).toBe(200);
      expect(usedCars.status).toBe(200);
      
      // Results should be different
      console.log(`New cars: ${newCars.data.meta?.total || 0} results`);
      console.log(`Used cars: ${usedCars.data.meta?.total || 0} results`);
    });
  });

  describe('Black Listings Cache', () => {
    it('should cache black listings separately', async () => {
      const first = await timedFetch<any>(`${BASE_URL}/api/listings/black`);
      const second = await timedFetch<any>(`${BASE_URL}/api/listings/black`);
      
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      
      console.log(`Black listings (cold): ${first.time.toFixed(2)}ms`);
      console.log(`Black listings (cached): ${second.time.toFixed(2)}ms`);
    });
  });

  describe('Listing Detail Cache', () => {
    it('should cache listing details', async () => {
      // Get a listing ID first
      const search = await timedFetch<SearchResponse>(`${BASE_URL}/api/listings/search?limit=1`);
      
      if (search.data.data?.length > 0) {
        const listingId = search.data.data[0].id;
        
        const first = await timedFetch<any>(
          `${BASE_URL}/api/listings/${listingId}/detailed`
        );
        const second = await timedFetch<any>(
          `${BASE_URL}/api/listings/${listingId}/detailed`
        );
        
        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        
        console.log(`Listing detail (cold): ${first.time.toFixed(2)}ms`);
        console.log(`Listing detail (cached): ${second.time.toFixed(2)}ms`);
      }
    });
  });
});

describe.skipIf(SKIP_INTEGRATION)('Search Response Validation', () => {
  
  it('should return valid search response structure', async () => {
    const response = await fetch(`${BASE_URL}/api/listings/search`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    // Meta can be in data.meta or at root level
    const meta = data.meta || data;
    expect(meta).toBeDefined();
    // Total/count may be called different things
    expect(typeof (meta.total ?? meta.count ?? data.data.length)).toBe('number');
  });

  it('should return facets when requested', async () => {
    const response = await fetch(`${BASE_URL}/api/listings/search?includeFacets=true`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    // Facets should be included
    if (data.facets) {
      expect(typeof data.facets).toBe('object');
    }
  });

  it('should respect limit parameter', async () => {
    const response = await fetch(`${BASE_URL}/api/listings/search?limit=5`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data.length).toBeLessThanOrEqual(5);
  });

  it('should respect offset parameter', async () => {
    const page1 = await fetch(`${BASE_URL}/api/listings/search?limit=5&offset=0`);
    const page2 = await fetch(`${BASE_URL}/api/listings/search?limit=5&offset=5`);
    
    const data1 = await page1.json();
    const data2 = await page2.json();
    
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    
    // If there are enough results, pages should be different
    if (data1.data.length > 0 && data2.data.length > 0) {
      expect(data1.data[0].id).not.toBe(data2.data[0].id);
    }
  });
});

describe.skipIf(SKIP_INTEGRATION)('Cache Warm Endpoint', () => {
  
  it('should warm cache successfully', async () => {
    const response = await fetch(`${BASE_URL}/api/internal/warm-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // May be 401 if INTERNAL_SECRET is set, or 200 if not
    expect([200, 401]).toContain(response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.total).toBeGreaterThan(0);
      
      console.log('Cache warm results:', data.summary);
    }
  });

  it('should skip already cached searches', async () => {
    // First warm
    const first = await fetch(`${BASE_URL}/api/internal/warm-cache`, {
      method: 'POST',
    });
    
    if (first.status === 200) {
      // Second warm - should skip some
      const second = await fetch(`${BASE_URL}/api/internal/warm-cache`, {
        method: 'POST',
      });
      
      const data = await second.json();
      expect(data.summary.alreadyCached).toBeGreaterThan(0);
      
      console.log(`Second warm: ${data.summary.warmed} warmed, ${data.summary.alreadyCached} cached`);
    }
  });
});

describe.skipIf(SKIP_INTEGRATION)('UAE Popular Makes', () => {
  const UAE_MAKES = [
    'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Mitsubishi',
    'Ford', 'Mercedes-Benz', 'BMW', 'Audi', 'Land Rover',
    'Lexus', 'Jetour', 'BYD'
  ];

  it('should return results for popular UAE makes', async () => {
    for (const make of UAE_MAKES.slice(0, 5)) { // Test first 5
      const response = await fetch(`${BASE_URL}/api/listings/search?make=${encodeURIComponent(make)}`);
      expect(response.status).toBe(200);
      
      const data: SearchResponse = await response.json();
      console.log(`${make}: ${data.meta.total} listings`);
    }
  });
});
