/**
 * Showroom Cache - Server-only
 * 
 * Caches showroom queries via Vercel Data Cache.
 * 
 * Cache durations:
 * - Showroom metadata: 5 min (brand content changes infrequently)
 * - Showroom listings: 5 min (inventory needs fresh updates)
 * - Search facets: 1 hour (filter counts change slowly)
 * - Published directory: 5 min (new showrooms are rare)
 * 
 * @module lib/showroom-cache
 */

import { unstable_cache } from 'next/cache';
import {
  getPublishedShowroomBySlug,
  getPublishedShowroomByPartnerId,
  getPublishedShowrooms,
  searchListings,
  getSearchFacets,
  type SearchParams,
} from '@alifh/database';

// Cache showroom by slug for 5 minutes
const _getCachedShowroomBySlug = unstable_cache(
  async (slug: string) => getPublishedShowroomBySlug(slug),
  ['showroom-by-slug'],
  { revalidate: 300 }
);

// Cache showroom by partner ID for 5 minutes
const _getCachedShowroomByPartnerId = unstable_cache(
  async (partnerId: string) => getPublishedShowroomByPartnerId(partnerId),
  ['showroom-by-partner-id'],
  { revalidate: 300 }
);

// Cache showroom listings for 5 minutes
const _getCachedShowroomListings = unstable_cache(
  async (params: SearchParams) => searchListings(params, { fast: true }),
  ['showroom-listings'],
  { revalidate: 300 }
);

// Cache showroom search facets for 1 hour
const _getCachedShowroomFacets = unstable_cache(
  async (params: SearchParams) => getSearchFacets(params),
  ['showroom-facets'],
  { revalidate: 3600 }
);

// Cache published showrooms directory for 5 minutes
const _getCachedPublishedShowrooms = unstable_cache(
  async (page: number, limit: number) => getPublishedShowrooms(page, limit),
  ['published-showrooms'],
  { revalidate: 300 }
);

// Exported wrapper functions
export async function getCachedShowroomBySlug(slug: string) {
  return _getCachedShowroomBySlug(slug);
}

export async function getCachedShowroomByPartnerId(partnerId: string) {
  return _getCachedShowroomByPartnerId(partnerId);
}

export async function getCachedShowroomListings(params: SearchParams) {
  return _getCachedShowroomListings(params);
}

export async function getCachedShowroomFacets(params: SearchParams) {
  return _getCachedShowroomFacets(params);
}

export async function getCachedPublishedShowrooms(page: number, limit: number) {
  return _getCachedPublishedShowrooms(page, limit);
}
