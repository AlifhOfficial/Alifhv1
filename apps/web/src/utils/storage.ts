/**
 * Storage Utilities - Production
 * 
 * Helper functions for storage key generation and data normalization.
 * Used by storage providers (R2, Mock) for consistent behavior.
 * 
 * @module utils/storage
 */

import { createId } from "@paralleldrive/cuid2";
import type { StorageData, UploadFileParams } from "@/lib/storage/types";

// ============================================================================
// Public URL Resolution - Single Source of Truth
// ============================================================================

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const R2_PUBLIC_HOST = R2_PUBLIC_URL ? new URL(R2_PUBLIC_URL).hostname : null;
const CDN_HOSTS = new Set(
  ['cdn.revvup.ae', R2_PUBLIC_HOST].filter((value): value is string => Boolean(value))
);

/** CDN base URL for marketing/static assets served directly from R2/CDN */
const rawMarketingCdnUrl = process.env.NEXT_PUBLIC_CDN_MARKETING_URL || process.env.NEXT_PUBLIC_CDN_STATIC_URL;
const CDN_STATIC_URL = rawMarketingCdnUrl?.replace(/\/static\/?$/, '');

/**
 * Returns true when a URL points at our direct image CDN / R2 public host.
 * These should bypass Next.js image optimization to avoid the extra proxy hop.
 */
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
 * Get CDN URL for static marketing assets from the public folder.
 * 
 * In production, serves files from cdn.revvup.ae/marketing/... instead of the Next.js server.
 * 
 * Set NEXT_PUBLIC_CDN_MARKETING_URL=https://cdn.revvup.ae in production.
 * Leave unset in development to serve from Next.js public folder.
 * 
 * @param path - Path relative to public folder (e.g., "/marketing/hero-image.webp")
 * @returns CDN URL in production, original path in development
 * 
 * @example
 * getStaticUrl("/marketing/hero-image.webp") 
 * // Dev: "/marketing/hero-image.webp"
 * // Prod: "https://cdn.revvup.ae/marketing/hero-image.webp"
 */
