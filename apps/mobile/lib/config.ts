/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Includes a global fetch interceptor to prevent native cookie leakage.
 * TODO: Use environment variables for production.
 */

// Development API URL - your local web server
// Use your machine's local IP (check with: ifconfig | grep inet)
export const API_BASE = 'http://192.168.1.33:3000';

// ============================================================================
// GLOBAL FETCH INTERCEPTOR
// ============================================================================
// React Native's fetch uses the native networking stack (NSURLSession / OkHttp)
// which automatically stores & sends cookies from Set-Cookie headers.
// Since the mobile app uses Bearer token auth (not cookies), stale cookies
// from a previous user's session can leak into requests for the new user.
//
// This one-time patch adds `credentials: 'omit'` to every fetch call targeting
// our API, so the native cookie jar is never read or written. No individual
// API file needs to worry about it.
// ============================================================================
const _originalFetch = globalThis.fetch;
globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  // Only intercept requests to our own API — leave third-party requests alone
  if (url.startsWith(API_BASE)) {
    init = { ...init, credentials: 'omit' };
  }

  return _originalFetch(input, init);
};

// CDN for static assets
export const CDN_BASE = 'https://cdn.alifh.ae';

// CDN URL for avatars and media (R2 custom domain)
export const R2_PUBLIC_URL = 'https://cdn.alifh.ae';

// WebSocket URL
export const WS_URL = 'ws://192.168.1.33:3001';

/**
 * Convert avatar key to full public URL
 * Handles null values and already-full URLs
 */
export function getAvatarUrl(key: string | null | undefined, cacheBuster?: number): string | null {
  if (!key) return null;
  
  // Already a full URL
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
    return key;
  }
  
  // Convert storage key to public URL
  const baseUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  return cacheBuster ? `${baseUrl}?v=${cacheBuster}` : baseUrl;
}

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
  // Passkey (Better Auth passkey plugin — WebAuthn flow)
  PASSKEY_REGISTER_OPTIONS: '/api/auth/passkey/generate-register-options',
  PASSKEY_VERIFY_REGISTRATION: '/api/auth/passkey/verify-registration',
  PASSKEY_DELETE: '/api/auth/passkey/delete-passkey',
  PASSKEY_LIST: '/api/auth/passkey/list-user-passkeys',
} as const;

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  USER_PROFILE: '/api/profile/user/user-profile',
  UPLOAD_AVATAR: '/api/storage/upload-avatar',
  DELETE_ACCOUNT: '/api/profile/user/delete-account',
} as const;

// Messaging endpoints
export const MESSAGING_ENDPOINTS = {
  CONVERSATIONS: '/api/conversations',
  MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
  MARK_READ: (conversationId: string) => `/api/conversations/${conversationId}/read`,
  UNREAD_COUNT: '/api/conversations/unread-count',
} as const;
