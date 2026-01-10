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
  
  /** Magic link authentication settings */
  MAGIC_LINK: {
    EXPIRES_IN: 600, // 10 minutes in seconds
    DISABLE_SIGN_UP: true, // Existing users only
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
  
  /** Password validation rules */
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  
  /** Internal API endpoints for custom auth flows */
  ENDPOINTS: {
    PASSWORD_RESET: '/api/auth/password-reset-validated',
    MAGIC_LINK: '/api/auth/magic-link-validated',
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
