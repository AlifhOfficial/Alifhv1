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

// ============================================================================
// LISTINGS
// ============================================================================

/**
 * Invalidate all search-related caches
 * Use after: listing create, update, delete, status change
 */
export function invalidateSearchCaches(): void {
  const deletedSearch = memoryCache.deleteByPrefix(CachePrefixes.search);
  const deletedBlack = memoryCache.deleteByPrefix('listings:black:');
  const deletedCards = memoryCache.deleteByPrefix('listings:cards:');
  const deletedPartner = memoryCache.deleteByPrefix('listings:partner:');
  
  const total = deletedSearch + deletedBlack + deletedCards + deletedPartner;
  if (total > 0) {
    console.log(`[cache] Invalidated search caches: ${deletedSearch} search, ${deletedCards} cards, ${deletedPartner} partner, ${deletedBlack} black`);
  }
}

/**
 * Invalidate single listing detail cache
 * Use after: listing update, status change, engagement metrics update
 */
export function invalidateListingDetail(listingId: string): void {
  const key = CacheKeys.listingDetail(listingId);
  const legacyDetailedKey = `listing:detailed:${listingId}`;
  memoryCache.delete(key, legacyDetailedKey);
  console.log(`[cache] Invalidated listing detail: ${listingId} (keys: ${key}, ${legacyDetailedKey})`);
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
  
  // Invalidate user stats if listing is personal (affects listings count, sold count)
  if (userId) {
    invalidateUserStats(userId);
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

// ============================================================================
// FAVORITES & ENGAGEMENT
// ============================================================================

/**
 * Invalidate user's favorites/superlikes cache
 * Use after: favorite toggle, superlike toggle
 */
export function invalidateFavoritesCache(userId: string): void {
  const key = `favorites:status:${userId}`;
  memoryCache.delete(key);
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
 * Use after: user profile update, stats change, passkeys change
 */
export function invalidateUserProfile(userId: string): void {
  const key = `user:profile:${userId}`;
  memoryCache.delete(key);
  console.log(`[cache] Invalidated user profile: ${userId}`);
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
