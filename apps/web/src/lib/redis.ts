/**
 * Unified Session Cache (v1)
 * 
 * Single in-memory cache for all session data with proper invalidation.
 * Supports cache-busting by userId even when cached by token.
 * 
 * Cache strategy:
 * - Sessions cached by both token key AND userId key
 * - Token->userId mapping maintained for cross-invalidation
 * - 5 minute TTL standardized across the system
 * - When invalidating by userId, all associated token caches are cleared
 * 
 * Note: In serverless (Vercel), each instance maintains its own cache.
 * For v2, migrate to Redis/Upstash for shared caching.
 * 
 * @module lib/redis
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

// Simple in-memory cache with TTL
const memoryCache = new Map<string, CacheEntry<unknown>>();

// Token -> userId mapping for invalidation
// When we cache by token, we also store which userId owns that token
const tokenToUserMap = new Map<string, string>();
// userId -> Set<tokenKeys> for reverse lookup during invalidation
const userToTokensMap = new Map<string, Set<string>>();

const CACHE_MAX_SIZE = 2000;
const DEFAULT_TTL_SECONDS = 300; // 5 minutes - standardized

/**
 * In-memory cache for session data
 * Compatible with the previous Redis interface for easy migration
 */
export const sessionCache = {
  /**
   * Get cached session data
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() > entry.expires) {
      memoryCache.delete(key);
      // Clean up mappings if this was a token key
      const userId = tokenToUserMap.get(key);
      if (userId) {
        tokenToUserMap.delete(key);
        userToTokensMap.get(userId)?.delete(key);
      }
      return null;
    }
    
    return entry.value;
  },
  
  /**
   * Set session data with TTL
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    // Simple LRU: if at max size, delete oldest entry
    if (memoryCache.size >= CACHE_MAX_SIZE) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) {
        memoryCache.delete(firstKey);
        // Clean up mappings
        const userId = tokenToUserMap.get(firstKey);
        if (userId) {
          tokenToUserMap.delete(firstKey);
          userToTokensMap.get(userId)?.delete(firstKey);
        }
      }
    }
    
    memoryCache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  },

  /**
   * Set session data with token->userId mapping for invalidation
   * Used by proxy to cache by token while enabling userId-based invalidation
   */
  async setWithMapping<T>(tokenKey: string, value: T, userId: string, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    await this.set(tokenKey, value, ttlSeconds);
    
    // Register token->userId mapping
    tokenToUserMap.set(tokenKey, userId);
    
    // Register reverse mapping
    if (!userToTokensMap.has(userId)) {
      userToTokensMap.set(userId, new Set());
    }
    userToTokensMap.get(userId)!.add(tokenKey);
  },
  
  /**
   * Delete session data
   */
  async delete(key: string): Promise<void> {
    memoryCache.delete(key);
    // Clean up mappings if this was a token key
    const userId = tokenToUserMap.get(key);
    if (userId) {
      tokenToUserMap.delete(key);
      userToTokensMap.get(userId)?.delete(key);
    }
  },

  /**
   * Invalidate all sessions for a user (by userId)
   * Clears both the userId-keyed cache AND all token-keyed caches for this user
   */
  async invalidateUser(userId: string): Promise<void> {
    // Delete the userId-keyed session cache (format: user:{userId}:session)
    const userSessionKey = `user:${userId}:session`;
    memoryCache.delete(userSessionKey);
    
    // Delete all token-keyed caches for this user
    const tokenKeys = userToTokensMap.get(userId);
    if (tokenKeys) {
      for (const tokenKey of tokenKeys) {
        memoryCache.delete(tokenKey);
        tokenToUserMap.delete(tokenKey);
      }
      userToTokensMap.delete(userId);
    }
  },
  
  /**
   * Delete all keys matching a pattern (e.g., user:* for all user sessions)
   * Simple implementation for in-memory - filters by prefix
   */
  async deleteByPattern(pattern: string): Promise<void> {
    // Convert glob pattern to simple prefix match (e.g., "user:*" -> "user:")
    const prefix = pattern.replace('*', '');
    
    const keysToDelete: string[] = [];
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      await this.delete(key);
    }
  },
};

/**
 * Invalidate session by token key
 * Exported for use in auth flows
 */
export async function invalidateSessionByToken(tokenKey: string): Promise<void> {
  await sessionCache.delete(tokenKey);
}

/**
 * Invalidate all sessions for a user
 * This is the main invalidation function to use after profile/role updates
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  await sessionCache.invalidateUser(userId);
}

export type SessionCache = typeof sessionCache;
