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

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
  getPublishedShowroomBySlug,
  getPublishedShowroomByPartnerId,
  getPublishedShowrooms,
  searchListings,
  getSearchFacets,
  type SearchParams,
} from '@alifh/database';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

const _getCachedShowroomBySlug = unstable_cache(
  async (slug: string) => {
    dbg(`MISS showroom-by-slug slug=${slug}`);
    return getPublishedShowroomBySlug(slug);
  },
  ['showroom-by-slug'],
  { revalidate: 300 }
);

const _getCachedShowroomByPartnerId = unstable_cache(
  async (partnerId: string) => {
    dbg(`MISS showroom-by-partner-id partnerId=${partnerId}`);
    return getPublishedShowroomByPartnerId(partnerId);
  },
  ['showroom-by-partner-id'],
  { revalidate: 300 }
);

const _getCachedShowroomListings = unstable_cache(
  async (params: SearchParams) => {
    dbg(`MISS showroom-listings partnerId=${(params as any).partnerId}`);
    return searchListings(params, { fast: true });
  },
  ['showroom-listings'],
  { revalidate: 300 }
);

const _getCachedShowroomFacets = unstable_cache(
  async (params: SearchParams) => {
    dbg(`MISS showroom-facets partnerId=${(params as any).partnerId}`);
    return getSearchFacets(params);
  },
  ['showroom-facets'],
  { revalidate: 3600 }
);

const _getCachedPublishedShowrooms = unstable_cache(
  async (page: number, limit: number) => {
    dbg(`MISS published-showrooms page=${page}`);
    return getPublishedShowrooms(page, limit);
  },
  ['published-showrooms'],
  { revalidate: 300 }
);

export const getCachedShowroomBySlug = cache(async (slug: string) => {
  dbg(`REQUEST showroom-by-slug slug=${slug}`);
  return _getCachedShowroomBySlug(slug);
});

export const getCachedShowroomByPartnerId = cache(async (partnerId: string) => {
  dbg(`REQUEST showroom-by-partner-id partnerId=${partnerId}`);
  return _getCachedShowroomByPartnerId(partnerId);
});

export const getCachedShowroomListings = cache(async (params: SearchParams) => {
  dbg(`REQUEST showroom-listings partnerId=${(params as any).partnerId}`);
  return _getCachedShowroomListings(params);
});

export const getCachedShowroomFacets = cache(async (params: SearchParams) => {
  dbg(`REQUEST showroom-facets partnerId=${(params as any).partnerId}`);
  return _getCachedShowroomFacets(params);
});

export const getCachedPublishedShowrooms = cache(async (page: number, limit: number) => {
  dbg(`REQUEST published-showrooms page=${page}`);
  return _getCachedPublishedShowrooms(page, limit);
});
