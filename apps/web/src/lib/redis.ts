/**
 * Upstash Redis Client — Session Cache
 *
 * Used for:
 * - Session caching in proxy (avoids DB hit on every authenticated request)
 *
 * @module lib/redis
 */

import { Redis } from '@upstash/redis';

/**
 * Singleton Upstash Redis client.
 * Uses REST API — works in Edge Runtime, serverless, and Node.js.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============================================================================
// Session Cache Helpers
// ============================================================================

/** Session TTL: 5 minutes — matches proxy session freshness needs */
const SESSION_TTL = 300;

/** Key prefix for session cache entries */
const SESSION_PREFIX = 'session:';

/**
 * Get cached session data from Redis.
 * Returns null on cache miss or Redis error (fail-open).
 */
export async function getCachedSession<T>(sessionToken: string): Promise<T | null> {
  try {
    return await redis.get<T>(`${SESSION_PREFIX}${sessionToken}`);
  } catch (error) {
    // Fail open — if Redis is down, just hit the DB
    console.warn('[Redis] getCachedSession error, falling through to DB:', error);
    return null;
  }
}

/**
 * Cache session data in Redis with TTL.
 * Fire-and-forget — doesn't block the request.
 */
export function setCachedSession(sessionToken: string, data: unknown): void {
  redis
    .set(`${SESSION_PREFIX}${sessionToken}`, data, { ex: SESSION_TTL })
    .catch((error) => {
      console.warn('[Redis] setCachedSession error:', error);
    });
}

/**
 * Invalidate a cached session (e.g., on logout, ban, role change).
 */
export async function invalidateCachedSession(sessionToken: string): Promise<void> {
  try {
    await redis.del(`${SESSION_PREFIX}${sessionToken}`);
  } catch (error) {
    console.warn('[Redis] invalidateCachedSession error:', error);
  }
}
