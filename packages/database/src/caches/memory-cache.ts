/**
 * Memory Cache - Production
 * 
 * In-memory caching layer for frequently accessed database queries.
 * Lightweight Redis alternative for MVP with automatic cleanup.
 * 
 * USAGE:
 * - Session data (5min TTL) - prevents N+1 auth queries
 * - User favorites (30s TTL) - reduces listing page load
 * - Listing details (5min TTL) - caches rarely-changing data
 * 
 * ARCHITECTURE:
 * - Uses native Map for O(1) lookups (Bun's JS engine is optimized)
 * - TTL-based expiration with lazy deletion on access
 * - Background cleanup every 60s to prevent memory leaks
 * - Single instance per Node/Bun process (singleton pattern)
 * 
 * DEPLOYMENT:
 * - Works in serverless (each instance has isolated cache)
 * - No shared state across instances (stateless design)
 * - Memory usage: ~100KB per 1000 entries
 * - Auto-destroys on process exit
 * 
 * MIGRATION PATH:
 * When scaling beyond single-server:
 * 1. Replace with Redis/Valkey for distributed caching
 * 2. Update CacheKeys to use Redis key patterns
 * 3. Implement pub/sub for cache invalidation
 * 4. Keep same interface - minimal code changes needed
 * 
 * @module caches/memory-cache
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor() {
    // Background cleanup every 60s to prevent memory bloat
    if (typeof globalThis.Bun !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
    this.stats.sets++;
  }

  /**
   * Delete key from cache
   */
  delete(...keys: string[]): void {
    for (const key of keys) {
      this.cache.delete(key);
      this.stats.deletes++;
    }
  }

  /**
   * Delete all keys matching a prefix
   * Useful for invalidating families of cached queries (e.g. listings cards).
   *
   * @returns number of deleted keys
   */
  deleteByPrefix(prefix: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats with hit rate
   */
  getStats(): CacheStats {
    let expired = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) expired++;
    }
    
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimals
    };
  }

  /**
   * Reset stats counters
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get cache info (for monitoring)
   */
  info() {
    let expired = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) expired++;
    }
    
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      entries: {
        total: this.cache.size,
        expired,
        active: this.cache.size - expired,
      },
      performance: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${Math.round(hitRate * 100) / 100}%`,
      },
      operations: {
        sets: this.stats.sets,
        deletes: this.stats.deletes,
      },
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    }
    
    for (const key of toDelete) {
      this.cache.delete(key);
    }
    
    if (toDelete.length > 0) {
      console.log(`[MemoryCache] Cleaned up ${toDelete.length} expired entries`);
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Singleton instance that survives hot reloads in development
// Use globalThis to persist across module re-evaluations
const globalForCache = globalThis as unknown as { 
  memoryCache: MemoryCache | undefined 
};

export const memoryCache = globalForCache.memoryCache ?? new MemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.memoryCache = memoryCache;
}

/**
 * Cache Keys
 */
export const CacheKeys = {
  userById: (userId: string) => `user:${userId}:data`,
  userSession: (userId: string) => `user:${userId}:session`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  listingDetail: (listingId: string) => `listing:${listingId}:detail`,
  listingCards: (filters: string) => `listings:cards:${filters}`,
  listingCardsBatch: (ids: string[]) => `listings:cards:batch:${ids.sort().join(',')}`,
  partnerInventory: (partnerId: string, status?: string) => `listings:partner:${partnerId}:${status || 'all'}`,
  partnerMiniProfile: (partnerId: string) => `partner:${partnerId}:mini`,
  partnerStats: (partnerId: string) => `partner:${partnerId}:stats`,
} as const;

/**
 * Cache TTL (seconds)
 */
export const CacheTTL = {
  userById: 120, // 2 minutes - user record (invalidate on updates)
  userSession: 300, // 5 minutes - session data (role, partner memberships)
  userProfile: 120, // 2 minutes - user profile (invalidate on updates)
  listingDetail: 120, // 2 minutes - full listing details
  listingCards: 30, // 30 seconds - listing cards (main browse page) - short TTL, invalidated on new listings
  listingCardsBatch: 30, // 30 seconds - batch requests
  partnerInventory: 60, // 1 minute - partner inventory pages - invalidated on changes
  partnerMiniProfile: 60, // 1 minute - partner mini profile (matches API revalidate)
  partnerStats: 300, // 5 minutes - partner stats (expensive aggregation)
} as const;
