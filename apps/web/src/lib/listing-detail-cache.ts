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

// Cache listing detail for 5 minutes
export const getCachedListingDetailed = unstable_cache(
  async (listingId: string) => getListingDetailed(listingId),
  ['listing-detail'],
  { revalidate: 300, tags: ['listing-detail'] }
);

// Cache similar listings for 12 hours
export const getCachedSimilarListings = unstable_cache(
  async (params: SimilarListingsParams) => getSimilarListings(params),
  ['similar-listings'],
  { revalidate: 43200 }
);

// Cache partner profile for 5 minutes
export const getCachedDealerProfile = unstable_cache(
  async (partnerId: string) => getDealerBaseProfile(partnerId),
  ['dealer-profile'],
  { revalidate: 300 }
);

// Cache user profile for 5 minutes
export const getCachedUserProfile = unstable_cache(
  async (userId: string) => getUserProfileByUserId(userId),
  ['user-profile'],
  { revalidate: 300 }
);

// Cache staff contact for 5 minutes
export const getCachedStaffContact = unstable_cache(
  async (userId: string, partnerId: string) => getStaffEffectivePhone(userId, partnerId),
  ['staff-contact'],
  { revalidate: 300 }
);

// Cache partner stats for 24 hours
export const getCachedPartnerStats = unstable_cache(
  async (partnerId: string) => calculatePartnerStats(partnerId),
  ['partner-stats'],
  { revalidate: 86400 }
);

export { getCachedUserStats };

// Cache showroom check for 5 minutes
export const getCachedHasShowroom = unstable_cache(
  async (partnerId: string) => hasPublishedShowroom(partnerId),
  ['has-showroom'],
  { revalidate: 300 }
);
