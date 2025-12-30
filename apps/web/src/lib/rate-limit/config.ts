/**
 * Rate Limit Configuration - Standardized
 * 
 * Centralized rate limit definitions for all API routes.
 * Every limit is intentional and documented.
 * 
 * PHILOSOPHY:
 * - Protect against abuse without hurting legitimate users
 * - Stricter limits for costly/risky operations (auth, uploads, AI)
 * - Relaxed limits for read operations
 * - Per-user limits for authenticated, per-IP for public
 * 
 * @module lib/rate-limit/config
 */

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  /** Rate limit window in seconds */
  windowSeconds: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Key prefix for cache storage */
  keyPrefix: string;
  /** Description for monitoring/logging */
  description: string;
}

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

export const RATE_LIMITS_AUTH = {
  /**
   * General auth operations (login, signup, magic link)
   * 10 attempts per minute per IP - prevents brute force
   */
  AUTH_GENERAL: {
    windowSeconds: 60,
    maxRequests: 10,
    keyPrefix: 'auth:general',
    description: 'Login/signup attempts',
  },

  /**
   * Password reset requests
   * 3 attempts per 5 minutes per email - prevents enumeration
   */
  PASSWORD_RESET: {
    windowSeconds: 5 * 60,
    maxRequests: 3,
    keyPrefix: 'auth:password-reset',
    description: 'Password reset requests',
  },

  /**
   * Email verification sends
   * 3 attempts per minute per email - prevents spam
   */
  EMAIL_VERIFICATION: {
    windowSeconds: 60,
    maxRequests: 3,
    keyPrefix: 'auth:email-verify',
    description: 'Email verification sends',
  },

  /**
   * Magic link requests
   * 5 attempts per 10 minutes per email
   */
  MAGIC_LINK: {
    windowSeconds: 10 * 60,
    maxRequests: 5,
    keyPrefix: 'auth:magic-link',
    description: 'Magic link requests',
  },

  /**
   * Phone OTP requests
   * 3 attempts per hour per user - SMS is expensive
   */
  PHONE_OTP: {
    windowSeconds: 60 * 60,
    maxRequests: 3,
    keyPrefix: 'auth:phone-otp',
    description: 'Phone OTP sends',
  },

  /**
   * OTP verification attempts
   * 5 attempts per 10 minutes - prevents brute force
   */
  OTP_VERIFY: {
    windowSeconds: 10 * 60,
    maxRequests: 5,
    keyPrefix: 'auth:otp-verify',
    description: 'OTP verification attempts',
  },
} as const;

// ============================================================================
// LISTINGS & CONTENT CREATION
// ============================================================================

export const RATE_LIMITS_LISTINGS = {
  /**
   * Browse/search listings
   * 300 requests per minute per IP - generous for browsing
   */
  BROWSE: {
    windowSeconds: 60,
    maxRequests: 300,
    keyPrefix: 'listings:browse',
    description: 'Browse/search listings',
  },

  /**
   * Create new listing
   * 5 per day per user - prevents spam, allows power users
   */
  CREATE: {
    windowSeconds: 24 * 60 * 60,
    maxRequests: 5,
    keyPrefix: 'listings:create',
    description: 'Create listings',
  },

  /**
   * Update existing listing
   * 20 per hour per user - allows edits without abuse
   */
  UPDATE: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
    keyPrefix: 'listings:update',
    description: 'Update listings',
  },

  /**
   * Delete listing
   * 10 per hour per user
   */
  DELETE: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'listings:delete',
    description: 'Delete listings',
  },
} as const;

// ============================================================================
// MESSAGING & COMMUNICATION
// ============================================================================

export const RATE_LIMITS_MESSAGING = {
  /**
   * Send message
   * 20 messages per minute per user - prevents spam
   */
  SEND_MESSAGE: {
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: 'messaging:send',
    description: 'Send messages',
  },

  /**
   * Create conversation
   * 10 per hour per user - prevents harassment
   */
  CREATE_CONVERSATION: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'messaging:create-conversation',
    description: 'Create conversations',
  },

  /**
   * Fetch messages (pagination)
   * 60 per minute per user - generous for scrolling
   */
  FETCH_MESSAGES: {
    windowSeconds: 60,
    maxRequests: 60,
    keyPrefix: 'messaging:fetch',
    description: 'Fetch messages',
  },

  /**
   * Mark as read (read receipts)
   * 120 per minute per user - frequent on active chats
   */
  READ_RECEIPT: {
    windowSeconds: 60,
    maxRequests: 120,
    keyPrefix: 'messaging:read-receipt',
    description: 'Mark messages as read',
  },
} as const;

// ============================================================================
// FILE UPLOADS & STORAGE
// ============================================================================

