/**
 * API Configuration
 *
 * Centralized configuration for API endpoints.
 * Uses fixed hosts for deterministic behavior during testing.
 * Includes a global fetch interceptor to prevent native cookie leakage.
 */
const PROD_API_BASE = 'https://revvup.ae';
const PROD_WS_URL = 'wss://ws.revvup.ae';
const PROD_CDN_URL = 'https://cdn.revvup.ae';

function getApiBaseUrl(): string {
  // Production API base URL across iOS and Android.
  return PROD_API_BASE;
}

function getWsUrl(): string {
  // Production WebSocket URL across iOS and Android.
  return PROD_WS_URL;
}

// API URL
export const API_BASE = getApiBaseUrl();

export const PUBLIC_SITE_URL = PROD_API_BASE;

// WebSocket URL
export const WS_URL = getWsUrl();

export function buildPublicUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL}${normalizedPath}`;
}

export function buildPublicListingUrl(listingIdOrSlug: string): string {
  return buildPublicUrl(`/listings/${listingIdOrSlug}`);
}

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
let requestCounter = 0;
const inFlightRequests = new Map<string, number>();

globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : undefined) || 'GET';
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const requestId = ++requestCounter;

  // Only intercept requests to our own API — leave third-party requests alone
  if (url.startsWith(API_BASE)) {
    init = { ...init, credentials: 'omit' };

    if (__DEV__) {
      const key = `${method} ${url}`;
      const duplicates = (inFlightRequests.get(key) ?? 0) + 1;
      inFlightRequests.set(key, duplicates);
      console.log(`[FetchDebug] #${requestId} ${method} ${url} start inflight=${duplicates}`);

      return _originalFetch(input, init).then(
        (response) => {
          const duration = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt);
          const remaining = Math.max(0, (inFlightRequests.get(key) ?? 1) - 1);
          if (remaining === 0) inFlightRequests.delete(key);
          else inFlightRequests.set(key, remaining);
          console.log(
            `[FetchDebug] #${requestId} ${method} ${url} done status=${response.status} ok=${response.ok} ms=${duration} inflight=${remaining}`
          );
          return response;
        },
        (error) => {
          const duration = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt);
          const remaining = Math.max(0, (inFlightRequests.get(key) ?? 1) - 1);
          if (remaining === 0) inFlightRequests.delete(key);
          else inFlightRequests.set(key, remaining);
          console.log(
            `[FetchDebug] #${requestId} ${method} ${url} error ms=${duration} inflight=${remaining} message="${
              error instanceof Error ? error.message : 'unknown'
            }"`
          );
          throw error;
        }
      );
    }
  }

  return _originalFetch(input, init);
};

// CDN for static assets (from environment or default)
export const CDN_BASE = PROD_CDN_URL;

// CDN URL for avatars and media (R2 custom domain)
export const R2_PUBLIC_URL = PROD_CDN_URL;
const CDN_HOSTS = new Set(
  [CDN_BASE, R2_PUBLIC_URL].map((value) => {
    try {
      return new URL(value).hostname;
    } catch {
      return null;
    }
  }).filter((value): value is string => Boolean(value))
);

export function isCdnUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

  try {
    return CDN_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

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
  return getAppImageUrl(key, cacheBuster);
}

/**
 * App image resolution policy:
 * - user-uploaded / storage-backed app images should resolve directly to our CDN
 * - non-CDN absolute URLs are not valid for app-served images
 */
