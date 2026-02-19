/**
 * CDN Cache Headers — Cloudflare Edge Cache Configuration
 *
 * Centralized TTL definitions for all public API routes.
 * Cloudflare respects `s-maxage` for edge caching and
 * `stale-while-revalidate` for serving stale while revalidating.
 *
 * Key design decisions:
 * - `max-age=0` forces browsers to always revalidate (304) while CF serves from edge
 * - `stale-if-error=86400` lets CF serve stale content if origin is down (graceful degradation)
 * - `Vary: Accept-Encoding` is standard for compressed responses
 * - `CDN-Cache-Control` is a CF-specific header (stripped at edge) for explicit cache control
 *
 * IMPORTANT: Cloudflare does NOT cache JSON responses by default.
 * A Cache Rule must be created in the CF dashboard:
 *   - Match: hostname = revvup.ae AND URI path starts with /api/
 *   - Setting: "Eligible for cache" + "Respect origin cache control"
 * Without this rule, `cf-cache-status` will always be DYNAMIC.
 *
 * Usage:
 *   import { CDN_HEADERS, applyCdnHeaders } from '@/lib/cdn-cache';
 *   // Option A: constructor (may get Vary overridden by Next.js)
 *   return NextResponse.json(data, { headers: CDN_HEADERS.listing });
 *   // Option B: explicit set (recommended — overrides Next.js Vary pollution)
 *   const res = NextResponse.json(data);
 *   applyCdnHeaders(res, 'listing');
 *   return res;
 *
 * @module lib/cdn-cache
 */

import type { NextResponse } from 'next/server';

// ============================================================================
// TTL Definitions (seconds)
// ============================================================================

/** Stale-if-error duration — serve stale for 24h if origin is down */
const STALE_IF_ERROR = 86400;

export const CDN_TTL = {
  /** Single listing detail page — 5 min edge, 1 min SWR */
  listing: { sMaxAge: 300, swr: 60 },

  /** Similar listings carousel — 5 min edge, 1 min SWR */
  similar: { sMaxAge: 300, swr: 60 },

  /** Black/featured listings — 5 min edge, 1 min SWR */
  black: { sMaxAge: 300, swr: 60 },

  /** Car card batch (browse pages) — 5 min edge, 1 min SWR */
  carCard: { sMaxAge: 300, swr: 60 },

  /** Search results — 2 min edge, 30s SWR */
  search: { sMaxAge: 120, swr: 30 },

  /** Search suggestions/autocomplete — 5 min edge, 1 min SWR */
  suggest: { sMaxAge: 300, swr: 60 },

  /** Seller stats (public profile) — 5 min edge, 10 min SWR */
  sellerStats: { sMaxAge: 300, swr: 600 },

  /** Partner list — 5 min edge, 2 min SWR */
  partnerList: { sMaxAge: 300, swr: 120 },

  /** Dealer profile (public GET) — 5 min edge, 2 min SWR */
  dealerProfile: { sMaxAge: 300, swr: 120 },

  /** Showroom list — 5 min edge, 2 min SWR */
  showroom: { sMaxAge: 300, swr: 120 },

  /** Showroom detail (by slug) — 10 min edge, 5 min SWR */
  showroomDetail: { sMaxAge: 600, swr: 300 },

  /** Booking slots — 30s edge, 15s SWR (changes frequently) */
  bookingSlots: { sMaxAge: 30, swr: 15 },
} as const;

// ============================================================================
// Header Builders
// ============================================================================

type CdnTtlKey = keyof typeof CDN_TTL;

/**
 * Build a Cache-Control header value from a TTL config entry.
 * - max-age=0: browser always revalidates (gets 304 or fresh)
 * - s-maxage: Cloudflare edge cache duration
 * - stale-while-revalidate: serve stale while fetching fresh in background
 * - stale-if-error: serve stale if origin is down (graceful degradation)
 */
function buildCacheControl(key: CdnTtlKey): string {
  const { sMaxAge, swr } = CDN_TTL[key];
  return `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}, stale-if-error=${STALE_IF_ERROR}`;
}

/**
 * Pre-built header objects for each public route.
 * Includes CDN-Cache-Control (CF-specific, stripped at edge before client sees it).
 */
export const CDN_HEADERS = Object.fromEntries(
  (Object.keys(CDN_TTL) as CdnTtlKey[]).map((key) => [
    key,
    {
      'Cache-Control': buildCacheControl(key),
      'CDN-Cache-Control': buildCacheControl(key),
      'Vary': 'Accept-Encoding',
    },
  ])
) as unknown as Record<CdnTtlKey, Record<string, string>>;

/**
 * Apply CDN headers to a NextResponse, overriding any Next.js defaults.
 * This is the recommended way to set cache headers — it uses headers.set()
 * which REPLACES Next.js's Vary header pollution (rsc, next-router-state-tree, etc.)
 * instead of being appended to.
 *
 * @example
 * ```ts
 * const res = NextResponse.json(data);
 * applyCdnHeaders(res, 'search');
 * return res;
 * ```
 */
export function applyCdnHeaders(response: Response | NextResponse, key: CdnTtlKey): void {
  const headers = CDN_HEADERS[key];
  for (const [k, v] of Object.entries(headers)) {
    response.headers.set(k, v);
  }
}

/**
 * No-cache headers for private/authenticated routes.
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store',
} as const;
