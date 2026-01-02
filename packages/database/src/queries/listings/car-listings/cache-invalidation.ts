/**
 * Listing Cache Invalidation - Production
 * 
 * Helper functions to invalidate listing caches when data changes.
 * Use these after any CREATE, UPDATE, DELETE operations on listings.
 * 
 * USAGE:
 * - After listing update → invalidateListingDetail(id)
 * - After listing publish → invalidateListingCaches(id, partnerId)
 * - After listing delete → invalidateListingCaches(id, partnerId)
 * - After partner tier change → invalidatePartnerInventory(partnerId)
 * 
 * @module queries/listings/cache-invalidation
 */

import { memoryCache, CacheKeys } from '../../../caches';

/**
 * Invalidate single listing detail cache
 * Use after: listing update, status change, engagement metrics update
 */
export function invalidateListingDetail(listingId: string): void {
  const key = CacheKeys.listingDetail(listingId);
  // Also clear legacy detailed API key to avoid stale responses.
  const legacyDetailedKey = `listing:detailed:${listingId}`;
  memoryCache.delete(key, legacyDetailedKey);
}

/**
 * Invalidate all caches for a specific listing
 * Use after: major listing updates, publish, archive, delete
 */
export function invalidateListingCaches(listingId: string, partnerId?: string): void {
  // Invalidate detail cache
  invalidateListingDetail(listingId);
  
  // Invalidate partner inventory if partnerId provided
  if (partnerId) {
    invalidatePartnerInventory(partnerId);
  }
}

/**
 * Invalidate partner inventory caches
 * Use after: new listing published, listing archived, partner tier change
 */
export function invalidatePartnerInventory(partnerId: string): void {
  // Note: In production with Redis, use pattern matching to delete all keys
  // For memory cache, we track keys that need manual invalidation
  
  // Invalidate common status variations
  const statuses = ['all', 'public', 'draft', 'archived', 'sold', 'expired', 'pending'];
  const keys = statuses.map(status => 
    CacheKeys.partnerInventory(partnerId, status === 'all' ? undefined : status)
  );
  
  memoryCache.delete(...keys);
}

/**
 * Invalidate all listing card caches
 * Use after: bulk operations, data migrations, major updates
 * WARNING: Heavy operation - use sparingly
 */
export function invalidateAllListingCards(): void {
  // In production with Redis, use SCAN with pattern matching
  // For memory cache, this requires clearing all listing-related keys
  memoryCache.clear();
  console.warn('[cache] Cleared ALL cache (heavy operation)');
}

/**
 * Invalidate batch listing cache by IDs
 * Use after: favorite/superlike counts change
 */
export function invalidateBatchCache(listingIds: string[]): void {
  if (listingIds.length === 0) return;
  
  // Invalidate batch cache key
  const batchKey = CacheKeys.listingCardsBatch(listingIds);
  memoryCache.delete(batchKey);
  
  // Also invalidate individual listing details
  listingIds.forEach(id => invalidateListingDetail(id));
  
  console.log(`[cache] Invalidated batch cache for ${listingIds.length} listings`);
}

/**
 * Smart cache invalidation after listing update
 * Automatically determines which caches to invalidate based on changed fields
 */
export function smartInvalidateListing(
  listingId: string, 
  partnerId: string | null,
  changedFields: string[]
): void {
  const criticalFields = [
    'moderationStatus', 'lifecycleStatus', 'expiresAt', 'publishedAt', 'price', 'images', 'thumbnail', 'qiScore',
    'isFeatured', 'isBlkListing', 'make', 'model', 'year'
  ];
  
  const hasCriticalChanges = changedFields.some(field => criticalFields.includes(field));
  
  if (hasCriticalChanges) {
    // Major change - invalidate everything
    invalidateListingCaches(listingId, partnerId || undefined);
  } else {
    // Minor change - just invalidate detail
    invalidateListingDetail(listingId);
  }
  
  console.log(`[cache] Smart invalidation: ${listingId} (${changedFields.length} fields changed)`);
}
