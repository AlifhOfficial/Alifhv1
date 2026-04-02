/**
 * Authentication Configuration - Production
 * 
 * Centralized configuration for authentication behavior, timings, and security settings.
 * All values are compile-time constants for optimal performance.
 * 
 * @module lib/auth/config
 * @see {@link lib/email/rate-limit} for rate limiting configuration
 */

export const AUTH_CONFIG = {
  /** UI feedback display durations (milliseconds) */
  FEEDBACK_DELAYS: {
    SUCCESS_DISPLAY: 1000,
    ERROR_DISPLAY: 2000,
    WELCOME_DISPLAY: 3000,
  },
  
  /** Magic link authentication settings and rate limits */
  MAGIC_LINK: {
    EXPIRES_IN: 600, // 10 minutes in seconds
    DISABLE_SIGN_UP: true, // Existing users only
    COOLDOWN_SECONDS: 60,
    MAX_REQUESTS_PER_HOUR: 12,
  },
  
  /** Session lifecycle configuration */
  SESSION: {
    EXPIRES_IN: 604800, // 7 days in seconds
    UPDATE_AGE: 86400, // 1 day in seconds
  },
  
  /** Email verification behavior */
  EMAIL_VERIFICATION: {
    SEND_ON_SIGN_UP: true,
  },

  /** Email OTP throttling and verification safeguards */
  EMAIL_OTP: {
    RESEND_COOLDOWN_SECONDS: 45,
    RESEND_MAX_REQUESTS_PER_HOUR: 20,
    VERIFY_MAX_ATTEMPTS: 5,
    LOCKOUT_SECONDS_AFTER_MAX_ATTEMPTS: 10 * 60,
  },

  /** Password reset rate limits */
  PASSWORD_RESET: {
    COOLDOWN_SECONDS: 60,
    MAX_REQUESTS_PER_HOUR: 12,
  },

  /** Password validation rules */
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  
  /** Internal API endpoints for custom auth flows */
  ENDPOINTS: {
    PASSWORD_RESET: '/api/auth/password-reset-validated',
    MAGIC_LINK: '/api/auth/magic-link-validated',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_OTP: '/api/auth/email-otp/send-verification-otp',
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
