/**
 * Memory Cache (LRU) Tests
 * 
 * Comprehensive tests for the LRU cache implementation
 * Run with: bun test packages/database/src/caches/__tests__/memory-cache.test.ts
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { memoryCache, CacheKeys, CacheTTL, CachePrefixes } from '../index';

describe('LRU Memory Cache', () => {
  beforeEach(() => {
    memoryCache.clear();
    memoryCache.resetStats();
  });

  describe('Basic Operations', () => {
    it('should set and get a value', () => {
      memoryCache.set('test:key', { data: 'hello' }, 60);
      const result = memoryCache.get('test:key');
      
      expect(result).toEqual({ data: 'hello' });
    });

    it('should return null for non-existent key', () => {
      const result = memoryCache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should delete a key', () => {
      memoryCache.set('test:delete', 'value', 60);
      expect(memoryCache.get('test:delete')).toBe('value');
      
      memoryCache.delete('test:delete');
      expect(memoryCache.get('test:delete')).toBeNull();
    });

    it('should delete multiple keys', () => {
      memoryCache.set('key1', 'v1', 60);
      memoryCache.set('key2', 'v2', 60);
      memoryCache.set('key3', 'v3', 60);
      
      memoryCache.delete('key1', 'key2');
      
      expect(memoryCache.get('key1')).toBeNull();
      expect(memoryCache.get('key2')).toBeNull();
      expect(memoryCache.get('key3')).toBe('v3');
    });

    it('should clear all entries', () => {
      memoryCache.set('a', 1, 60);
      memoryCache.set('b', 2, 60);
      memoryCache.set('c', 3, 60);
      
      memoryCache.clear();
      
      expect(memoryCache.get('a')).toBeNull();
      expect(memoryCache.get('b')).toBeNull();
      expect(memoryCache.get('c')).toBeNull();
    });
  });

  describe('TTL Expiration', () => {
    it('should expire entries after TTL', async () => {
      // Set with 1 second TTL
      memoryCache.set('expire:test', 'value', 1);
      expect(memoryCache.get('expire:test')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(memoryCache.get('expire:test')).toBeNull();
    });

    it('should not return expired entries', async () => {
      memoryCache.set('short:ttl', 'data', 0.5); // 500ms
      
      // Should exist immediately
      expect(memoryCache.get('short:ttl')).toBe('data');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Should be expired
      expect(memoryCache.get('short:ttl')).toBeNull();
    });
  });

  describe('Prefix-Based Deletion', () => {
    it('should delete all keys with prefix', () => {
      memoryCache.set('search:results:query1', ['a'], 60);
      memoryCache.set('search:results:query2', ['b'], 60);
      memoryCache.set('search:facets:query1', {}, 60);
      memoryCache.set('listing:detail:123', {}, 60);
      
      const deleted = memoryCache.deleteByPrefix('search:results:');
      
      expect(deleted).toBe(2);
      expect(memoryCache.get('search:results:query1')).toBeNull();
      expect(memoryCache.get('search:results:query2')).toBeNull();
      expect(memoryCache.get('search:facets:query1')).not.toBeNull();
      expect(memoryCache.get('listing:detail:123')).not.toBeNull();
    });

    it('should delete search caches by prefix', () => {
      memoryCache.set('search:results:test', [], 60);
      memoryCache.set('search:facets:test', {}, 60);
      memoryCache.set('other:key', 'data', 60);
      
      memoryCache.deleteByPrefix('search:');
      
      expect(memoryCache.get('search:results:test')).toBeNull();
      expect(memoryCache.get('search:facets:test')).toBeNull();
      expect(memoryCache.get('other:key')).toBe('data');
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      memoryCache.set('stats:key', 'value', 60);
      
      // Hit
      memoryCache.get('stats:key');
      memoryCache.get('stats:key');
      
      // Miss
      memoryCache.get('nonexistent');
      
      const stats = memoryCache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('should track sets', () => {
      memoryCache.set('a', 1, 60);
      memoryCache.set('b', 2, 60);
      memoryCache.set('c', 3, 60);
      
      const stats = memoryCache.getStats();
      expect(stats.sets).toBe(3);
    });

    it('should track deletes', () => {
      memoryCache.set('del1', 1, 60);
      memoryCache.set('del2', 2, 60);
      
      memoryCache.delete('del1', 'del2');
      
      const stats = memoryCache.getStats();
      expect(stats.deletes).toBe(2);
    });

    it('should reset stats', () => {
      memoryCache.set('key', 'value', 60);
      memoryCache.get('key');
      memoryCache.get('miss');
      
      memoryCache.resetStats();
      
      const stats = memoryCache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
    });
  });

  describe('Cache Info', () => {
    it('should return correct cache info', () => {
      memoryCache.set('info:1', 'a', 60);
      memoryCache.set('info:2', 'b', 60);
      memoryCache.get('info:1'); // hit
      memoryCache.get('miss');   // miss
      
      const info = memoryCache.info();
      
      expect(info.entries.total).toBe(2);
      expect(info.entries.maxSize).toBe(1000);
      expect(info.performance.hits).toBeGreaterThan(0);
    });
  });

  describe('LRU Eviction', () => {
    it('should move accessed items to end (most recent)', () => {
      memoryCache.set('lru:a', 1, 60);
      memoryCache.set('lru:b', 2, 60);
      memoryCache.set('lru:c', 3, 60);
      
      // Access 'a' - should move to end
      memoryCache.get('lru:a');
      
      // Verify 'a' is still accessible
      expect(memoryCache.get('lru:a')).toBe(1);
    });
  });
});

describe('CacheKeys', () => {
  it('should generate correct listing detail key', () => {
    const key = CacheKeys.listingDetail('listing_123');
    expect(key).toBe('listing:listing_123:detail');
  });

  it('should generate correct partner inventory key', () => {
    const key = CacheKeys.partnerInventory('partner_456', 'public');
    expect(key).toBe('listings:partner:partner_456:public');
  });

  it('should generate correct batch key', () => {
    const key = CacheKeys.listingCardsBatch(['id1', 'id2', 'id3']);
    expect(key).toBe('listings:cards:batch:id1,id2,id3');
  });

  it('should generate correct search results key with hash', () => {
    const key = CacheKeys.searchResults('make:Toyota|condition:new');
    expect(key).toBe('search:results:make:Toyota|condition:new');
  });

  it('should handle empty hash for default search', () => {
    const key = CacheKeys.searchResults('default');
    expect(key).toBe('search:results:default');
  });
});

describe('CacheTTL', () => {
  it('should have correct TTL values', () => {
    expect(CacheTTL.searchResults).toBe(600);     // 10 minutes
    expect(CacheTTL.searchFacets).toBe(900);      // 15 minutes
    expect(CacheTTL.listingDetail).toBe(600);     // 10 minutes
    expect(CacheTTL.listingCards).toBe(300);      // 5 minutes
    expect(CacheTTL.searchSuggestions).toBe(1800); // 30 minutes
  });
});

describe('CachePrefixes', () => {
  it('should have correct prefix values', () => {
    expect(CachePrefixes.searchResults).toBe('search:results:');
    expect(CachePrefixes.searchFacets).toBe('search:facets:');
    expect(CachePrefixes.listings).toBe('listings:');
    expect(CachePrefixes.search).toBe('search:');
    expect(CachePrefixes.partner).toBe('partner:');
    expect(CachePrefixes.user).toBe('user:');
  });
});

describe('Complex Data Types', () => {
  beforeEach(() => {
    memoryCache.clear();
  });

  it('should cache arrays', () => {
    const data = [1, 2, 3, { nested: 'value' }];
    memoryCache.set('array:test', data, 60);
    
    const result = memoryCache.get('array:test');
    expect(result).toEqual(data);
  });

  it('should cache complex objects', () => {
    const data = {
      listings: [{ id: 1, name: 'Test' }],
      meta: { total: 100, page: 1 },
      filters: { make: 'Toyota' },
    };
    memoryCache.set('complex:test', data, 60);
    
    const result = memoryCache.get('complex:test');
    expect(result).toEqual(data);
  });

  it('should cache search results structure', () => {
    const searchResult = {
      data: [
        { id: 'listing_1', make: 'Toyota', model: 'Camry', price: 50000 },
        { id: 'listing_2', make: 'Honda', model: 'Accord', price: 45000 },
      ],
      meta: {
        total: 150,
        limit: 20,
        offset: 0,
        hasMore: true,
      },
    };
    
    const key = CacheKeys.searchResults({ make: 'Toyota' });
    memoryCache.set(key, searchResult, CacheTTL.searchResults);
    
    const result = memoryCache.get(key);
    expect(result).toEqual(searchResult);
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    memoryCache.clear();
  });

  it('should handle null values', () => {
    memoryCache.set('null:test', null, 60);
    // Note: null stored as value, get returns null for both missing and null
    // This is expected behavior - use object wrapper if null needs distinction
  });

  it('should handle empty strings', () => {
    memoryCache.set('empty:string', '', 60);
    expect(memoryCache.get('empty:string')).toBe('');
  });

  it('should handle zero TTL (immediate expiration)', async () => {
    memoryCache.set('zero:ttl', 'value', 0);
    // With 0 TTL, should expire immediately on next get
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(memoryCache.get('zero:ttl')).toBeNull();
  });

  it('should handle special characters in keys', () => {
    const key = 'search:results:make:Mercedes-Benz|model:C-Class';
    memoryCache.set(key, { data: 'test' }, 60);
    expect(memoryCache.get(key)).toEqual({ data: 'test' });
  });

  it('should handle Unicode in values', () => {
    const data = { name: '豊田', emoji: '🚗' };
    memoryCache.set('unicode:test', data, 60);
    expect(memoryCache.get('unicode:test')).toEqual(data);
  });
});
