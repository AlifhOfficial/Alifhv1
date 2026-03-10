/**
 * Search Cache - Server-only
 * 
 * Cached search functions using Next.js unstable_cache.
 * Facets change rarely, so we cache them for 1 hour to reduce DB load.
 * 
 * @module lib/search-cache
 */

import { unstable_cache } from 'next/cache';
import { getSearchFacets as getSearchFacetsUncached, type SearchParams, type SearchFacets } from '@alifh/database';

// 1 hour TTL for facets (they rarely change)
const FACET_CACHE_TTL = 3600;

/**
 * Generate a stable cache key from search params
 * Only include params that affect facet counts
 */
function getFacetCacheKey(params: SearchParams): string {
  const keyParts: string[] = [];
  
  // Only include filters that affect facet counts
  if (params.make?.length) keyParts.push(`make:${params.make.sort().join(',')}`);
  if (params.model?.length) keyParts.push(`model:${params.model.sort().join(',')}`);
  if (params.trim?.length) keyParts.push(`trim:${params.trim.sort().join(',')}`);
  if (params.emirate?.length) keyParts.push(`emirate:${params.emirate.sort().join(',')}`);
  if (params.specs?.length) keyParts.push(`specs:${params.specs.sort().join(',')}`);
  if (params.bodyType?.length) keyParts.push(`bodyType:${params.bodyType.sort().join(',')}`);
  if (params.fuelType?.length) keyParts.push(`fuelType:${params.fuelType.sort().join(',')}`);
  if (params.transmission?.length) keyParts.push(`transmission:${params.transmission.sort().join(',')}`);
  if (params.engineSize?.length) keyParts.push(`engineSize:${params.engineSize.sort().join(',')}`);
  if (params.exteriorColor?.length) keyParts.push(`exteriorColor:${params.exteriorColor.sort().join(',')}`);
  if (params.interiorColor?.length) keyParts.push(`interiorColor:${params.interiorColor.sort().join(',')}`);
  if (params.sellerType) keyParts.push(`sellerType:${params.sellerType}`);
  if (params.yearMin) keyParts.push(`yearMin:${params.yearMin}`);
  if (params.yearMax) keyParts.push(`yearMax:${params.yearMax}`);
  if (params.priceMin) keyParts.push(`priceMin:${params.priceMin}`);
  if (params.priceMax) keyParts.push(`priceMax:${params.priceMax}`);
  if (params.mileageMax) keyParts.push(`mileageMax:${params.mileageMax}`);
  if (params.partnerId) keyParts.push(`partnerId:${params.partnerId}`);
  if (params.isBlackTierPartner) keyParts.push(`black:${params.isBlackTierPartner}`);
  if (params.q) keyParts.push(`q:${params.q}`);
  
  return keyParts.length > 0 ? keyParts.join('|') : 'all';
}

/**
 * Cached version of getSearchFacets
 * Uses Next.js unstable_cache with 1 hour TTL
 */
export async function getCachedSearchFacets(params: SearchParams): Promise<SearchFacets> {
  const cacheKey = getFacetCacheKey(params);
  
  const cachedFn = unstable_cache(
    async () => {
      const startTime = Date.now();
      const result = await getSearchFacetsUncached(params);
      const took = Date.now() - startTime;
      
      if (took > 200) {
        console.log(`[facets-cache] MISS: ${took}ms key=${cacheKey.substring(0, 50)}`);
      }
      
      return result;
    },
    ['search-facets', cacheKey],
    {
      revalidate: FACET_CACHE_TTL,
      tags: ['search-facets'],
    }
  );
  
  return cachedFn();
}

// Re-export for convenience
export { getSearchFacetsUncached as getSearchFacets };
