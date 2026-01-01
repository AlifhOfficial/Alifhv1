/**
 * Listing Search Query - Faceted Search with Full Filters
 * 
 * Features:
 * - 3-tier filters: basic (text), medium (common), advanced (all)
 * - Faceted counts for filter UI
 * - Full-text search with pg_trgm (fuzzy matching)
 * - Optimized 2-step pattern (IDs first, then details)
 * 
 * @module queries/listings/car-listings/search-query
 */

import { eq, and, desc, inArray, SQL, sql, or, gte, lte, ilike, isNotNull, gt, asc, count } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { user } from '../../../schema/auth';
import { userProfile } from '../../../schema/profile';
import { partner } from '../../../schema/partner';
import { isPublicSql, isBlackMemberSql } from './sql-fragments';
import type { 
  SearchParams, 
  SearchResponse, 
  SearchResultItem, 
  SearchFacets, 
  FacetBucket 
} from '../../../schema/search-types';
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  UAE_EMIRATES,
} from '../../../schema/listing-constants';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/**
 * Build WHERE conditions for public listings base
 */
function buildPublicBaseConditions(now: Date): SQL[] {
  return [
    eq(carListing.moderationStatus, 'approved'),
    eq(carListing.lifecycleStatus, 'active'),
    eq(carListing.needsRemoderation, false),
    and(isNotNull(carListing.expiresAt), gt(carListing.expiresAt, now)),
  ];
}

/**
 * Build search conditions from params
 */
