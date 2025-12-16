/**
 * Auth Configuration - Centralized Constants
 * 
 * All magic numbers and timing configurations for authentication flows
 */

export const AUTH_CONFIG = {
  // Session Cache Configuration
  SESSION_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes - balances performance with data freshness
  
  // Rate Limiting Configuration (in-memory, should be replaced with edge rate limiting)
  RATE_LIMIT: {
    WINDOW_MS: 60_000, // 1 minute
    MAX_REQUESTS: 60, // 60 requests per minute per IP
  },
  
  // UI Feedback Timings (auth-flow-controller delays)
  FEEDBACK_DELAYS: {
    SUCCESS_DISPLAY: 1000, // 1 second - show success message
    ERROR_DISPLAY: 2000, // 2 seconds - show error before returning to form
    WELCOME_DISPLAY: 3000, // 3 seconds - show welcome message for new users
  },
  
  // Magic Link Configuration
  MAGIC_LINK: {
    EXPIRES_IN: 60 * 10, // 10 minutes
    DISABLE_SIGN_UP: true, // Only allow existing users to use magic links
  },
  
  // Session Configuration
  SESSION: {
    EXPIRES_IN: 60 * 60 * 24 * 7, // 7 days
    UPDATE_AGE: 60 * 60 * 24, // 1 day - how often to refresh session
  },
  
  // Email Verification
  EMAIL_VERIFICATION: {
    SEND_ON_SIGN_UP: true,
    AUTO_SIGN_IN_AFTER_VERIFICATION: true,
  },
  
  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  
  // API Endpoints
  ENDPOINTS: {
    GET_SESSION: '/api/auth/get-session',
    PASSWORD_RESET: '/api/auth/password-reset-validated',
    MAGIC_LINK: '/api/auth/magic-link-validated',
  },
} as const;

// Type helper for readonly config
export type AuthConfig = typeof AUTH_CONFIG;
