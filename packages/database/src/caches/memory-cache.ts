/**
 * Memory Cache - LRU with TTL
 * 
 * In-memory LRU cache with TTL support for serverless functions.
 * Designed for Next.js serverless environment:
 * - Fast O(1) operations using Map
 * - Automatic TTL expiration
 * - LRU eviction when max size reached
 * - Prefix-based invalidation for smart cache busting
 * 
 * Note: This is process-local. In a multi-instance deployment,
 * each instance maintains its own cache. For distributed caching,
 * consider Redis/Upstash.
 * 
 * @module caches/memory-cache
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  cleanupInterval: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 1000,           // Max 1000 entries (balance memory vs hit rate)
  defaultTtl: 60,          // 60 second default TTL
  cleanupInterval: 30000,  // Cleanup expired entries every 30 seconds
};

/**
 * LRU Cache with TTL Support
 * 
 * Uses Map for O(1) operations with LRU semantics:
 * - Map maintains insertion order
 * - Delete + set moves item to end (most recent)
 * - First items are oldest (evict first)
 */
class LRUCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private stats: CacheStats;
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
    
    // Start cleanup timer
    this.startCleanup();
  }

  private startCleanup(): void {
    // Cleanup expired entries periodically
    this.cleanupTimer = setInterval(() => {
      this.removeExpired();
    }, this.config.cleanupInterval);
    
    // Don't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  private removeExpired(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    return removed;
  }

  private evictLRU(): void {
    // Evict oldest entries (first in Map) until under maxSize
    const toEvict = Math.max(1, Math.floor(this.config.maxSize * 0.1)); // Evict 10% at a time
    let evicted = 0;
    
    for (const key of this.cache.keys()) {
      if (evicted >= toEvict) break;
      this.cache.delete(key);
      evicted++;
    }
  }

  /** Get value from cache, returns null if not found or expired */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check TTL
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Move to end (most recently used) - delete and re-add
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.stats.hits++;
    return entry.value as T;
  }

  /** Set value with TTL (seconds) */
  set<T>(key: string, value: T, ttlSeconds: number = this.config.defaultTtl): void {
    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }
    
    // Delete first to ensure it goes to end of Map
    this.cache.delete(key);
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
    
    this.stats.sets++;
  }

  /** Delete one or more keys */
  delete(...keys: string[]): void {
    for (const key of keys) {
      if (this.cache.delete(key)) {
        this.stats.deletes++;
      }
    }
  }

  /** Delete all keys matching a prefix, returns count deleted */
  deleteByPrefix(prefix: string): number {
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.deletes += deleted;
    return deleted;
  }

  /** Clear all cache entries */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  /** Get cache statistics */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /** Reset statistics */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
  }

  /** Get detailed cache info */
  info() {
    const now = Date.now();
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.expiresAt <= now) expired++;
    }
    
    const stats = this.getStats();
    
    return {
      status: 'active',
      entries: {
        total: this.cache.size,
        expired,
        active: this.cache.size - expired,
        maxSize: this.config.maxSize,
      },
      performance: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
      },
      operations: {
        sets: stats.sets,
        deletes: stats.deletes,
      },
    };
  }

  /** Cleanup resources */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// Singleton instance - use globalThis to survive hot reloads in development
const globalKey = '__alifh_memory_cache__';
const globalObj = globalThis as unknown as { [key: string]: LRUCache };

if (!globalObj[globalKey]) {
  globalObj[globalKey] = new LRUCache({
    maxSize: 1000,
    defaultTtl: 60,
    cleanupInterval: 30000,
  });
}

export const memoryCache = globalObj[globalKey];

/**
 * Session Token Mapping for Proxy Cache Invalidation
 * 
 * The proxy caches sessions by token for fast lookup, but we need to
 * invalidate by userId when user data changes. These maps track:
 * - tokenToUserMap: which userId owns each token
 * - userToTokensMap: all tokens belonging to each userId
 */
const tokenMappingKey = '__alifh_token_mapping__';
const tokenMappingObj = globalThis as unknown as {
  [key: string]: {
    tokenToUser: Map<string, string>;
    userToTokens: Map<string, Set<string>>;
  };
};

if (!tokenMappingObj[tokenMappingKey]) {
  tokenMappingObj[tokenMappingKey] = {
    tokenToUser: new Map(),
    userToTokens: new Map(),
  };
}

const { tokenToUser, userToTokens } = tokenMappingObj[tokenMappingKey];

/**
 * Session cache wrapper with token-to-user mapping support
 * Used by proxy for efficient session caching with userId-based invalidation
 */
