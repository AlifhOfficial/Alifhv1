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

/** CDN base URL for static assets (public folder) */
const CDN_STATIC_URL = process.env.NEXT_PUBLIC_CDN_STATIC_URL;

/**
 * Get CDN URL for static assets from the public folder.
 * 
 * In production, serves files from cdn.revvup.ae/static/... instead of the Next.js server.
 * This offloads bandwidth from Railway to Cloudflare edge caching.
 * 
 * Set NEXT_PUBLIC_CDN_STATIC_URL=https://cdn.revvup.ae/static in production.
 * Leave unset in development to serve from Next.js public folder.
 * 
 * @param path - Path relative to public folder (e.g., "/Marketing/Hero_img.png")
 * @returns CDN URL in production, original path in development
 * 
 * @example
 * getStaticUrl("/Marketing/Hero_img.png") 
 * // Dev: "/Marketing/Hero_img.png"
 * // Prod: "https://cdn.revvup.ae/static/Marketing/Hero_img.png"
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
  
  // Already a full URL - return as-is (don't add cache buster to external URLs)
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('/')) {
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
  
  // Convert _full.webp to _thumb.webp
  if (fullUrl.includes('_full.webp')) {
    return fullUrl.replace('_full.webp', '_thumb.webp');
  }
  
  // Legacy image - return as-is (no thumb version exists)
  return fullUrl;
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
  
  // Check if this is a dual-output image
  if (publicUrl.includes('_full.webp')) {
    return {
      thumb: publicUrl.replace('_full.webp', '_thumb.webp'),
      full: publicUrl,
    };
  }
  
  // Legacy image - use same URL for both
  return {
    thumb: publicUrl,
    full: publicUrl,
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
  return key.replace(/\\+/g, "/").replace(/^\/+|\/+$/g, "");
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
