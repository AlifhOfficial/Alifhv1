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

import { eq, and, desc, inArray, SQL, sql, or, gte, lte, ilike, isNotNull, isNull, gt, asc, count } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { partner } from '../../../schema/partner';
import { isBlkListingSql } from './sql-fragments';
import { getListingCardsByIds, type CarCardData } from './car-card-query';
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

  // Trim filter
  if (params.trim?.length) {
    conditions.push(inArray(carListing.trim, params.trim));
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

  // Condition filter (new/used)
  if (params.condition) {
    conditions.push(eq(carListing.condition, params.condition));
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

  // Private seller ID (userId)
  if (params.sellerId) {
    conditions.push(eq(carListing.userId, params.sellerId));
    conditions.push(isNull(carListing.partnerId)); // Ensure it's a private listing
  }

  // Partner verified
  if (params.partnerVerified === true) {
    conditions.push(eq(carListing.partnerVerified, true));
  }

  // Black tier partner filter
  if (params.isBlackTierPartner === true) {
    conditions.push(
      isNotNull(carListing.partnerId),
      sql`EXISTS (
        SELECT 1 FROM ${partner}
        WHERE ${partner.id} = ${carListing.partnerId}
        AND ${partner.tier} = 'black'
      )`
    );
  }

  // Negotiable
  if (params.isNegotiable !== undefined) {
    conditions.push(eq(carListing.isNegotiable, params.isNegotiable));
  }

  // Black listing filter
  if (params.isBlkListing !== undefined) {
    if (params.isBlkListing) {
      // Only show black listings
      conditions.push(eq(carListing.isBlkListing, true));
    } else {
      // Exclude black listings
      conditions.push(eq(carListing.isBlkListing, false));
    }
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
 * 
 * For "newest" and "relevance" sorts, we use originalPublishedAt instead of publishedAt
 * to prevent "bump to top" abuse where users delete and repost to get a fresh date.
 * 
 * Uses COALESCE to fall back to publishedAt if originalPublishedAt is NULL
 * (handles edge cases where anti-abuse wasn't triggered)
 */
function buildOrderBy(params: SearchParams): SQL[] {
  const { sortBy = 'relevance', sortOrder } = params;

  // COALESCE ensures we have a valid date even if originalPublishedAt is NULL
  const sortDateCol = sql`COALESCE(${carListing.originalPublishedAt}, ${carListing.publishedAt})`;

  switch (sortBy) {
    case 'newest':
      // Use originalPublishedAt to prevent repost abuse (falls back to createdAt if null)
      return [sql`${sortDateCol} desc`, desc(carListing.createdAt)];
    case 'oldest':
      return [sql`${sortDateCol} asc`, asc(carListing.createdAt)];
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
      // Quality-based ranking: photos, description, completeness, freshness, engagement, trust
      // Total: 100 points - Quality(40) + Freshness(25) + Velocity(25) + Trust(10)
      return [
        sql`(
          -- 1) QUALITY (40 points)
          (
            -- Photos (15): 10+ images = full score
            LEAST(COALESCE(jsonb_array_length(${carListing.images}), 0), 10) / 10.0 * 15 +
            -- Description (10): 250+ chars = full score
            LEAST(COALESCE(length(${carListing.description}), 0), 250) / 250.0 * 10 +
            -- Completeness (15): extras, tags, video
            (
              LEAST(COALESCE(jsonb_array_length(${carListing.extras}), 0), 6) / 6.0 * 0.5 +
              LEAST(COALESCE(jsonb_array_length(${carListing.tags}), 0), 3) / 3.0 * 0.3 +
              CASE WHEN ${carListing.videoUrl} IS NOT NULL THEN 0.2 ELSE 0 END
            ) * 15
          ) +
          -- 2) FRESHNESS (25 points) — 24-day decay with power curve, floor of 3
          GREATEST(
            POWER(
              GREATEST(
                1 - EXTRACT(EPOCH FROM (now() - ${sortDateCol})) / 2073600,
                0
              ),
              0.7
            ) * 25,
            3
          ) +
          -- 3) VELOCITY (25 points) — view-resistant engagement per day
          (
            LEAST(
              (
                LEAST(${carListing.viewCount}, 50) * 0.25 +
                ${carListing.favouriteCount} * 5 +
                ${carListing.superlikeCount} * 10
              ) /
              GREATEST(EXTRACT(EPOCH FROM (now() - ${sortDateCol})) / 86400, 1),
              50
            ) / 50.0 * 25
          ) +
          -- 4) TRUST (10 points) — verified bonus + rating
          (
            CASE WHEN ${carListing.partnerVerified} THEN 4 ELSE 0 END +
            LEAST(COALESCE(${carListing.qiScore}, 50), 100) / 100.0 * 6
          )
        ) desc`,
        desc(carListing.createdAt),
      ];
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
 * Get trim facets (filtered by selected makes and models)
 */
async function getTrimFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  const paramsWithoutTrim = { ...params };
  delete paramsWithoutTrim.trim;
  
  const conditions = buildSearchConditions(paramsWithoutTrim, now);

  const results = await db
    .select({
      value: carListing.trim,
      count: count(),
    })
    .from(carListing)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(carListing.trim);

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
 * Get all enum facets with FILTERED counts
 * 
 * For proper faceted search behavior, each facet shows counts considering
 * all OTHER active filters (but not the field being counted).
 * 
 * Example: If user filters by "Sharjah" + "sedan", the fuelType facet
 * shows counts for diesel/petrol/etc WITHIN Sharjah sedans only.
 * 
 * Uses separate queries per field to apply correct filter exclusions.
 */
async function getAllEnumFacets(
  params: SearchParams, 
  now: Date
): Promise<{
  emirate: FacetBucket[];
  specs: FacetBucket[];
  bodyType: FacetBucket[];
  fuelType: FacetBucket[];
  transmission: FacetBucket[];
  engineSize: FacetBucket[];
  exteriorColor: FacetBucket[];
  interiorColor: FacetBucket[];
  sellerType: FacetBucket[];
}> {
  // Helper to get facet counts for a field, excluding that field from filters
  const getFacetForField = async (
    fieldName: string,
    columnName: string,
    labelMap: Record<string, string>
  ): Promise<FacetBucket[]> => {
    // Build conditions excluding this field
    const paramsWithoutField = { ...params };
    delete (paramsWithoutField as any)[fieldName];
    
    const conditions = buildSearchConditions(paramsWithoutField, now);
    
    const results = await db.execute(sql`
      SELECT ${sql.raw(columnName)}::text as value, count(*)::int as count 
      FROM car_listing 
      WHERE ${conditions.length > 0 ? and(...conditions) : sql`true`}
        AND ${sql.raw(columnName)} IS NOT NULL
      GROUP BY ${sql.raw(columnName)}
      ORDER BY count DESC
    `);
    
    const rows = (results as any).rows ?? results;
    return rows.map((r: any) => ({
      value: String(r.value),
      label: labelMap[String(r.value)] || String(r.value),
      count: Number(r.count),
    }));
  };

  // Run all facet queries in parallel
  const [
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
    getFacetForField('emirate', 'emirate', emirateLabelMap),
    getFacetForField('specs', 'specs', specsLabelMap),
    getFacetForField('bodyType', 'body_type', bodyTypeLabelMap),
    getFacetForField('fuelType', 'fuel_type', fuelTypeLabelMap),
    getFacetForField('transmission', 'transmission', transmissionLabelMap),
    getFacetForField('engineSize', 'engine_size', engineSizeLabelMap),
    getFacetForField('exteriorColor', 'exterior_color', exteriorColorLabelMap),
    getFacetForField('interiorColor', 'interior_color', interiorColorLabelMap),
    getFacetForField('sellerType', 'seller_type', sellerTypeLabelMap),
  ]);

  return {
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
 * Get all facets with optimized query strategy
 * 
 * Reduced from 13 parallel queries to 5:
 * - Make, Model, Trim: 3 separate queries (need special filter exclusion)
 * - Ranges: 1 query (min/max aggregates)
 * - All enum facets: 1 consolidated UNION query
 */
async function getAllFacets(params: SearchParams, now: Date): Promise<SearchFacets> {
  const [
    make,
    model,
    trim,
    ranges,
    enumFacets,
  ] = await Promise.all([
    getMakeFacets(params, now),
    getModelFacets(params, now),
    getTrimFacets(params, now),
    getRangeFacets(params, now),
    getAllEnumFacets(params, now),
  ]);

  return {
    make,
    model,
    trim,
    yearRange: ranges.yearRange,
    priceRange: ranges.priceRange,
    mileageRange: ranges.mileageRange,
    emirate: enumFacets.emirate,
    specs: enumFacets.specs,
    bodyType: enumFacets.bodyType,
    fuelType: enumFacets.fuelType,
    transmission: enumFacets.transmission,
    engineSize: enumFacets.engineSize,
    exteriorColor: enumFacets.exteriorColor,
    interiorColor: enumFacets.interiorColor,
    sellerType: enumFacets.sellerType,
  };
}

/**
 * Exported facet fetcher for separate caching
 * Call this separately with a longer TTL than search results
 */
export async function getSearchFacets(params: SearchParams): Promise<SearchFacets> {
  const now = new Date();
  return getAllFacets(params, now);
}

/**
 * Search options for controlling what gets computed
 */
interface SearchOptions {
  /** Skip facet computation (default: false) - use when facets are cached separately */
  skipFacets?: boolean;
  /** Skip total count query (default: false) - uses hasMore from extra row fetch */
  skipTotalCount?: boolean;
}

/**
 * Execute search with optional facets and count
 */
export async function searchListings(
  params: SearchParams, 
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const startTime = Date.now();
  const now = new Date();
  
  const { skipFacets = false, skipTotalCount = false } = options;
  
  const limit = Math.min(Math.max(params.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(params.offset || 0, 0);
  
  const conditions = buildSearchConditions(params, now);
  const orderBy = buildOrderBy(params);

  // Build parallel query array dynamically
  const queries: Promise<any>[] = [
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
        return { listings: [], hasMoreFromFetch: false };
      }

      const hasMoreFromFetch = listingIds.length > limit;
      const idsToFetch = listingIds.slice(0, limit).map(l => l.id);

      // STEP 2: Use shared card query for batch fetch (avoids duplicate JOIN logic)
      const cardData = await getListingCardsByIds(idsToFetch);
      
      // Map CarCardData to SearchResultItem (same fields, just type alignment)
      const listings = cardData as unknown as SearchResultItem[];

      return {
        listings,
        hasMoreFromFetch,
      };
    })(),
  ];

  // Only include facet query if not skipped
  if (!skipFacets) {
    queries.push(getAllFacets(params, now));
  }

  // Only include total count if not skipped
  if (!skipTotalCount) {
    queries.push(
      db
        .select({ count: count() })
        .from(carListing)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    );
  }

  // Execute all queries in parallel
  const results = await Promise.all(queries);
  
  // Extract results based on what was queried
  const searchResult = results[0] as { listings: SearchResultItem[]; hasMoreFromFetch: boolean };
  let facets: SearchFacets | undefined;
  let total: number | undefined;
  
  let resultIdx = 1;
  if (!skipFacets) {
    facets = results[resultIdx++] as SearchFacets;
  }
  if (!skipTotalCount) {
    const totalResult = results[resultIdx] as Array<{ count: number }>;
    total = Number(totalResult[0]?.count || 0);
  } else {
    // When skipping total count, estimate from current batch
    // This prevents showing "0 cars" when facets are cached
    total = offset + searchResult.listings.length + (searchResult.hasMoreFromFetch ? 1 : 0);
  }

  const took = Date.now() - startTime;

  // Use hasMore from extra row fetch if total count was skipped
  const hasMore = skipTotalCount 
    ? searchResult.hasMoreFromFetch
    : (offset + searchResult.listings.length) < (total ?? 0);

  return {
    data: searchResult.listings,
    facets,
    meta: {
      total,
      limit,
      offset,
      hasMore,
      took,
    },
    appliedFilters: params,
  };
}

/**
 * Quick search for auto-suggest (header search)
 * Hierarchical: shows makes → models → trims based on context
 * 
 * OPTIMIZATION: Runs partner and make/model queries in parallel
 */
export async function quickSearch(
  query: string, 
  limit = 4,
  context?: { make?: string; model?: string }
): Promise<Array<{
  type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner';
  text: string;
  make?: string;
  model?: string;
  trim?: string;
  partnerId?: string;
  partnerName?: string;
  count: number;
}>> {
  // Allow empty query if context is provided (for popular suggestions)
  const hasValidQuery = query?.trim() && query.length >= 2;
  if (!hasValidQuery && !context) {
    return [];
  }

  const searchTerm = query?.trim().toLowerCase() || '';
  const now = new Date();
  const conditions = buildPublicBaseConditions(now);

  // Determine what to search based on context
  let makeModelQuery;

  if (context?.make && context?.model) {
    // Context: Make + Model selected → Show TRIMS only
    const trimConditions = [
      ...conditions,
      eq(carListing.make, context.make),
      eq(carListing.model, context.model),
      isNotNull(carListing.trim),
    ];
    
    // Add search filter only if query provided
    if (searchTerm) {
      trimConditions.push(ilike(carListing.trim, `%${searchTerm}%`));
    }
    
    makeModelQuery = db
      .select({
        make: carListing.make,
        model: carListing.model,
        trim: carListing.trim,
        count: count(),
      })
      .from(carListing)
      .where(and(...trimConditions))
      .groupBy(carListing.make, carListing.model, carListing.trim)
      .orderBy(desc(count()))
      .limit(limit);
  } else if (context?.make) {
    // Context: Make selected → Show MODELS only
    const modelConditions = [
      ...conditions,
      eq(carListing.make, context.make),
      isNotNull(carListing.model),
    ];
    
    // Add search filter only if query provided
    if (searchTerm) {
      modelConditions.push(ilike(carListing.model, `%${searchTerm}%`));
    }
    
    makeModelQuery = db
      .select({
        make: carListing.make,
        model: carListing.model,
        trim: sql<string | null>`NULL`.as('trim'),
        count: count(),
      })
      .from(carListing)
      .where(and(...modelConditions))
      .groupBy(carListing.make, carListing.model)
      .orderBy(desc(count()))
      .limit(limit);
  } else {
    // No context → Show MAKES and MAKE+MODEL combinations
    // If no search term, this shouldn't be called (popular makes should be used instead)
    // But we handle it gracefully by requiring a search term
    if (!searchTerm) {
      return [];
    }
    
    // Query for make+model combinations (for make_model suggestions)
    makeModelQuery = db
      .select({
        make: carListing.make,
        model: carListing.model,
        trim: sql<string | null>`NULL`.as('trim'),
        count: count(),
      })
      .from(carListing)
      .where(
        and(
          ...conditions,
          or(
            ilike(carListing.make, `${searchTerm}%`), // Prefix match is faster (can use index)
            ilike(carListing.model, `${searchTerm}%`),
            ilike(carListing.make, `%${searchTerm}%`), // Fallback to contains
            ilike(carListing.model, `%${searchTerm}%`)
          )
        )
      )
      .groupBy(carListing.make, carListing.model)
      .orderBy(desc(count()))
      .limit(limit * 2);
  }

  // Build make totals query - only needed when no context (showing makes)
  const makeTotalsQuery = (!context?.make && searchTerm) 
    ? db
        .select({
          make: carListing.make,
          count: count(),
        })
        .from(carListing)
        .where(
          and(
            ...conditions,
            ilike(carListing.make, `%${searchTerm}%`)
          )
        )
        .groupBy(carListing.make)
        .orderBy(desc(count()))
        .limit(limit)
    : Promise.resolve([]);

  // Run all queries in parallel
  const [partnerResults, makeModelResults, makeTotalsResults] = await Promise.all([
    // Partner/Dealer search - only if query provided
    searchTerm 
      ? db
          .select({
            partnerId: carListing.partnerId,
            partnerName: sql<string>`coalesce(${partner.brandName}, ${carListing.partnerBrandName})`,
            count: count(),
          })
          .from(carListing)
          .leftJoin(partner, eq(carListing.partnerId, partner.id))
          .where(
            and(
              ...conditions,
              isNotNull(carListing.partnerId),
              or(
                ilike(carListing.partnerBrandName, `%${searchTerm}%`),
                ilike(partner.brandName, `%${searchTerm}%`)
              )
            )
          )
          .groupBy(carListing.partnerId, carListing.partnerBrandName, partner.brandName)
          .orderBy(desc(count()))
          .limit(2) // Only show top 2 partner matches
      : Promise.resolve([]),
    
    makeModelQuery,
    makeTotalsQuery,
  ]);

  const suggestions: Array<{
    type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner';
    text: string;
    make?: string;
    model?: string;
    trim?: string;
    partnerId?: string;
    partnerName?: string;
    count: number;
  }> = [];

  // Process partner results - always show
  const seenPartners = new Set<string>();
  for (const r of partnerResults) {
    if (r.partnerId && r.partnerName && !seenPartners.has(r.partnerId)) {
      seenPartners.add(r.partnerId);
      suggestions.push({
        type: 'partner',
        text: r.partnerName,
        partnerId: r.partnerId,
        partnerName: r.partnerName,
        count: Number(r.count),
      });
    }
  }

  // Process make/model/trim results based on context
  if (context?.make && context?.model) {
    // Showing trims only
    const seenTrims = new Set<string>();
    for (const r of makeModelResults) {
      if (r.trim && !seenTrims.has(r.trim)) {
        seenTrims.add(r.trim);
        suggestions.push({
          type: 'make_model_trim',
          text: r.trim, // Just show trim name
          make: r.make,
          model: r.model,
          trim: r.trim,
          count: Number(r.count),
        });
      }
    }
  } else if (context?.make) {
    // Showing models only
    const seenModels = new Set<string>();
    for (const r of makeModelResults) {
      if (r.model && !seenModels.has(r.model)) {
        seenModels.add(r.model);
        suggestions.push({
          type: 'make_model',
          text: r.model, // Just show model name
          make: r.make,
          model: r.model,
          count: Number(r.count),
        });
      }
    }
  } else {
    // Showing makes and make+model combinations
    // Build make totals map from the dedicated query (accurate totals)
    const makeTotals = new Map<string, number>();
    for (const r of makeTotalsResults) {
      if (r.make) {
        makeTotals.set(r.make, Number(r.count));
      }
    }
    
    const seenMakes = new Set<string>();
    const seenMakeModels = new Set<string>();

    for (const r of makeModelResults) {
      if (!r.make) continue;

      // Add make suggestion if not seen (use accurate total from makeTotalsQuery)
      if (!seenMakes.has(r.make) && r.make.toLowerCase().includes(searchTerm)) {
        seenMakes.add(r.make);
        suggestions.push({
          type: 'make',
          text: r.make,
          make: r.make,
          count: makeTotals.get(r.make) || Number(r.count), // Use total, fallback to row count
        });
      }

      // Add make+model suggestion (individual count is correct here)
      if (r.model) {
        const makeModelKey = `${r.make}-${r.model}`;
        const makeModelText = `${r.make} ${r.model}`.toLowerCase();
        
        if (!seenMakeModels.has(makeModelKey) && makeModelText.includes(searchTerm)) {
          seenMakeModels.add(makeModelKey);
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
  }

  // Sort by count and limit
  return suggestions
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get popular makes for auto-suggest dropdown
 * Returns top makes by listing count for the default suggestions
 */
export async function getPopularMakes(limit = 4): Promise<Array<{
  type: 'make';
  text: string;
  make: string;
  count: number;
}>> {
  const now = new Date();
  const conditions = buildPublicBaseConditions(now);

  const results = await db
    .select({
      make: carListing.make,
      count: count(),
    })
    .from(carListing)
    .where(and(...conditions))
    .groupBy(carListing.make)
    .orderBy(desc(count()))
    .limit(limit);

  return results.map(r => ({
    type: 'make' as const,
    text: r.make,
    make: r.make,
    count: Number(r.count),
  }));
}
