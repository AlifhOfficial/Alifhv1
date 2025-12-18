/**
 * Simple In-Memory Cache for Bun
 * Lightweight alternative to Redis for MVP
 * 
 * Uses Map for O(1) lookups - Bun's JS engine is blazing fast
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Auto-cleanup expired entries every 60 seconds
    if (typeof globalThis.Bun !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
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
  }

  /**
   * Delete key from cache
   */
  delete(...keys: string[]): void {
    for (const key of keys) {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    let expired = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) expired++;
    }
    
    return {
      total: this.cache.size,
      expired,
      active: this.cache.size - expired,
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

// Singleton instance
export const memoryCache = new MemoryCache();

/**
 * Cache Keys
 */
export const CacheKeys = {
  userFavorites: (userId: string) => `user:${userId}:favorites`,
  userSuperlikes: (userId: string) => `user:${userId}:superlikes`,
  userSession: (userId: string) => `user:${userId}:session`,
  listingDetail: (listingId: string) => `listing:${listingId}:detail`,
} as const;

/**
 * Cache TTL (seconds)
 */
export const CacheTTL = {
  userFavorites: 30, // 30 seconds - frequently updated
  userSession: 30, // 30 seconds - session data (role, partner memberships)
  listingDetail: 300, // 5 minutes
} as const;
