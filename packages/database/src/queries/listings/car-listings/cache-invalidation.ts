/**
 * Listing Cache Invalidation - DEPRECATED
 * 
 * This file is kept for backward compatibility.
 * Import from @alifh/database instead:
 * 
 * import {
 *   invalidateSearchCaches,
 *   invalidateListingCaches,
 *   invalidateListingDetail,
 *   invalidatePartnerInventory
 * } from '@alifh/database';
 * 
 * @deprecated Use @alifh/database/caches instead
 */

import { memoryCache, CacheKeys } from '../../../caches/memory-cache';
import { 
  invalidateListingDetail,
  invalidateListingCaches,
  invalidateSearchCaches,
  invalidatePartnerInventory,
} from '../../../caches/invalidation';

// Re-export from centralized location
export {
  invalidateSearchCaches,
  invalidateListingDetail,
  invalidateListingCaches,
  invalidatePartnerInventory,
} from '../../../caches/invalidation';


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
  // Fields that affect search results/ranking
  const searchCriticalFields = [
    'moderationStatus', 'lifecycleStatus', 'expiresAt', 'publishedAt', 
    'price', 'qiScore', 'isFeatured', 'isBlkListing', 
    'make', 'model', 'year', 'bodyType', 'fuelType', 'transmission',
    'emirate', 'specs', 'condition', 'mileage', 'isNegotiable'
  ];
  
  // Fields that only affect detail view (not search results)
  const detailOnlyFields = [
    'description', 'images', 'thumbnail', 'vin', 'extras', 'technicalFeatures',
    'viewCount', 'impressionCount', 'favouriteCount', 'superlikeCount'
  ];
  
  const hasSearchCriticalChanges = changedFields.some(field => 
    searchCriticalFields.includes(field)
  );
  
  if (hasSearchCriticalChanges) {
    // Major change affecting search - invalidate everything
    invalidateListingCaches(listingId, partnerId || undefined);
  } else {
    // Minor change - just invalidate detail
    invalidateListingDetail(listingId);
  }
  
  console.log(`[cache] Smart invalidation: ${listingId} (${changedFields.length} fields, search=${hasSearchCriticalChanges})`);
}

/**
 * UAE Popular Makes - Pre-warm these searches for instant response
 * Based on market data: Toyota, Nissan, Honda lead, followed by luxury brands
 */
export const UAE_POPULAR_MAKES = [
  'Toyota',
  'Nissan', 
  'Honda',
  'Hyundai',
  'Mitsubishi',
  'Ford',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Land Rover',
  'Lexus',
  'Jetour',
  'BYD',
] as const;

/**
 * Popular search combinations to pre-warm
 */
export const POPULAR_SEARCHES = [
  // Default homepage
  { },
  // Conditions
  { condition: 'new' as const },
  { condition: 'used' as const },
  // Black listings (signature page)
  { isBlkListing: true },
  // Popular makes
  ...UAE_POPULAR_MAKES.map(make => ({ make })),
] as const;
