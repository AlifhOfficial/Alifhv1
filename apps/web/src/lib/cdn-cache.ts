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
 *
 * Usage:
 *   import { CDN_HEADERS } from '@/lib/cdn-cache';
 *   return NextResponse.json(data, { headers: CDN_HEADERS.listing });
 *
 * @module lib/cdn-cache
 */

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
 * Use directly with `NextResponse.json(data, { headers: CDN_HEADERS.listing })`.
 */
export const CDN_HEADERS = Object.fromEntries(
  (Object.keys(CDN_TTL) as CdnTtlKey[]).map((key) => [
    key,
    {
      'Cache-Control': buildCacheControl(key),
      'Vary': 'Accept-Encoding',
    },
  ])
) as unknown as Record<CdnTtlKey, Record<string, string>>;

/**
 * No-cache headers for private/authenticated routes.
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store',
} as const;