export const sessionCache = {
  /** Get session from cache */
  get<T>(key: string): T | null {
    return memoryCache.get<T>(key);
  },

  /** Set session with optional TTL */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    memoryCache.set(key, value, ttlSeconds);
  },

  /** Set session and register token->userId mapping for invalidation */
  setWithMapping<T>(tokenKey: string, value: T, userId: string, ttlSeconds: number = CacheTTL.userSession): void {
    memoryCache.set(tokenKey, value, ttlSeconds);
    
    // Register token->userId mapping
    tokenToUser.set(tokenKey, userId);
    
    // Register reverse mapping
    if (!userToTokens.has(userId)) {
      userToTokens.set(userId, new Set());
    }
    userToTokens.get(userId)!.add(tokenKey);
  },

  /** Delete session and clean up mappings */
  delete(key: string): void {
    memoryCache.delete(key);
    // Clean up mappings if this was a token key
    const userId = tokenToUser.get(key);
    if (userId) {
      tokenToUser.delete(key);
      userToTokens.get(userId)?.delete(key);
    }
  },

  /** Invalidate all sessions for a user (by userId) */
  invalidateUser(userId: string): void {
    // Delete the userId-keyed session cache
    const userSessionKey = CacheKeys.userSession(userId);
    memoryCache.delete(userSessionKey);
    
    // Delete all token-keyed caches for this user
    const tokens = userToTokens.get(userId);
    if (tokens) {
      for (const tokenKey of tokens) {
        memoryCache.delete(tokenKey);
        tokenToUser.delete(tokenKey);
      }
      userToTokens.delete(userId);
    }
  },
};

/**
 * Invalidate all sessions for a user
 * Exported helper function for use in auth flows
 */
export function invalidateUserSessions(userId: string): void {
  sessionCache.invalidateUser(userId);
}

/**
 * Cache Keys
 */
export const CacheKeys = {
  // User data
  userById: (userId: string) => `user:${userId}:data`,
  userSession: (userId: string) => `user:${userId}:session`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userUnreadCount: (userId: string) => `user:${userId}:unread-count`,
  userMyListings: (userId: string) => `user:${userId}:my-listings`,
  userBookings: (userId: string) => `user:${userId}:bookings`,
  
  // Listing data
  listingDetail: (listingId: string) => `listing:${listingId}:detail`,
  listingCards: (filters: string) => `listings:cards:${filters}`,
  listingCardsBatch: (ids: string[]) => `listings:cards:batch:${ids.sort().join(',')}`,
  
  // Search results and facets
  searchResults: (hash: string) => `search:results:${hash}`,
  searchFacets: (facet: string, hash: string) => `search:facets:${facet}:${hash}`,
  searchSuggestions: (query: string) => `search:suggestions:${query.toLowerCase().trim()}`,
  
  // Partner data
  partnerInventory: (partnerId: string, status?: string) => `listings:partner:${partnerId}:${status || 'all'}`,
  partnerMiniProfile: (partnerId: string) => `partner:${partnerId}:mini`,
  dealerBaseProfile: (partnerId: string) => `partner:${partnerId}:dealer-base`,
  partnerProfileComprehensive: (partnerId: string) => `partner:${partnerId}:profile-comprehensive`,
  userToPartnerId: (userId: string) => `user:${userId}:partnerId`,
  partnerStats: (partnerId: string) => `partner:${partnerId}:stats`,
} as const;

/**
 * Cache TTL (seconds)
 * 
 * With proper invalidation in place, we use longer TTLs.
 * Cache is cleared immediately when data changes, so TTL only matters
 * for data that hasn't been modified.
 */
export const CacheTTL = {
  // User data
  userById: 300, // 5 minutes - user record (invalidate on updates)
  userSession: 300, // 5 minutes - session data (role, partner memberships)
  userProfile: 300, // 5 minutes - user profile (invalidate on updates)
  userUnreadCount: 60, // 1 minute - unread message count (invalidated on new message/read)
  userMyListings: 0, // disabled - no caching
  userBookings: 0, // disabled - no caching
  
  // Listing data - invalidated on any listing mutation
  listingDetail: 600, // 10 minutes - full listing details
  listingCards: 300, // 5 minutes - listing cards (invalidated on listing changes)
  listingCardsBatch: 300, // 5 minutes - batch requests
  
  // Search - invalidated on any listing mutation
  searchResults: 600, // 10 minutes - search results (invalidated on listing changes)
  searchFacets: 900, // 15 minutes - facet counts (invalidated on listing changes)
  searchSuggestions: 1800, // 30 minutes - autocomplete suggestions
  
  // Partner data - invalidated on partner/listing changes
  partnerInventory: 300, // 5 minutes - partner inventory pages
  partnerMiniProfile: 300, // 5 minutes - partner mini profile
  dealerBaseProfile: 300, // 5 minutes - dealer base profile (invalidated on profile updates)
  partnerProfileComprehensive: 300, // 5 minutes - full partner profile (invalidated on profile updates)
  userToPartnerId: 600, // 10 minutes - user to partner mapping (rarely changes)
  partnerStats: 600, // 10 minutes - partner stats (expensive aggregation)
} as const;

/**
 * Cache Prefixes for bulk invalidation
 */
export const CachePrefixes = {
  search: 'search:',
  searchResults: 'search:results:',
  searchFacets: 'search:facets:',
  listings: 'listings:',
  partner: 'partner:',
  user: 'user:',
} as const;