function buildSearchConditions(params: SearchParams, now: Date): SQL[] {
  const conditions: SQL[] = [...buildPublicBaseConditions(now)];

  // === BASIC TIER ===
  
  // Text search (q) - searches make, model, trim
  if (params.q?.trim()) {
    const searchTerm = `%${params.q.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(carListing.make, searchTerm),
        ilike(carListing.model, searchTerm),
        ilike(carListing.trim, searchTerm),
        // Combined make + model search (e.g., "Toyota Camry")
        sql`lower(${carListing.make} || ' ' || ${carListing.model}) LIKE ${searchTerm}`
      )!
    );
  }

  // === MEDIUM TIER ===
  
  // Make filter
  if (params.make?.length) {
    conditions.push(inArray(carListing.make, params.make));
  }

  // Model filter
  if (params.model?.length) {
    conditions.push(inArray(carListing.model, params.model));
  }

  // Year range
  if (params.yearMin) {
    conditions.push(gte(carListing.year, params.yearMin));
  }
  if (params.yearMax) {
    conditions.push(lte(carListing.year, params.yearMax));
  }

  // Price range
  if (params.priceMin) {
    conditions.push(gte(carListing.price, params.priceMin));
  }
  if (params.priceMax) {
    conditions.push(lte(carListing.price, params.priceMax));
  }

  // Mileage max
  if (params.mileageMax) {
    conditions.push(lte(carListing.mileage, params.mileageMax));
  }

  // Emirate filter
  if (params.emirate?.length) {
    conditions.push(inArray(carListing.emirate, params.emirate));
  }

  // Specs filter
  if (params.specs?.length) {
    conditions.push(inArray(carListing.specs, params.specs));
  }

  // === ADVANCED TIER ===

  // Body type
  if (params.bodyType?.length) {
    conditions.push(inArray(carListing.bodyType, params.bodyType));
  }

  // Fuel type
  if (params.fuelType?.length) {
    conditions.push(inArray(carListing.fuelType, params.fuelType));
  }

  // Transmission
  if (params.transmission?.length) {
    conditions.push(inArray(carListing.transmission, params.transmission));
  }

  // Engine size
  if (params.engineSize?.length) {
    conditions.push(inArray(carListing.engineSize, params.engineSize));
  }

  // Exterior color
  if (params.exteriorColor?.length) {
    conditions.push(inArray(carListing.exteriorColor, params.exteriorColor));
  }

  // Interior color
  if (params.interiorColor?.length) {
    conditions.push(inArray(carListing.interiorColor, params.interiorColor));
  }

  // Doors
  if (params.doors?.length) {
    conditions.push(inArray(carListing.doors, params.doors));
  }

  // Seating capacity
  if (params.seatingCapacity?.length) {
    conditions.push(inArray(carListing.seatingCapacity, params.seatingCapacity));
  }

  // Seller type
  if (params.sellerType) {
    conditions.push(eq(carListing.sellerType, params.sellerType));
  }

  // Partner ID
  if (params.partnerId) {
    conditions.push(eq(carListing.partnerId, params.partnerId));
  }

  // Partner verified
  if (params.partnerVerified === true) {
    conditions.push(eq(carListing.partnerVerified, true));
  }

  // Negotiable
  if (params.isNegotiable !== undefined) {
    conditions.push(eq(carListing.isNegotiable, params.isNegotiable));
  }

  // Tags (JSONB contains check)
  if (params.tags?.length) {
    // Check if listing tags contains any of the requested tags
    conditions.push(
      sql`${carListing.tags} ?| array[${sql.join(params.tags.map(t => sql`${t}`), sql`, `)}]`
    );
  }

  return conditions;
}

/**
 * Build ORDER BY clause
 */
function buildOrderBy(params: SearchParams): SQL[] {
  const { sortBy = 'newest', sortOrder } = params;

  switch (sortBy) {
    case 'newest':
      return [sql`${carListing.publishedAt} desc nulls last`, desc(carListing.createdAt)];
    case 'oldest':
      return [sql`${carListing.publishedAt} asc nulls last`, asc(carListing.createdAt)];
    case 'price_low':
      return [asc(carListing.price), desc(carListing.createdAt)];
    case 'price_high':
      return [desc(carListing.price), desc(carListing.createdAt)];
    case 'mileage_low':
      return [asc(carListing.mileage), desc(carListing.createdAt)];
    case 'year_new':
      return [desc(carListing.year), desc(carListing.createdAt)];
    case 'year_old':
      return [asc(carListing.year), desc(carListing.createdAt)];
    case 'popular':
      return [
        sql`(${carListing.viewCount} + ${carListing.favouriteCount} * 2) desc`,
        desc(carListing.createdAt),
      ];
    case 'relevance':
    default:
      // If text search, relevance would be based on match quality
      // For now, default to newest
      return [sql`${carListing.publishedAt} desc nulls last`, desc(carListing.createdAt)];
  }
}

/**
 * Get faceted counts for a specific field
 * Uses the base public conditions + all OTHER active filters (not the current field)
 */
async function getFacetCounts(
  field: keyof typeof carListing,
  params: SearchParams,
  now: Date,
  labelMap: Record<string, string>
): Promise<FacetBucket[]> {
  // Build conditions excluding the current field
  const paramsWithoutField = { ...params };
  delete (paramsWithoutField as any)[field];
  
  const conditions = buildSearchConditions(paramsWithoutField, now);

  const results = await db
    .select({
      value: (carListing as any)[field],
      count: count(),
    })
    .from(carListing)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy((carListing as any)[field])
    .having(sql`${(carListing as any)[field]} IS NOT NULL`);

  return results
    .filter(r => r.value)
    .map(r => ({
      value: String(r.value),
      label: labelMap[String(r.value)] || String(r.value),
      count: Number(r.count),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get range facets (min/max for year, price, mileage)
 */
async function getRangeFacets(
  params: SearchParams,
  now: Date
): Promise<{ yearRange: { min: number; max: number }; priceRange: { min: number; max: number }; mileageRange: { min: number; max: number } }> {
  const conditions = buildPublicBaseConditions(now);

  const [result] = await db
    .select({
      minYear: sql<number>`min(${carListing.year})`,
      maxYear: sql<number>`max(${carListing.year})`,
      minPrice: sql<number>`min(${carListing.price})`,
      maxPrice: sql<number>`max(${carListing.price})`,
      minMileage: sql<number>`min(${carListing.mileage})`,
      maxMileage: sql<number>`max(${carListing.mileage})`,
    })
    .from(carListing)
    .where(and(...conditions));

  return {
    yearRange: { 
      min: result?.minYear || 2000, 
      max: result?.maxYear || new Date().getFullYear() + 1 
    },
    priceRange: { 
      min: result?.minPrice || 0, 
      max: result?.maxPrice || 10000000 
    },
    mileageRange: { 
      min: result?.minMileage || 0, 
      max: result?.maxMileage || 500000 
    },
  };
}

/**
 * Get make facets with counts
 */
async function getMakeFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  const paramsWithoutMake = { ...params };
  delete paramsWithoutMake.make;
  delete paramsWithoutMake.model; // Reset model when getting make facets
  
  const conditions = buildSearchConditions(paramsWithoutMake, now);

  const results = await db
    .select({
      value: carListing.make,
      count: count(),
    })
    .from(carListing)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(carListing.make);

  return results
    .filter(r => r.value)
    .map(r => ({
      value: r.value!,
      label: r.value!,
      count: Number(r.count),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get model facets (filtered by selected makes)
 */
async function getModelFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  const paramsWithoutModel = { ...params };
  delete paramsWithoutModel.model;
  
  const conditions = buildSearchConditions(paramsWithoutModel, now);

  const results = await db
    .select({
      value: carListing.model,
      count: count(),
    })
    .from(carListing)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(carListing.model);

  return results
    .filter(r => r.value)
    .map(r => ({
      value: r.value!,
      label: r.value!,
      count: Number(r.count),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Build label maps for enum facets
 */
const bodyTypeLabelMap = Object.fromEntries(BODY_TYPES.map(b => [b.value, b.label]));
const fuelTypeLabelMap = Object.fromEntries(FUEL_TYPES.map(f => [f.value, f.label]));
const transmissionLabelMap = Object.fromEntries(TRANSMISSION_TYPES.map(t => [t.value, t.label]));
const specsLabelMap = Object.fromEntries(SPECS_TYPES.map(s => [s.value, s.label]));
const engineSizeLabelMap = Object.fromEntries(ENGINE_SIZES.map(e => [e.value, e.label]));
const exteriorColorLabelMap = Object.fromEntries(EXTERIOR_COLORS.map(c => [c.value, c.label]));
const interiorColorLabelMap = Object.fromEntries(INTERIOR_COLORS.map(c => [c.value, c.label]));
const emirateLabelMap = Object.fromEntries(UAE_EMIRATES.map(e => [e.value, e.label]));
const sellerTypeLabelMap = { dealer: 'Dealer', private: 'Private Seller' };

/**
 * Get all facets in parallel
 */
async function getAllFacets(params: SearchParams, now: Date): Promise<SearchFacets> {
  const [
    make,
    model,
    ranges,
    emirate,
    specs,
    bodyType,
    fuelType,
    transmission,
    engineSize,
    exteriorColor,
    interiorColor,
    sellerType,
  ] = await Promise.all([
    getMakeFacets(params, now),
    getModelFacets(params, now),
    getRangeFacets(params, now),
    getFacetCounts('emirate', params, now, emirateLabelMap),
    getFacetCounts('specs', params, now, specsLabelMap),
    getFacetCounts('bodyType', params, now, bodyTypeLabelMap),
    getFacetCounts('fuelType', params, now, fuelTypeLabelMap),
    getFacetCounts('transmission', params, now, transmissionLabelMap),
    getFacetCounts('engineSize', params, now, engineSizeLabelMap),
    getFacetCounts('exteriorColor', params, now, exteriorColorLabelMap),
    getFacetCounts('interiorColor', params, now, interiorColorLabelMap),
    getFacetCounts('sellerType', params, now, sellerTypeLabelMap),
  ]);

  return {
    make,
    model,
    yearRange: ranges.yearRange,
    priceRange: ranges.priceRange,
    mileageRange: ranges.mileageRange,
    emirate,
    specs,
    bodyType,
    fuelType,
    transmission,
    engineSize,
    exteriorColor,
    interiorColor,
    sellerType,
  };
}

/**
 * Execute search with facets
 */
export async function searchListings(params: SearchParams): Promise<SearchResponse> {
  const startTime = Date.now();
  const now = new Date();
  
  const limit = Math.min(Math.max(params.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(params.offset || 0, 0);
  
  const conditions = buildSearchConditions(params, now);
  const orderBy = buildOrderBy(params);

  // Execute search and facets in parallel
  const [searchResults, facets, totalResult] = await Promise.all([
    // STEP 1: Get IDs with pagination
    (async () => {
      const listingIds = await db
        .select({ id: carListing.id })
        .from(carListing)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(...orderBy)
        .limit(limit + 1) // Fetch one extra to check hasMore
        .offset(offset);

      if (listingIds.length === 0) {
        return [];
      }

      const hasMore = listingIds.length > limit;
      const idsToFetch = listingIds.slice(0, limit).map(l => l.id);

      // STEP 2: Batch fetch full details
      const listings = await db
        .select({
          id: carListing.id,
          slug: carListing.slug,
          make: carListing.make,
          model: carListing.model,
          year: carListing.year,
          trim: carListing.trim,
          price: carListing.price,
          mileage: carListing.mileage,
          emirate: carListing.emirate,
          specs: carListing.specs,
          thumbnail: carListing.thumbnail,
          images: carListing.images,
          qiScore: carListing.qiScore,
          isBlackMember: isBlackMemberSql(partner),
          sellerType: carListing.sellerType,
          partnerName: sql<string | null>`coalesce(${carListing.partnerBrandName}, ${partner.brandName})`,
          partnerLogo: partner.logo,
          partnerVerified: sql<boolean | null>`coalesce(${carListing.partnerVerified}, ${partner.isVerified})`,
          sellerName: user.name,
          sellerAvatarUrl: userProfile.avatar,
        })
        .from(carListing)
        .leftJoin(user, eq(user.id, carListing.userId))
        .leftJoin(userProfile, eq(userProfile.userId, user.id))
        .leftJoin(partner, eq(partner.id, carListing.partnerId))
        .where(inArray(carListing.id, idsToFetch));

      // Restore original sort order
      const idOrder = new Map(idsToFetch.map((id, idx) => [id, idx]));
      listings.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

      return listings.map(l => ({
        ...l,
        images: l.images || [],
      })) as SearchResultItem[];
    })(),
    
    // Get facets
    getAllFacets(params, now),
    
    // Get total count (separate query for performance)
    db
      .select({ count: count() })
      .from(carListing)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const total = Number(totalResult[0]?.count || 0);
  const took = Date.now() - startTime;

  return {
    data: searchResults,
    facets,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + searchResults.length < total,
      took,
    },
    appliedFilters: params,
  };
}

/**
 * Quick search for auto-suggest (header search)
 * Returns make/model suggestions based on partial input
 */
export async function quickSearch(query: string, limit = 10): Promise<Array<{
  type: 'make' | 'model' | 'make_model';
  text: string;
  make?: string;
  model?: string;
  count: number;
}>> {
  if (!query?.trim() || query.length < 2) {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  const now = new Date();
  const conditions = buildPublicBaseConditions(now);

  // Search for matching makes and models
  const results = await db
    .select({
      make: carListing.make,
      model: carListing.model,
      count: count(),
    })
    .from(carListing)
    .where(
      and(
        ...conditions,
        or(
          ilike(carListing.make, `%${searchTerm}%`),
          ilike(carListing.model, `%${searchTerm}%`),
          sql`lower(${carListing.make} || ' ' || ${carListing.model}) LIKE ${'%' + searchTerm + '%'}`
        )
      )
    )
    .groupBy(carListing.make, carListing.model)
    .orderBy(desc(count()))
    .limit(limit * 2); // Get more to filter

  // Dedupe and categorize results
  const suggestions: Array<{
    type: 'make' | 'model' | 'make_model';
    text: string;
    make?: string;
    model?: string;
    count: number;
  }> = [];

  const seenMakes = new Set<string>();
  const seenMakeModels = new Set<string>();

  for (const r of results) {
    if (!r.make) continue;

    // Add make suggestion if not seen
    if (!seenMakes.has(r.make) && r.make.toLowerCase().includes(searchTerm)) {
      seenMakes.add(r.make);
      suggestions.push({
        type: 'make',
        text: r.make,
        make: r.make,
        count: Number(r.count),
      });
    }

    // Add make+model suggestion
    if (r.model) {
      const key = `${r.make}-${r.model}`;
      if (!seenMakeModels.has(key)) {
        seenMakeModels.add(key);
        suggestions.push({
          type: 'make_model',
          text: `${r.make} ${r.model}`,
          make: r.make,
          model: r.model,
          count: Number(r.count),
        });
      }
    }
  }

  // Sort by count and limit
  return suggestions
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
