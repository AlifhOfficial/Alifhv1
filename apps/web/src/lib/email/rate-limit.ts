/**
 * Email Rate Limiting
 * 
 * Simple in-memory rate limiting for email sending
 * Prevents abuse while maintaining good UX
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
export const RATE_LIMITS = {
  EMAIL_VERIFICATION: {
    maxAttempts: 3,
    windowMs: 60 * 1000, // 1 minute
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  MAGIC_LINK: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check if an email action is rate limited
 */
export function isRateLimited(email: string, type: RateLimitType): boolean {
  const key = `${email}:${type}`;
  const config = RATE_LIMITS[type];
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry) {
    // First request
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }
  
  // Check if window has expired
  if (now > entry.resetTime) {
    // Reset the counter
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxAttempts) {
    return true;
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return false;
}

/**
 * Get remaining time until rate limit resets
 */
export function getRateLimitReset(email: string, type: RateLimitType): number {
  const key = `${email}:${type}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) return 0;
  
  const remaining = entry.resetTime - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
}

/**
 * Clear rate limit for testing purposes
 */
export function clearRateLimit(email: string, type?: RateLimitType) {
  if (type) {
    const key = `${email}:${type}`;
    rateLimitStore.delete(key);
  } else {
    // Clear all for this email
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${email}:`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}