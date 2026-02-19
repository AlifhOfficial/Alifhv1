/**
 * Rate Limiting — Upstash Redis (Distributed)
 *
 * Uses `@upstash/ratelimit` with sliding window algorithm.
 * Shared across all Railway instances via Upstash Redis.
 *
 * USAGE:
 * ```ts
 * import { createRateLimiter, RATE_LIMITS_AUTH } from '@/lib/rate-limit';
 *
 * const authLimiter = createRateLimiter(RATE_LIMITS_AUTH.AUTH_GENERAL);
 *
 * const identifier = getIdentifier(request, userId);
 * const { success } = await authLimiter.check(identifier);
 *
 * if (!success) {
 *   return rateLimitResponse(result);
 * }
 * ```
 *
 * @module lib/rate-limit
 */

import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';
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
  reset: (identifier: string) => Promise<void>;
}

/**
 * Create a distributed rate limiter backed by Upstash Redis.
 *
 * Uses sliding window algorithm for accurate limiting.
 * Fail-open: if Redis is unreachable, requests are allowed through.
 *
 * @param config - Rate limit configuration from config.ts
 * @returns Rate limiter with check() and reset() methods
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const { windowSeconds, maxRequests, keyPrefix } = config;

  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
    prefix: `rl:${keyPrefix}`,
    analytics: false,
  });

  /**
   * Check if request is allowed under rate limit.
   * Fail-open: Redis errors allow the request through.
   */
  async function check(identifier: string): Promise<RateLimitResult> {
    try {
      const result = await rl.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        limit: result.limit,
      };
    } catch (error) {
      console.warn(`[rate-limit] Redis error for ${keyPrefix}, allowing request:`, error);
      return {
        success: true,
        remaining: maxRequests,
        reset: Date.now() + windowSeconds * 1000,
        limit: maxRequests,
      };
    }
  }

  /**
   * Reset rate limit for an identifier (admin overrides / testing)
   */
  async function reset(identifier: string): Promise<void> {
    try {
      await rl.resetUsedTokens(identifier);
    } catch {
      // Fail silently
    }
  }

  return { check, reset };
}

/**
 * Rate limit middleware helper — returns standardized 429 response with headers.
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
 * Get identifier from request.
 *
 * Priority: User ID → CF-Connecting-IP → X-Real-IP → X-Forwarded-For → 'anonymous'
 */
export function getIdentifier(
  request: Request,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  const ip = cfConnecting || realIp || forwarded?.split(',')[0]?.trim();

  if (ip) {
    return `ip:${ip}`;
  }

  return 'anonymous';
}
