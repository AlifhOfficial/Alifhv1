/**
 * Memory Cache - DISABLED (No-Op)
 * 
 * Cache is currently disabled. All operations are no-ops.
 * This maintains the same interface so all existing code continues to work.
 * 
 * TODO: Implement Redis/Upstash for proper distributed caching
 * 
 * @module caches/memory-cache
 */

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

/**
 * No-Op Cache - Does nothing but maintains interface
 * All methods are safe to call but have no effect
 */
class NoOpCache {
  /** Always returns null - cache disabled */
  get<T>(_key: string): T | null {
    return null;
  }

  /** Does nothing - cache disabled */
  set<T>(_key: string, _value: T, _ttlSeconds: number = 60): void {
    // No-op
  }

  /** Does nothing - cache disabled */
  delete(..._keys: string[]): void {
    // No-op
  }

  /** Does nothing - cache disabled */
  deleteByPrefix(_prefix: string): number {
    return 0;
  }

  /** Does nothing - cache disabled */
  clear(): void {
    // No-op
  }

  /** Returns empty stats */
  getStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /** Does nothing */
  resetStats(): void {
    // No-op
  }

  /** Returns disabled cache info */
  info() {
    return {
      status: 'disabled',
      entries: { total: 0, expired: 0, active: 0 },
      performance: { hits: 0, misses: 0, hitRate: '0%' },
      operations: { sets: 0, deletes: 0 },
    };
  }

  /** Does nothing */
  destroy(): void {
    // No-op
  }
}

// Single instance - no need for globalThis since it stores nothing
export const memoryCache = new NoOpCache();

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
