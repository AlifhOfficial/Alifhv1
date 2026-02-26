/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Auto-detects the dev server IP in development mode.
 * Includes a global fetch interceptor to prevent native cookie leakage.
 */
import Constants from 'expo-constants';

// ============================================================================
// DYNAMIC IP DETECTION
// ============================================================================
// In development, Expo knows the dev server IP. We use that same IP to connect
// to our Next.js API server (running on port 3000) and WebSocket server (3001).
// This eliminates the need to manually update env vars when your IP changes.
// ============================================================================
function getDevServerHost(): string | null {
  // Works in Expo Go and development builds
  const debuggerHost = Constants.expoGoConfig?.debuggerHost 
    ?? Constants.expoConfig?.hostUri;
  
  if (debuggerHost) {
    // debuggerHost is like "192.168.1.15:8081" - extract just the IP
    return debuggerHost.split(':')[0];
  }
  return null;
}

function getApiBaseUrl(): string {
  // Always use production URL for now (live testing)
  // To switch back to local dev, set USE_LOCAL_DEV=true in env
  if (process.env.EXPO_PUBLIC_USE_LOCAL_DEV === 'true' && __DEV__) {
    const devHost = getDevServerHost();
    if (devHost) {
      return `http://${devHost}:3000`;
    }
    return 'http://localhost:3000';
  }
  
  // Use production URL - use www to avoid 307 redirect
  return process.env.EXPO_PUBLIC_API_URL || 'https://www.revvup.ae';
}

function getWsUrl(): string {
  // Always use production URL for now (live testing)
  // To switch back to local dev, set USE_LOCAL_DEV=true in env
  if (process.env.EXPO_PUBLIC_USE_LOCAL_DEV === 'true' && __DEV__) {
    const devHost = getDevServerHost();
    if (devHost) {
      return `ws://${devHost}:3001`;
    }
    return 'ws://localhost:3001';
  }
  
  // Use production URL
  return process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.revvup.ae';
}

// API URL - auto-detected in dev, from env in production
export const API_BASE = getApiBaseUrl();

// WebSocket URL - auto-detected in dev, from env in production
export const WS_URL = getWsUrl();

// Log detected endpoints in development
if (__DEV__) {
  console.log('[Config] API_BASE:', API_BASE);
  console.log('[Config] WS_URL:', WS_URL);
}

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

// CDN for static assets (from environment or default)
export const CDN_BASE = process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.revvup.ae';

// CDN URL for avatars and media (R2 custom domain)
export const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.revvup.ae';

/**
 * Convert a storage key or partial URL to full public CDN URL.
 */
export function getPublicUrl(key: string | null | undefined, cacheBuster?: number): string | null {
  if (!key) return null;
  
  // Already a full URL
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return cacheBuster ? `${key}${key.includes('?') ? '&' : '?'}v=${cacheBuster}` : key;
  }
  
  // Local asset
  if (key.startsWith('/')) {
    return key;
  }
  
  // Convert storage key to public URL
  const baseUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  return cacheBuster ? `${baseUrl}?v=${cacheBuster}` : baseUrl;
}

/**
 * Convert avatar key to full public URL
 * Handles null values and already-full URLs
 */
export function getAvatarUrl(key: string | null | undefined, cacheBuster?: number): string | null {
  return getPublicUrl(key, cacheBuster);
}

/**
 * Get thumbnail URL from a full-size image URL/key.
 * 
 * For listing images uploaded after Feb 2026, images are stored as pairs:
 * - Full: xxx_full.webp or xxx_full.jpg (1400w)
 * - Thumb: xxx_thumb.webp or xxx_thumb.jpg (480w, ~20-35KB)
 * 
 * This function converts a full URL to its thumb equivalent.
 * Falls back to original URL for legacy images without _full suffix.
 * 
 * @param url - Full-size image URL or key
 * @returns Thumbnail URL or original if not a dual-output image
 */
export function getThumbUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Get the public URL first
  const fullUrl = getPublicUrl(url);
  if (!fullUrl) return null;
  
  // Convert _full.webp to _thumb.webp
  if (fullUrl.includes('_full.webp')) {
    return fullUrl.replace('_full.webp', '_thumb.webp');
  }
  
  // Convert _full.jpg to _thumb.jpg (direct upload format)
  if (fullUrl.includes('_full.jpg')) {
    return fullUrl.replace('_full.jpg', '_thumb.jpg');
  }
  
  // Legacy image - return as-is (no thumb version exists)
  return fullUrl;
}

/**
 * Get listing image URLs with both thumb and full variants.
 * Useful for galleries where thumb is used for grid/thumbnails
 * and full is used for main view/lightbox.
 */
export function getListingImageUrls(url: string | null | undefined): { thumb: string | null; full: string | null } {
  if (!url) return { thumb: null, full: null };
  
  const publicUrl = getPublicUrl(url);
  if (!publicUrl) return { thumb: null, full: null };
  
  // Check if this is a dual-output image (webp format)
  if (publicUrl.includes('_full.webp')) {
    return {
      thumb: publicUrl.replace('_full.webp', '_thumb.webp'),
      full: publicUrl,
    };
  }
  
  // Check if this is a dual-output image (jpg format - direct upload)
  if (publicUrl.includes('_full.jpg')) {
    return {
      thumb: publicUrl.replace('_full.jpg', '_thumb.jpg'),
      full: publicUrl,
    };
  }
  
  // Legacy image - use same URL for both
  return {
    thumb: publicUrl,
    full: publicUrl,
  };
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
  // Social auth
  GOOGLE_SIGN_IN: '/auth/google/mobile-start',
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
  PRESIGNED: '/api/storage/presigned',
  PROCESS: '/api/storage/process',
  DELETE_ACCOUNT: '/api/profile/user/delete-account',
} as const;

// Messaging endpoints
export const MESSAGING_ENDPOINTS = {
  CONVERSATIONS: '/api/conversations',
  MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
  MARK_READ: (conversationId: string) => `/api/conversations/${conversationId}/read`,
  UNREAD_COUNT: '/api/conversations/unread-count',
} as const;
