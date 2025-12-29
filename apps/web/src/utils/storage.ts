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
