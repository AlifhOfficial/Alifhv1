/**
 * Rate Limiting - Standardized Implementation
 * 
 * Built on top of memoryCache for distributed rate limiting.
 * Works in serverless and traditional environments.
 * 
 * USAGE:
 * ```ts
 * import { createRateLimiter, RATE_LIMITS_AUTH } from '@/lib/rate-limit';
 * 
 * const authLimiter = createRateLimiter(RATE_LIMITS_AUTH.AUTH_GENERAL);
 * 
 * // In API route
 * const identifier = userId || ip; // User ID for auth, IP for public
 * const { success, remaining } = await authLimiter.check(identifier);
 * 
 * if (!success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 * 
 * @module lib/rate-limit
 */

import { memoryCache } from '@alifh/database';
import type { RateLimitConfig } from './config';

export * from './config';

/**
 * Rate limit check result
 */
interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** When the window resets (unix timestamp) */
  reset: number;
  /** Total requests allowed in window */
  limit: number;
}

/**
 * Rate limiter instance
 */
interface RateLimiter {
  check: (identifier: string) => Promise<RateLimitResult>;
  reset: (identifier: string) => void;
}

/**
 * Create a rate limiter instance
 * 
 * @param config - Rate limit configuration
 * @returns Rate limiter with check() and reset() methods
 * 
 * @example
 * ```ts
 * const authLimiter = createRateLimiter(RATE_LIMITS_AUTH.AUTH_GENERAL);
 * const { success } = await authLimiter.check('user-id');
 * ```
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const { windowSeconds, maxRequests, keyPrefix } = config;

  /**
   * Check if request is allowed under rate limit
   */
  async function check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSeconds * 1000)) * (windowSeconds * 1000);
    const reset = windowStart + windowSeconds * 1000;
    
    // Create cache key: prefix:identifier:windowStart
    const cacheKey = `${keyPrefix}:${identifier}:${windowStart}`;

    // Get current count
    const current = memoryCache.get<number>(cacheKey) || 0;

    // Check if limit exceeded
    if (current >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset,
        limit: maxRequests,
      };
    }

    // Increment counter
    const newCount = current + 1;
    memoryCache.set(cacheKey, newCount, windowSeconds);

    return {
      success: true,
      remaining: maxRequests - newCount,
      reset,
      limit: maxRequests,
    };
  }

  /**
   * Reset rate limit for an identifier
   * Useful for testing or admin overrides
   */
  function reset(identifier: string): void {
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSeconds * 1000)) * (windowSeconds * 1000);
    const cacheKey = `${keyPrefix}:${identifier}:${windowStart}`;
    memoryCache.delete(cacheKey);
  }

  return { check, reset };
}

/**
 * Rate limit middleware helper
 * 
 * Returns standardized error response with headers
 * 
 * @example
 * ```ts
 * const result = await limiter.check(userId);
 * if (!result.success) {
 *   return rateLimitResponse(result);
 * }
 * ```
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Get identifier from request
 * 
 * Priority:
 * 1. User ID (if authenticated)
 * 2. IP address (from headers)
 * 3. Fallback to 'anonymous'
 * 
 * @example
 * ```ts
 * const identifier = getIdentifier(request, userId);
 * const result = await limiter.check(identifier);
 * ```
 */
export function getIdentifier(
  request: Request,
  userId?: string | null
): string {
  // Use user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  const ip = cfConnecting || realIp || forwarded?.split(',')[0]?.trim();

  if (ip) {
    return `ip:${ip}`;
  }

  // Fallback (should rarely happen)
  return 'anonymous';
}

/**
 * Combine multiple rate limiters with AND logic
 * All limiters must pass for request to succeed
 * 
 * @example
 * ```ts
 * const result = await combineRateLimiters(
 *   identifier,
 *   authLimiter,
 *   ipLimiter
 * );
 * ```
 */
export async function combineRateLimiters(
  identifier: string,
  ...limiters: RateLimiter[]
): Promise<RateLimitResult> {
  for (const limiter of limiters) {
    const result = await limiter.check(identifier);
    if (!result.success) {
      return result; // Return first failure
    }
  }

  // All passed - return last result
  const lastResult = await limiters[limiters.length - 1].check(identifier);
  return lastResult;
}
