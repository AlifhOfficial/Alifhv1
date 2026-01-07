/**
 * In-Memory Session Cache (v1)
 * 
 * Simple in-memory caching for session data. Note that in serverless environments
 * (Vercel), each instance maintains its own cache - it's not shared across containers.
 * This is acceptable for v1 as each instance builds its own cache over time.
 * 
 * When you need shared caching later, add Redis/Upstash here.
 * 
 * @module lib/redis
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

// Simple in-memory cache with TTL
const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_MAX_SIZE = 1000;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
      return null;
    }
    
    return entry.value;
  },
  
  /**
   * Set session data with TTL
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    // Simple LRU: if at max size, delete oldest entry
    if (memoryCache.size >= CACHE_MAX_SIZE) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
    
    memoryCache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  },
  
  /**
   * Delete session data
   */
  async delete(key: string): Promise<void> {
    memoryCache.delete(key);
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
    
    keysToDelete.forEach(key => memoryCache.delete(key));
  },
};

export type SessionCache = typeof sessionCache;
