/**
 * Cache Invalidation - Centralized
 * 
 * Single source of truth for all cache invalidation logic.
 * Import from @alifh/database and use after mutations.
 * 
 * PATTERN:
 * 1. Mutation happens (create/update/delete)
 * 2. Call appropriate invalidate function
 * 3. Cache clears automatically
 * 
 * @module caches/invalidation
 */

import { memoryCache, CacheKeys, CachePrefixes } from './memory-cache';

// Re-export CacheKeys for use in other modules
export { CacheKeys };

// ============================================================================
// LISTINGS
// ============================================================================

/**
 * Invalidate all search-related caches
 * Use after: listing create, update, delete, status change
 */
export function invalidateSearchCaches(): void {
  const deletedSearch = memoryCache.deleteByPrefix(CachePrefixes.search);
  const deletedSuggest = memoryCache.deleteByPrefix('suggest:');
  const deletedBlack = memoryCache.deleteByPrefix('listings:black:');
  const deletedCards = memoryCache.deleteByPrefix('listings:cards:');
  const deletedPartner = memoryCache.deleteByPrefix('listings:partner:');
  
  const total = deletedSearch + deletedSuggest + deletedBlack + deletedCards + deletedPartner;
  if (total > 0) {
    console.log(`[cache] Invalidated search caches: ${deletedSearch} search, ${deletedSuggest} suggest, ${deletedCards} cards, ${deletedPartner} partner, ${deletedBlack} black`);
  }
}

/**
 * Invalidate single listing detail cache
 * Use after: listing update, status change, engagement metrics update
 */
export function invalidateListingDetail(listingId: string): void {
  const key = CacheKeys.listingDetail(listingId);
  const legacyDetailedKey = `listing:detailed:${listingId}`;
  const detailedKey = CacheKeys.listingDetailed(listingId);
  memoryCache.delete(key, legacyDetailedKey, detailedKey);
  console.log(`[cache] Invalidated listing detail: ${listingId}`);
}

/**
 * Invalidate all caches for a specific listing
 * Use after: major listing updates, publish, archive, delete, mark sold
 * Also invalidates user stats since listing count/sold count may have changed
 */
export function invalidateListingCaches(listingId: string, partnerId?: string, userId?: string): void {
  invalidateListingDetail(listingId);
  
  if (partnerId) {
    invalidatePartnerInventory(partnerId);
  }
  
  // Invalidate user's personal my-listings cache and stats
  if (userId) {
    invalidateUserStats(userId);
    invalidateUserMyListings(userId);
  }
  
  invalidateSearchCaches();
}

/**
 * Invalidate partner inventory caches
 * Use after: new listing published, listing archived, partner tier change
 */
export function invalidatePartnerInventory(partnerId: string): void {
  const statuses = ['all', 'public', 'draft', 'archived', 'sold', 'expired', 'pending'];
  const keys = statuses.map(status => 
    CacheKeys.partnerInventory(partnerId, status === 'all' ? undefined : status)
  );
  memoryCache.delete(...keys);
}

/**
 * Invalidate user's personal "my listings" cache
 * Use after: listing create, update, delete, status change
 */
export function invalidateUserMyListings(userId: string): void {
  // Delete all my-listings cache entries for this user (prefix-based)
  const deleted = memoryCache.deleteByPrefix(`user:${userId}:my-listings`);
  if (deleted > 0) {
    console.log(`[cache] Invalidated my-listings for user: ${userId} (${deleted} entries)`);
  }
}

/**
 * Invalidate user's bookings cache
 * Use after: booking create, cancel, reschedule, status change
 */
export function invalidateUserBookings(userId: string): void {
  const deleted = memoryCache.deleteByPrefix(`user:${userId}:bookings`);
  if (deleted > 0) {
    console.log(`[cache] Invalidated bookings for user: ${userId} (${deleted} entries)`);
  }
}

// ============================================================================
// FAVORITES & ENGAGEMENT
// ============================================================================

/**
 * Invalidate user's favorites/superlikes cache
 * Use after: favorite toggle, superlike toggle
 * 
 * Clears both:
 * - favorites:status:{userId} (IDs only)
 * - favorites:status:full:{userId} (with listing data)
 */
export function invalidateFavoritesCache(userId: string): void {
  const key = `favorites:status:${userId}`;
  const fullKey = `favorites:status:full:${userId}`;
  memoryCache.delete(key, fullKey);
  console.log(`[cache] Invalidated favorites for user: ${userId}`);
}

// ============================================================================
// PROFILES
// ============================================================================

/**
 * Invalidate partner profile cache
 * Use after: partner profile update
 */
