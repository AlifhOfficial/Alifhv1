/**
 * Upstash Redis Client
 * 
 * Used for session caching in serverless environment.
 * Free tier: 500K commands/month - sufficient for ~1000 users/day.
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL: Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Redis REST API token
 * 
 * @module lib/redis
 */

import { Redis } from '@upstash/redis';

// Lazy initialization to avoid errors when env vars are not set
let redisInstance: Redis | null = null;

/**
 * Get Redis client instance (singleton)
 * Returns null if environment variables are not configured
 */
export function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set - session caching disabled');
    }
    return null;
  }
  
  redisInstance = new Redis({ url, token });
  return redisInstance;
}

/**
 * Redis-backed cache for session data
 * Falls back gracefully if Redis is not configured
 */
export const sessionCache = {
  /**
   * Get cached session data
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch (error) {
      console.error('[Redis] Get error:', error);
      return null;
    }
  },
  
  /**
   * Set session data with TTL
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error('[Redis] Set error:', error);
    }
  },
  
  /**
   * Delete session data
   */
  async delete(key: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    
    try {
      await redis.del(key);
    } catch (error) {
      console.error('[Redis] Delete error:', error);
    }
  },
  
  /**
   * Delete all keys matching a pattern (e.g., user:* for all user sessions)
   */
  async deleteByPattern(pattern: string): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    
    try {
      // Scan and delete matching keys
      let cursor = 0;
      do {
        const [newCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
        cursor = Number(newCursor);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== 0);
    } catch (error) {
      console.error('[Redis] DeleteByPattern error:', error);
    }
  },
};

export type SessionCache = typeof sessionCache;