export function getStaticUrl(path: string): string {
  if (!path) return path;
  
  // Already a full URL - return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If CDN static URL is configured, use it
  if (CDN_STATIC_URL) {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${CDN_STATIC_URL.replace(/\/$/, '')}/${cleanPath}`;
  }
  
  // Development: serve from Next.js public folder
  return path;
}

/**
 * Converts a storage key to a public URL.
 * This is the SINGLE SOURCE OF TRUTH for all R2 URL resolution.
 * 
 * Handles:
 * - Null/undefined values → returns null
 * - Already full URLs (http://, https://, /) → returns as-is
 * - Storage keys → converts to full public URL
 * 
 * @param key - Storage key or full URL
 * @param cacheBuster - Optional cache buster (timestamp, version, etc.) to append as query param
 * @returns Full public URL or null
 * 
 * @example
 * getPublicUrl("avatars/user123.jpg") → "https://pub-xxx.r2.dev/avatars/user123.jpg"
 * getPublicUrl("avatars/user123.jpg", Date.now()) → "https://pub-xxx.r2.dev/avatars/user123.jpg?v=1703..."
 * getPublicUrl("https://example.com/img.jpg") → "https://example.com/img.jpg"
 * getPublicUrl(null) → null
 */
export function getPublicUrl(key: string | null | undefined, cacheBuster?: string | number): string | null {
  if (!key) return null;
  
  // Already a full URL (including blob:) - return as-is
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/') || key.startsWith('blob:')) {
    return key;
  }
  
  // Storage key - convert to public URL
  if (!R2_PUBLIC_URL) {
    console.warn('NEXT_PUBLIC_R2_PUBLIC_URL is not configured');
    return null;
  }
  
  const baseUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  
  // Add cache buster if provided
  if (cacheBuster !== undefined) {
    return `${baseUrl}?v=${cacheBuster}`;
  }
  
  return baseUrl;
}

/**
 * Converts a listing image key to a strict CDN URL.
 * Non-CDN absolute URLs and local/public paths are rejected.
 */
export function getCdnPublicUrl(key: string | null | undefined, cacheBuster?: string | number): string | null {
  if (!key) return null;

  if (key.startsWith('/')) {
    return null;
  }

  if (key.startsWith('http://') || key.startsWith('https://')) {
    try {
      const parsed = new URL(key);
      return CDN_HOSTS.has(parsed.hostname) ? key : null;
    } catch {
      return null;
    }
  }

  return getPublicUrl(key, cacheBuster);
}

/**
 * Get thumbnail URL from a full-size image URL/key.
 * 
 * For listing images uploaded after Feb 2026, images are stored as pairs:
 * - Full: xxx_full.webp (1600w, ~120-350KB)
 * - Thumb: xxx_thumb.webp (480w, ~30-90KB)
 * 
 * This function converts a full URL to its thumb equivalent.
 * Falls back to original URL for legacy images without _full suffix.
 * 
 * @param url - Full-size image URL or key
 * @param cacheBuster - Optional cache buster
 * @returns Thumbnail URL or original if not a dual-output image
 * 
 * @example
 * getThumbUrl("listings/.../abc_full.webp") → "https://cdn.../abc_thumb.webp"
 * getThumbUrl("https://cdn.../abc_full.webp") → "https://cdn.../abc_thumb.webp"
 * getThumbUrl("legacy/image.webp") → "https://cdn.../legacy/image.webp" (unchanged)
 */
export function getThumbUrl(url: string | null | undefined, cacheBuster?: string | number): string | null {
  if (!url) return null;
  
  // Get the public URL first
  const fullUrl = getPublicUrl(url, cacheBuster);
  if (!fullUrl) return null;
  
  // Convert _full.{ext} to _thumb.{ext}
  for (const ext of ['webp', 'avif', 'jpg']) {
    if (fullUrl.includes(`_full.${ext}`)) {
      return fullUrl.replace(`_full.${ext}`, `_thumb.${ext}`);
    }
  }

  // Legacy image - return as-is (no thumb version exists)
  return fullUrl;
}

/**
 * Strict CDN-only thumbnail resolution.
 */
export function getCdnThumbUrl(url: string | null | undefined, cacheBuster?: string | number): string | null {
  if (!url) return null;

  const fullUrl = getCdnPublicUrl(url, cacheBuster);
  if (!fullUrl) return null;

  for (const ext of ['webp', 'avif', 'jpg']) {
    if (fullUrl.includes(`_full.${ext}`)) {
      return fullUrl.replace(`_full.${ext}`, `_thumb.${ext}`);
    }
  }

  return fullUrl;
}

/**
 * App image resolution policy:
 * - user-uploaded / storage-backed app images should resolve directly to our CDN
 * - non-CDN absolute URLs are not valid for app-served images
 */
export function getAppImageUrl(key: string | null | undefined, cacheBuster?: string | number): string | null {
  return getCdnPublicUrl(key, cacheBuster);
}

/**
 * App thumbnail resolution policy:
 * - cards, rows, and compact surfaces should use CDN thumbs directly
 */
export function getAppThumbUrl(url: string | null | undefined, cacheBuster?: string | number): string | null {
  return getCdnThumbUrl(url, cacheBuster);
}

/**
 * Get listing image URLs with both thumb and full variants.
 * Useful for responsive images where thumb is used for grid cards
 * and full is used for detail pages/lightbox.
 * 
 * @param url - Image URL or key
 * @returns Object with thumb and full URLs
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
  return getCdnListingImageUrls(url);
}

/**
 * Strict CDN-only listing image variants.
 * Returns nulls when the source cannot be resolved to the CDN.
 */
export function getCdnListingImageUrls(url: string | null | undefined): { thumb: string | null; full: string | null } {
  if (!url) return { thumb: null, full: null };

  const full = getCdnPublicUrl(url);
  if (!full) return { thumb: null, full: null };

  if (full.includes('_full.webp')) {
    return {
      thumb: full.replace('_full.webp', '_thumb.webp'),
      full,
    };
  }

  if (full.includes('_full.jpg')) {
    return {
      thumb: full.replace('_full.jpg', '_thumb.jpg'),
      full,
    };
  }

  return {
    thumb: full,
    full,
  };
}

// ============================================================================
// Key Management
// ============================================================================

/**
 * Normalizes storage key by converting backslashes and removing leading/trailing slashes
 * @param key - Raw storage key
 * @returns Normalized key with forward slashes
 */
export function normalizeKey(key: string): string {
  const normalized = key.replace(/\\+/g, "/");
  let start = 0;
  let end = normalized.length;

  while (start < end && normalized.charCodeAt(start) === 47) {
    start++;
  }
  while (end > start && normalized.charCodeAt(end - 1) === 47) {
    end--;
  }

  return normalized.slice(start, end);
}

/**
 * Builds storage key from upload parameters
 * Generates unique key with CUID if not provided
 * 
 * @param params - Upload parameters with optional key, directory, fileName
 * @returns Generated or normalized storage key
 * @example
 * buildKey({ directory: "avatars", fileName: "profile.jpg" })
 * // "avatars/profile-cjld2cjxh0000qzrmn831i7rn.jpg"
 */
export function buildKey(params: Pick<UploadFileParams, "directory" | "fileName" | "key">): string {
  if (params.key) return normalizeKey(params.key);
  const id = createId();
  const safeName = params.fileName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ?? "file";
  const segments = [params.directory, `${safeName}-${id}`].filter(Boolean) as string[];
  return normalizeKey(segments.join("/"));
}

/**
 * Converts various data types to Uint8Array for storage
 * Handles Buffer, Uint8Array, ArrayBuffer, string, and Node streams
 * 
 * @param data - Storage data in various formats
 * @returns Uint8Array ready for upload
 * @throws {TypeError} If data type is unsupported
 */
export async function toUint8Array(data: StorageData): Promise<Uint8Array> {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof data === "string") return Buffer.from(data, "utf-8");

  if (typeof data === "object" && data !== null && typeof (data as any).pipe === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of data as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new TypeError("Unsupported storage data type");
}
