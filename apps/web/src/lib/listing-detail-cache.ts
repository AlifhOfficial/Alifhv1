/**
 * Listing Detail Cache - Server-only
 * 
 * Caches listing detail queries via Vercel Data Cache.
 * - Listing detail: 5 min (price/status changes need quick updates)
 * - Similar listings: 12 hours (changes infrequently, reduces DB load)
 * - Profiles: 5 min (contact/business info may change)
 * - Stats: 24 hours (counts update slowly, expensive queries)
 * - Showroom check: 5 min (showroom activation is rare)
 * 
 * @module lib/listing-detail-cache
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
  getListingDetailed,
  getSimilarListings,
  getDealerBaseProfile,
  getUserProfileByUserId,
  getStaffEffectivePhone,
  calculatePartnerStats,
  hasPublishedShowroom,
  type SimilarListingsParams,
} from '@alifh/database';
import { getCachedUserStats } from '@/lib/user-stats-cache';

const DEBUG = process.env.CACHE_DEBUG === '1';
const dbg = (msg: string) => { if (DEBUG) console.warn(`[cache] ${msg}`); };

// Cache listing detail for 5 minutes
const _getCachedListingDetailed = unstable_cache(
  async (listingId: string) => {
    dbg(`MISS listing-detail id=${listingId}`);
    return getListingDetailed(listingId);
  },
  ['listing-detail'],
  { revalidate: 300, tags: ['listing-detail'] }
);
export const getCachedListingDetailed = cache(async (listingId: string) => {
  dbg(`REQUEST listing-detail id=${listingId}`);
  return _getCachedListingDetailed(listingId);
});

// Cache similar listings for 12 hours
const _getCachedSimilarListings = unstable_cache(
  async (params: SimilarListingsParams) => {
    dbg(`MISS similar-listings excludeId=${params.excludeId}`);
    return getSimilarListings(params);
  },
  ['similar-listings'],
  { revalidate: 43200 }
);
export const getCachedSimilarListings = cache(async (params: SimilarListingsParams) => {
  dbg(`REQUEST similar-listings excludeId=${params.excludeId}`);
  return _getCachedSimilarListings(params);
});

// Cache partner profile for 5 minutes
const _getCachedDealerProfile = unstable_cache(
  async (partnerId: string) => {
    dbg(`MISS dealer-profile partnerId=${partnerId}`);
    return getDealerBaseProfile(partnerId);
  },
  ['dealer-profile'],
  { revalidate: 300 }
);
export const getCachedDealerProfile = cache(async (partnerId: string) => {
  dbg(`REQUEST dealer-profile partnerId=${partnerId}`);
  return _getCachedDealerProfile(partnerId);
});

// Cache user profile for 5 minutes
const _getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    dbg(`MISS user-profile userId=${userId}`);
    return getUserProfileByUserId(userId);
  },
  ['user-profile'],
  { revalidate: 300 }
);
export const getCachedUserProfile = cache(async (userId: string) => {
  dbg(`REQUEST user-profile userId=${userId}`);
  return _getCachedUserProfile(userId);
});

// Cache staff contact for 5 minutes
const _getCachedStaffContact = unstable_cache(
  async (userId: string, partnerId: string) => {
    dbg(`MISS staff-contact userId=${userId} partnerId=${partnerId}`);
    return getStaffEffectivePhone(userId, partnerId);
  },
  ['staff-contact'],
  { revalidate: 300 }
);
export const getCachedStaffContact = cache(async (userId: string, partnerId: string) => {
  dbg(`REQUEST staff-contact userId=${userId} partnerId=${partnerId}`);
  return _getCachedStaffContact(userId, partnerId);
});

// Cache partner stats for 24 hours
const _getCachedPartnerStats = unstable_cache(
  async (partnerId: string) => {
    dbg(`MISS partner-stats partnerId=${partnerId}`);
    return calculatePartnerStats(partnerId);
  },
  ['partner-stats'],
  { revalidate: 86400 }
);
export const getCachedPartnerStats = cache(async (partnerId: string) => {
  dbg(`REQUEST partner-stats partnerId=${partnerId}`);
  return _getCachedPartnerStats(partnerId);
});

export { getCachedUserStats };

// Cache showroom check for 5 minutes
const _getCachedHasShowroom = unstable_cache(
  async (partnerId: string) => {
    dbg(`MISS has-showroom partnerId=${partnerId}`);
    return hasPublishedShowroom(partnerId);
  },
  ['has-showroom'],
  { revalidate: 300 }
);
export const getCachedHasShowroom = cache(async (partnerId: string) => {
  dbg(`REQUEST has-showroom partnerId=${partnerId}`);
  return _getCachedHasShowroom(partnerId);
});