export const RATE_LIMITS_STORAGE = {
  /**
   * General file uploads
   * 50 per hour per user - reasonable for legitimate use
   */
  UPLOAD_GENERAL: {
    windowSeconds: 60 * 60,
    maxRequests: 50,
    keyPrefix: 'storage:upload',
    description: 'General file uploads',
  },

  /**
   * Avatar uploads
   * 5 per hour per user - avatars rarely change
   */
  UPLOAD_AVATAR: {
    windowSeconds: 60 * 60,
    maxRequests: 5,
    keyPrefix: 'storage:avatar',
    description: 'Avatar uploads',
  },

  /**
   * Partner image uploads (logo, hero)
   * 10 per hour per partner - branding updates
   */
  UPLOAD_PARTNER: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'storage:partner',
    description: 'Partner image uploads',
  },

  /**
   * Private file uploads (KYC documents)
   * 20 per hour per user - KYC submissions
   */
  UPLOAD_PRIVATE: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
    keyPrefix: 'storage:private',
    description: 'Private file uploads',
  },

  /**
   * Generate signed URLs
   * 100 per minute per user - high limit for image viewing
   */
  SIGNED_URL: {
    windowSeconds: 60,
    maxRequests: 100,
    keyPrefix: 'storage:sign',
    description: 'Generate signed URLs',
  },
} as const;

// ============================================================================
// BOOKINGS & APPOINTMENTS
// ============================================================================

export const RATE_LIMITS_BOOKINGS = {
  /**
   * Create booking
   * 10 per hour per user - prevents spam bookings
   */
  CREATE: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'bookings:create',
    description: 'Create bookings',
  },

  /**
   * Check availability
   * 30 per minute per user - allows browsing slots
   */
  CHECK_AVAILABILITY: {
    windowSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'bookings:availability',
    description: 'Check availability',
  },

  /**
   * Cancel/update booking
   * 20 per hour per user
   */
  MANAGE: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
    keyPrefix: 'bookings:manage',
    description: 'Manage bookings',
  },
} as const;

// ============================================================================
// ENGAGEMENT (Favorites, Superlikes)
// ============================================================================

export const RATE_LIMITS_ENGAGEMENT = {
  /**
   * Toggle favorite
   * 30 per minute per user - allows rapid browsing
   */
  FAVORITE: {
    windowSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'engagement:favorite',
    description: 'Toggle favorites',
  },

  /**
   * Superlike listing
   * 10 per day per user - premium action, limit abuse
   */
  SUPERLIKE: {
    windowSeconds: 24 * 60 * 60,
    maxRequests: 10,
    keyPrefix: 'engagement:superlike',
    description: 'Superlike listings',
  },

  /**
   * Fetch favorites list
   * 20 per minute per user
   */
  FETCH_FAVORITES: {
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: 'engagement:fetch-favorites',
    description: 'Fetch favorites',
  },
} as const;

// ============================================================================
// PARTNER & STAFF OPERATIONS
// ============================================================================

export const RATE_LIMITS_PARTNER = {
  /**
   * Submit partner application
   * 3 per day per user - prevents spam applications
   */
  REQUEST_SUBMIT: {
    windowSeconds: 24 * 60 * 60,
    maxRequests: 3,
    keyPrefix: 'partner:request',
    description: 'Partner application submissions',
  },

  /**
   * Invite staff member
   * 20 per hour per partner - reasonable for team building
   */
  STAFF_INVITE: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
    keyPrefix: 'partner:staff-invite',
    description: 'Staff invitations',
  },

  /**
   * Staff operations (role changes, removals)
   * 30 per hour per partner
   */
  STAFF_OPERATIONS: {
    windowSeconds: 60 * 60,
    maxRequests: 30,
    keyPrefix: 'partner:staff-ops',
    description: 'Staff operations',
  },

  /**
   * Update partner profile
   * 10 per hour per partner
   */
  PROFILE_UPDATE: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'partner:profile-update',
    description: 'Partner profile updates',
  },
} as const;

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export const RATE_LIMITS_ADMIN = {
  /**
   * Admin list queries (users, partners)
   * 60 per minute per admin - moderate for listing
   */
  LIST: {
    windowSeconds: 60,
    maxRequests: 60,
    keyPrefix: 'admin:list',
    description: 'Admin list queries',
  },

  /**
   * Admin stats queries (dashboard)
   * 30 per minute per admin - DB intensive
   */
  STATS: {
    windowSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'admin:stats',
    description: 'Admin stats queries',
  },

  /**
   * General admin operations
   * 100 per minute per admin
   */
  OPS: {
    windowSeconds: 60,
    maxRequests: 100,
    keyPrefix: 'admin:ops',
    description: 'General admin operations',
  },

  /**
   * Admin user operations (ban, role change, etc.)
   * 100 per minute per admin - relaxed for admins
   */
  USER_OPERATIONS: {
    windowSeconds: 60,
    maxRequests: 100,
    keyPrefix: 'admin:user-ops',
    description: 'Admin user operations',
  },

  /**
   * Admin partner operations
   * 100 per minute per admin
   */
  PARTNER_OPERATIONS: {
    windowSeconds: 60,
    maxRequests: 100,
    keyPrefix: 'admin:partner-ops',
    description: 'Admin partner operations',
  },

  /**
   * Admin listing operations
   * 100 per minute per admin
   */
  LISTING_OPERATIONS: {
    windowSeconds: 60,
    maxRequests: 100,
    keyPrefix: 'admin:listing-ops',
    description: 'Admin listing operations',
  },

  /**
   * Ban appeal processing
   * 50 per minute per admin
   */
  BAN_APPEALS: {
    windowSeconds: 60,
    maxRequests: 50,
    keyPrefix: 'admin:ban-appeals',
    description: 'Process ban appeals',
  },

  /**
   * Expensive queries (stats, analytics)
   * 20 per minute per admin - still expensive
   */
  EXPENSIVE_QUERIES: {
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: 'admin:expensive',
    description: 'Expensive admin queries',
  },
} as const;