export function invalidatePartnerProfile(partnerId: string): void {
  const key = `partner:profile:${partnerId}`;
  memoryCache.delete(key);
  console.log(`[cache] Invalidated partner profile: ${partnerId}`);
}

/**
 * Invalidate dealer base profile cache
 * Use after: dealer profile update (logo, brand, contact, etc.)
 */
export function invalidateDealerBaseProfile(partnerId: string): void {
  const key = CacheKeys.dealerBaseProfile(partnerId);
  const miniKey = CacheKeys.partnerMiniProfile(partnerId);
  memoryCache.delete(key, miniKey);
  console.log(`[cache] Invalidated dealer base profile: ${partnerId}`);
}

/**
 * Invalidate staff phone cache
 * Use after: staff profile update (workPhone, usePersonalPhone, displayName change)
 */
export function invalidateStaffPhone(staffUserId: string, partnerId: string): void {
  const key = CacheKeys.staffPhone(staffUserId, partnerId);
  memoryCache.delete(key);
  console.log(`[cache] Invalidated staff phone: ${staffUserId}@${partnerId}`);
}

/**
 * Invalidate listing detailed query cache
 * Use after: listing update, status change (called by invalidateListingDetail)
 */
export function invalidateListingDetailed(listingId: string): void {
  const key = CacheKeys.listingDetailed(listingId);
  memoryCache.delete(key);
}

/**
 * Invalidate search caches when partner profile changes affect their listings
 * Use after: logo change, brandName change (partner info visible in car cards)
 * 
 * Similar to invalidateUserListingsInSearch but for partner/dealer profiles.
 * Listing search results join partner data (logo, brandName) and cache the result.
 */
export function invalidatePartnerListingsInSearch(partnerId: string): void {
  // Clear all search caches since we don't know which contain this partner's listings
  invalidateSearchCaches();
  
  // Also clear partner inventory caches
  invalidatePartnerInventory(partnerId);
  
  console.log(`[cache] Invalidated search caches for partner profile change: ${partnerId}`);
}

/**
 * Invalidate comprehensive partner profile cache
 * Use after: any partner profile update (dashboard form, settings, etc.)
 * Also invalidates dealer base profile and mini profile for consistency
 */
export function invalidatePartnerProfileComprehensive(partnerId: string): void {
  const keys = [
    CacheKeys.partnerProfileComprehensive(partnerId),
    CacheKeys.dealerBaseProfile(partnerId),
    CacheKeys.partnerMiniProfile(partnerId),
  ];
  memoryCache.delete(...keys);
  console.log(`[cache] Invalidated partner profile comprehensive: ${partnerId}`);
}

/**
 * Invalidate user profile cache
 * Use after: user profile update, stats change, passkeys change, KYC status change
 * 
 * Uses CacheKeys.userProfile for single source of truth
 */
export function invalidateUserProfile(userId: string): void {
  const key = CacheKeys.userProfile(userId);
  memoryCache.delete(key);
  console.log(`[cache] Invalidated user profile: ${userId}`);
}

/**
 * Invalidate search caches when user profile changes affect their listings
 * Use after: avatar change, name change, phone change (seller info visible in cards)
 * 
 * This is necessary because listing search results join user profile data
 * (sellerAvatarUrl, sellerName, etc.) and cache the combined result.
 * When profile changes, cached listings show stale seller info.
 */
export function invalidateUserListingsInSearch(userId: string): void {
  // Clear all search caches since we don't know which contain this user's listings
  // This is a bit aggressive but ensures freshness for seller info changes
  invalidateSearchCaches();
  
  // Also clear listing detail caches that might show seller info
  const deletedDetails = memoryCache.deleteByPrefix('listing:detail:');
  const deletedDetailed = memoryCache.deleteByPrefix('listing:detailed:');
  
  console.log(`[cache] Invalidated search caches for user profile change: ${userId} (cleared ${deletedDetails + deletedDetailed} detail entries)`);
}

/**
 * Invalidate user profile stats
 * Use after: listing created, listing sold, conversation responded
 * This also invalidates the full user profile cache since it includes stats
 */
export function invalidateUserStats(userId: string): void {
  invalidateUserProfile(userId); // Stats are part of profile cache now
  console.log(`[cache] Invalidated user stats (via profile): ${userId}`);
}

// ============================================================================
// NUCLEAR OPTIONS
// ============================================================================

/**
 * Clear ALL caches
 * Use after: data migrations, major system updates
 * WARNING: Heavy operation - use sparingly
 */
export function invalidateAllCaches(): void {
  memoryCache.clear();
  console.warn('[cache] Cleared ALL caches (nuclear option)');
}
