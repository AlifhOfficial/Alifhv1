/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * TODO: Use environment variables for production.
 */

// Development API URL - your local web server
export const API_BASE = 'http://192.168.1.14:3000';

// CDN for static assets
export const CDN_BASE = 'https://cdn.alifh.ae';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGN_IN: '/api/auth/sign-in/email',
  SIGN_UP: '/api/auth/signup',
  SIGN_OUT: '/api/auth/sign-out',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_OTP: '/api/auth/email-otp/send-verification-otp',
  PASSWORD_RESET: '/api/auth/password-reset-validated',
  GET_SESSION: '/api/auth/get-session',
  // Phone verification
  PHONE_SEND_OTP: '/api/auth/phone-number/send-otp',
  PHONE_VERIFY: '/api/auth/phone-number/verify',
} as const;

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  USER_PROFILE: '/api/profile/user/user-profile',
  UPLOAD_AVATAR: '/api/storage/upload-avatar',
  DELETE_ACCOUNT: '/api/profile/user/delete-account',
} as const;