// ============================================================================
// KYC & VERIFICATION
// ============================================================================

export const RATE_LIMITS_KYC = {
  /**
   * Submit KYC request
   * 5 per day per user - multiple attempts allowed
   */
  SUBMIT: {
    windowSeconds: 24 * 60 * 60,
    maxRequests: 5,
    keyPrefix: 'kyc:submit',
    description: 'KYC submissions',
  },

  /**
   * Fetch KYC status
   * 20 per minute per user
   */
  FETCH_STATUS: {
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: 'kyc:fetch',
    description: 'Fetch KYC status',
  },
} as const;

// ============================================================================
// CONSIGNMENT & MATCHING (AI Operations)
// ============================================================================

export const RATE_LIMITS_CONSIGNMENT = {
  /**
   * AI matching requests
   * 10 per hour per user - expensive AI operation
   */
  MATCH: {
    windowSeconds: 60 * 60,
    maxRequests: 10,
    keyPrefix: 'consignment:match',
    description: 'AI consignment matching',
  },

  /**
   * Update preferences
   * 20 per hour per user
   */
  PREFERENCES: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
    keyPrefix: 'consignment:preferences',
    description: 'Update consignment preferences',
  },

  /**
   * Fetch leads
   * 30 per minute per user
   */
  FETCH_LEADS: {
    windowSeconds: 60,
    maxRequests: 30,
    keyPrefix: 'consignment:leads',
    description: 'Fetch consignment leads',
  },
} as const;

// ============================================================================
// GENERAL READ OPERATIONS
// ============================================================================

export const RATE_LIMITS_GENERAL = {
  /**
   * General authenticated reads (profiles, stats)
   * 60 per minute per user - generous for dashboards
   */
  READ_AUTH: {
    windowSeconds: 60,
    maxRequests: 60,
    keyPrefix: 'general:read-auth',
    description: 'Authenticated read operations',
  },

  /**
   * Public reads (partner profiles, public listings)
   * 120 per minute per IP - generous for browsing
   */
  READ_PUBLIC: {
    windowSeconds: 60,
    maxRequests: 120,
    keyPrefix: 'general:read-public',
    description: 'Public read operations',
  },

  /**
   * Expensive reads (aggregations, stats)
   * 10 per minute per user - DB intensive
   */
  READ_EXPENSIVE: {
    windowSeconds: 60,
    maxRequests: 10,
    keyPrefix: 'general:read-expensive',
    description: 'Expensive read operations',
  },
} as const;

// ============================================================================
// EXPORT ALL CONFIGS
// ============================================================================

export const ALL_RATE_LIMITS = {
  ...RATE_LIMITS_AUTH,
  ...RATE_LIMITS_LISTINGS,
  ...RATE_LIMITS_MESSAGING,
  ...RATE_LIMITS_STORAGE,
  ...RATE_LIMITS_BOOKINGS,
  ...RATE_LIMITS_ENGAGEMENT,
  ...RATE_LIMITS_PARTNER,
  ...RATE_LIMITS_ADMIN,
  ...RATE_LIMITS_KYC,
  ...RATE_LIMITS_CONSIGNMENT,
  ...RATE_LIMITS_GENERAL,
} as const;

/**
 * Type-safe rate limit key
 */
export type RateLimitKey = keyof typeof ALL_RATE_LIMITS;
