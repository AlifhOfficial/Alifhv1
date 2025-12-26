/**
 * Unified Rate Limiter for API Routes
 * 
 * Features:
 * - Uses shared memory cache (works better than local Map in serverless)
 * - Configurable window and limits per route type
 * - Automatic cleanup via cache TTL
 * 
 * @module lib/api/rate-limit
 */

import { memoryCache } from '@alifh/database';

interface RateLimitConfig {
  /** Rate limit window in seconds */
  windowSeconds: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Prefix for cache keys (e.g., 'listings:create', 'listings:browse') */
  keyPrefix: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Create a rate limiter with the given configuration
 * 
 * @example
 * ```ts
 * const browseRateLimiter = createRateLimiter({
 *   windowSeconds: 60,
 *   maxRequests: 200,
 *   keyPrefix: 'listings:browse',
 * });
 * 
 * const result = browseRateLimiter(clientIp);
 * if (!result.allowed) {
 *   return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowSeconds, maxRequests, keyPrefix } = config;
  const windowMs = windowSeconds * 1000;

  return function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const cacheKey = `ratelimit:${keyPrefix}:${identifier}`;
    
    const entry = memoryCache.get<RateLimitEntry>(cacheKey);

    if (!entry || now > entry.resetAt) {
      // New window - create fresh entry
      const newEntry: RateLimitEntry = { 
        count: 1, 
        resetAt: now + windowMs 
      };
      memoryCache.set(cacheKey, newEntry, windowSeconds);
      return { 
        allowed: true, 
        remaining: maxRequests - 1, 
        resetAt: newEntry.resetAt 
      };
    }

    if (entry.count >= maxRequests) {
      // Rate limited
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: entry.resetAt 
      };
    }

    // Increment counter
    entry.count++;
    memoryCache.set(cacheKey, entry, Math.ceil((entry.resetAt - now) / 1000));
    
    return { 
      allowed: true, 
      remaining: maxRequests - entry.count, 
      resetAt: entry.resetAt 
    };
  };
}

// Pre-configured rate limiters for common use cases
// Tuned for ~20K MAU, ~50 listings/day scale

export const listingBrowseRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 300, // Relaxed: 300 req/min per IP (was 200)
  keyPrefix: 'listings:browse',
});

export const listingCreateRateLimiter = createRateLimiter({
  windowSeconds: 86400, // 24 hours
  maxRequests: 5, // 5 listings per day per user (prevents spam, allows power users)
  keyPrefix: 'listings:create',
});

/**
 * Generate rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult, maxRequests: number) {
  return {
    'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
    'X-RateLimit-Limit': String(maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