export function getAppImageUrl(key: string | null | undefined, cacheBuster?: number): string | null {
  if (!key) return null;

  if (key.startsWith('/')) {
    const normalizedKey = key.slice(1);
    const baseUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${normalizedKey}`;
    return cacheBuster ? `${baseUrl}?v=${cacheBuster}` : baseUrl;
  }

  if (key.startsWith('http://') || key.startsWith('https://')) {
    return isCdnUrl(key)
      ? (cacheBuster ? `${key}${key.includes('?') ? '&' : '?'}v=${cacheBuster}` : key)
      : null;
  }

  const baseUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  return cacheBuster ? `${baseUrl}?v=${cacheBuster}` : baseUrl;
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
 * App thumbnail resolution policy:
 * - cards, rows, and compact surfaces should use CDN thumbs directly
 */
export function getAppThumbUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const fullUrl = getAppImageUrl(url);
  if (!fullUrl) return null;

  if (fullUrl.includes('_full.webp')) {
    return fullUrl.replace('_full.webp', '_thumb.webp');
  }

  if (fullUrl.includes('_full.jpg')) {
    return fullUrl.replace('_full.jpg', '_thumb.jpg');
  }

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

/**
 * Strict app-only listing image resolution.
 * Returns CDN-backed thumb/full variants only.
 */
export function getAppListingImageUrls(url: string | null | undefined): { thumb: string | null; full: string | null } {
  if (!url) return { thumb: null, full: null };

  const publicUrl = getAppImageUrl(url);
  if (!publicUrl) return { thumb: null, full: null };

  if (publicUrl.includes('_full.webp')) {
    return {
      thumb: publicUrl.replace('_full.webp', '_thumb.webp'),
      full: publicUrl,
    };
  }

  if (publicUrl.includes('_full.jpg')) {
    return {
      thumb: publicUrl.replace('_full.jpg', '_thumb.jpg'),
      full: publicUrl,
    };
  }

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
  APPLE_SIGN_IN: '/api/auth/apple/native', // Native iOS Apple Sign In
  // Phone verification
  PHONE_SEND_OTP: '/api/auth/phone-number/send-otp',
  PHONE_VERIFY: '/api/auth/phone-number/verify',
  // Passkey (Better Auth passkey plugin — WebAuthn flow)
  PASSKEY_REGISTER_OPTIONS: '/api/auth/passkey/generate-register-options',
  PASSKEY_VERIFY_REGISTRATION: '/api/auth/passkey/verify-registration',
  PASSKEY_DELETE: '/api/auth/passkey/delete-passkey',
  PASSKEY_LIST: '/api/auth/passkey/list-user-passkeys',
  // Passkey authentication (sign in with Face ID/biometrics)
  PASSKEY_AUTHENTICATE_OPTIONS: '/api/auth/passkey/generate-authenticate-options',
  PASSKEY_VERIFY_AUTHENTICATION: '/api/auth/passkey/verify-authentication',
} as const;

// Profile endpoints
export const PROFILE_ENDPOINTS = {
  USER_PROFILE: '/api/profile/user/user-profile',
  DELETE_ACCOUNT: '/api/profile/user/delete-account',
} as const;

// Messaging endpoints
export const MESSAGING_ENDPOINTS = {
  CONVERSATIONS: '/api/conversations',
  MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
  MARK_READ: (conversationId: string) => `/api/conversations/${conversationId}/read`,
} as const;

type ServerTimingMetric = {
  name: string;
  dur?: number;
  desc?: string;
};

export interface ApiPerfBreakdown {
  label: string;
  url: string;
  status: number;
  ok: boolean;
  appMs?: number;
  ttfbMs: number;
  payloadMs: number;
  parseMs: number;
  totalMs: number;
  payloadBytes: number;
  cfCacheStatus?: string | null;
  age?: string | null;
  contentLength?: string | null;
  serverTiming?: string | null;
  serverMs?: number;
  networkMs?: number;
  metrics: ServerTimingMetric[];
}

export interface PerfRequestOptions {
  interactionStartAt?: number;
  meta?: Record<string, unknown>;
}

const dataReadyMarks = new Map<string, number>();
const interactionMarks = new Map<string, number>();
const encoder = new TextEncoder();

function roundPerf(value: number): number {
  return Math.round(value);
}

function parseServerTiming(header: string | null): ServerTimingMetric[] {
  if (!header) return [];

  return header
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [namePart, ...paramParts] = entry.split(';').map((part) => part.trim());
      const metric: ServerTimingMetric = { name: namePart };

      for (const part of paramParts) {
        const [key, rawValue] = part.split('=');
        if (!key || rawValue == null) continue;
        const value = rawValue.replace(/^"|"$/g, '');
        if (key === 'dur') {
          const dur = Number(value);
          if (Number.isFinite(dur)) metric.dur = dur;
        } else if (key === 'desc') {
          metric.desc = value;
        }
      }

      return metric;
    });
}

function buildPerf(
  label: string,
  url: string,
  response: Response,
  requestStartedAt: number,
  responseStartedAt: number,
  parseStartedAt: number,
  parseEndedAt: number,
  payloadBytes: number,
  interactionStartAt?: number,
): ApiPerfBreakdown {
  const ttfbMs = responseStartedAt - requestStartedAt;
  const payloadMs = parseStartedAt - responseStartedAt;
  const parseMs = parseEndedAt - parseStartedAt;
  const totalMs = parseEndedAt - requestStartedAt;
  const serverTiming = response.headers.get('server-timing');
  const metrics = parseServerTiming(serverTiming);
  const serverMs = metrics.find((metric) => metric.name === 'total')?.dur
    ?? metrics.find((metric) => metric.name === 'db')?.dur;

  return {
    label,
    url,
    status: response.status,
    ok: response.ok,
    appMs: interactionStartAt != null ? roundPerf(requestStartedAt - interactionStartAt) : undefined,
    ttfbMs: roundPerf(ttfbMs),
    payloadMs: roundPerf(payloadMs),
    parseMs: roundPerf(parseMs),
    totalMs: roundPerf(totalMs),
    payloadBytes,
    cfCacheStatus: response.headers.get('cf-cache-status'),
    age: response.headers.get('age'),
    contentLength: response.headers.get('content-length'),
    serverTiming,
    serverMs: serverMs != null ? roundPerf(serverMs) : undefined,
    networkMs: serverMs != null ? Math.max(0, roundPerf(ttfbMs - serverMs)) : undefined,
    metrics,
  };
}

export async function parseJsonWithPerf<T>(
  label: string,
  url: string,
  response: Response,
  requestStartedAt: number,
  options: PerfRequestOptions = {},
): Promise<{ data: T; perf: ApiPerfBreakdown }> {
  const responseStartedAt = performance.now();
  const raw = await response.text();
  const parseStartedAt = performance.now();
  const data = raw ? JSON.parse(raw) as T : (null as T);
  const parseEndedAt = performance.now();
  const perf = buildPerf(
    label,
    url,
    response,
    requestStartedAt,
    responseStartedAt,
    parseStartedAt,
    parseEndedAt,
    encoder.encode(raw).length,
    options.interactionStartAt,
  );

  console.log(
    `[Perf][API] ${label}`,
    JSON.stringify({
      ...perf,
      ...options.meta,
    })
  );

  return { data, perf };
}

export function markDataReady(key: string): number {
  const now = performance.now();
  dataReadyMarks.set(key, now);
  return now;
}

export function consumeDataReady(key: string): number | null {
  const value = dataReadyMarks.get(key) ?? null;
  if (value != null) {
    dataReadyMarks.delete(key);
  }
  return value;
}

export function markInteractionStart(key: string): number {
  const now = performance.now();
  interactionMarks.set(key, now);
  return now;
}

export function consumeInteractionStart(key: string, maxAgeMs = 15000): number | null {
  const now = performance.now();
  const value = interactionMarks.get(key) ?? null;
  if (value == null) return null;
  interactionMarks.delete(key);
  return now - value <= maxAgeMs ? value : null;
}

export function scheduleRenderPerf(
  label: string,
  dataReadyAt: number,
  meta?: Record<string, unknown>,
): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const renderMs = roundPerf(performance.now() - dataReadyAt);
      console.log(
        `[Perf][Render] ${label}`,
        JSON.stringify({
          label,
          renderMs,
          ...meta,
        })
      );
    });
  });
}
