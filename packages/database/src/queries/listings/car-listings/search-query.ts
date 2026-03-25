/**
 * Listing Search Query - Faceted Search with Full Filters
 * 
 * Features:
 * - 3-tier filters: basic (text), medium (common), advanced (all)
 * - Faceted counts for filter UI
 * - Constants-resolved text search with pg_trgm GIN fallback
 * - Optimized 2-step pattern (IDs first, then details)
 * 
 * @module queries/listings/car-listings/search-query
 */

import { eq, and, desc, inArray, SQL, sql, or, gte, lte, ilike, isNotNull, isNull, gt, asc, count } from 'drizzle-orm';
import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { partner } from '../../../schema/partner';
import { isBlkListingSql } from './sql-fragments';
import { user } from '../../../schema/auth';
import { userProfile } from '../../../schema/profile';
import { buildCardSelectFields, type CarCardData } from './car-card-query';
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
  LISTING_TAGS,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  UAE_EMIRATES,
  VEHICLE_EXTRAS,
} from '../../../schema/listing-constants';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

// ============================================================================
// TEXT SEARCH: In-memory keyword resolution against known constants
// Converts free-text keywords to exact filter conditions (B-tree indexed)
// instead of expensive ILIKE scans across multiple columns.
// ============================================================================

// Build lowercase lookup maps at module load (once, ~0ms)
const MAKE_LOOKUP = new Map<string, string>(); // lowercase → exact value
for (const make of CAR_MAKES) {
  MAKE_LOOKUP.set(make.toLowerCase(), make);
}

const MODEL_LOOKUP = new Map<string, { model: string; make: string }[]>(); // lowercase → [{model, make}]
for (const [make, models] of Object.entries(CAR_MODELS)) {
  for (const model of models) {
    const key = model.toLowerCase();
    if (!MODEL_LOOKUP.has(key)) MODEL_LOOKUP.set(key, []);
    MODEL_LOOKUP.get(key)!.push({ model, make });
  }
}

const BODY_TYPE_LOOKUP = new Map<string, string>(); // lowercase label/value → value
for (const bt of BODY_TYPES) {
  BODY_TYPE_LOOKUP.set(bt.value.toLowerCase(), bt.value);
  BODY_TYPE_LOOKUP.set(bt.label.toLowerCase(), bt.value);
}

const FUEL_TYPE_LOOKUP = new Map<string, string>();
for (const ft of FUEL_TYPES) {
  FUEL_TYPE_LOOKUP.set(ft.value.toLowerCase(), ft.value);
  FUEL_TYPE_LOOKUP.set(ft.label.toLowerCase(), ft.value);
}

const TRANSMISSION_LOOKUP = new Map<string, string>();
for (const t of TRANSMISSION_TYPES) {
  TRANSMISSION_LOOKUP.set(t.value.toLowerCase(), t.value);
  TRANSMISSION_LOOKUP.set(t.label.toLowerCase(), t.value);
}

const SPECS_LOOKUP = new Map<string, string>();
for (const s of SPECS_TYPES) {
  SPECS_LOOKUP.set(s.value.toLowerCase(), s.value);
  SPECS_LOOKUP.set(s.label.toLowerCase(), s.value);
}

const EMIRATE_LOOKUP = new Map<string, string>();
for (const e of UAE_EMIRATES) {
  EMIRATE_LOOKUP.set(e.value.toLowerCase(), e.value);
  EMIRATE_LOOKUP.set(e.label.toLowerCase(), e.value);
}

const TAG_LOOKUP = new Map<string, string>();
for (const tag of LISTING_TAGS) {
  TAG_LOOKUP.set(tag.value.toLowerCase(), tag.value);
  TAG_LOOKUP.set(tag.label.toLowerCase(), tag.value);
  // Also match partial labels: "accident" → "accidentFree"
  for (const word of tag.label.toLowerCase().split(/\s+/)) {
    if (word.length >= 4 && !TAG_LOOKUP.has(word)) {
      TAG_LOOKUP.set(word, tag.value);
    }
  }
}

const EXTRA_LOOKUP = new Map<string, string>();
for (const extra of VEHICLE_EXTRAS) {
  EXTRA_LOOKUP.set(extra.value.toLowerCase(), extra.value);
  EXTRA_LOOKUP.set(extra.label.toLowerCase(), extra.value);
}

const CONDITION_LOOKUP = new Map<string, string>();
CONDITION_LOOKUP.set('new', 'new');
CONDITION_LOOKUP.set('brand new', 'new');
CONDITION_LOOKUP.set('used', 'used');

type KeywordResolution = {
  make?: string;
  models?: { model: string; make: string }[];
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  specs?: string;
  emirate?: string;
  condition?: string;
  tag?: string;
  extra?: string;
  unresolved: boolean; // true if keyword didn't match any constant
};

/**
 * Resolve a keyword against all known constants.
 * Returns the matched category or marks as unresolved for ILIKE fallback.
 */
function resolveKeyword(keyword: string): KeywordResolution {
  const kw = keyword.toLowerCase();
  
  // 1. Exact make match (e.g., "toyota", "bmw", "mercedes-benz")
  const make = MAKE_LOOKUP.get(kw);
  if (make) return { make, unresolved: false };
  
  // 2. Exact model match (e.g., "camry", "rs5", "x5")
  const models = MODEL_LOOKUP.get(kw);
  if (models && models.length > 0) return { models, unresolved: false };
  
  // 3. Body type (e.g., "sedan", "suv", "coupe", "pickup truck")
  const bodyType = BODY_TYPE_LOOKUP.get(kw);
  if (bodyType) return { bodyType, unresolved: false };
  
  // 4. Fuel type (e.g., "petrol", "diesel", "electric", "hybrid")
  const fuelType = FUEL_TYPE_LOOKUP.get(kw);
  if (fuelType) return { fuelType, unresolved: false };
  
  // 5. Transmission (e.g., "automatic", "manual", "cvt")
  const transmission = TRANSMISSION_LOOKUP.get(kw);
  if (transmission) return { transmission, unresolved: false };
  
  // 6. Specs (e.g., "gcc", "american", "european")
  const specs = SPECS_LOOKUP.get(kw);
  if (specs) return { specs, unresolved: false };
  
  // 7. Emirate (e.g., "dubai", "sharjah", "abu dhabi")
  const emirate = EMIRATE_LOOKUP.get(kw);
  if (emirate) return { emirate, unresolved: false };
  
  // 8. Condition (e.g., "new", "used")
  const condition = CONDITION_LOOKUP.get(kw);
  if (condition) return { condition, unresolved: false };
  
  // 9. Tags (e.g., "accident", "warranty", "service")
  const tag = TAG_LOOKUP.get(kw);
  if (tag) return { tag, unresolved: false };
  
  // 10. Extras (e.g., "sunroof", "leather", "bluetooth")
  const extra = EXTRA_LOOKUP.get(kw);
  if (extra) return { extra, unresolved: false };
  
  // No match — will fall back to ILIKE (now GIN-indexed on make/model/trim)
  return { unresolved: true };
}

/**
 * Build WHERE conditions for public listings base
 */
function buildPublicBaseConditions(now: Date): SQL[] {
  return [
    eq(carListing.moderationStatus, 'approved'),
    eq(carListing.lifecycleStatus, 'active'),
    eq(carListing.needsRemoderation, false),
    isNotNull(carListing.expiresAt),
    gt(carListing.expiresAt, now),
  ];
}

/**
 * Build search conditions from params
 */
function buildSearchConditions(params: SearchParams, now: Date): SQL[] {
  const conditions: SQL[] = [...buildPublicBaseConditions(now)];

  // === BASIC TIER ===
  
  // Text search (q) — Constants-resolved + GIN-indexed fallback
  // Strategy:
  //   1. Resolve each keyword against known constants in-memory (O(1) lookup)
  //   2. Resolved keywords → exact eq()/inArray() conditions (B-tree indexed, instant)
  //   3. Unresolved keywords → ILIKE on make/model/trim (GIN pg_trgm indexed)
  //   4. All keywords must match (AND logic)
  if (params.q?.trim()) {
    // Common stop words to filter out
    const STOP_WORDS = new Set([
      'i', 'me', 'my', 'we', 'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'can', 'may', 'might', 'shall', 'to', 'of',
      'in', 'for', 'on', 'with', 'at', 'by', 'from', 'it', 'its', 'this', 'that',
      'and', 'or', 'but', 'not', 'no', 'so', 'if', 'then', 'than', 'too', 'very',
      'just', 'about', 'also', 'some', 'any', 'all', 'each', 'every', 'both',
      'want', 'need', 'like', 'looking', 'find', 'show', 'get', 'give', 'search',
      'car', 'cars', 'vehicle', 'vehicles', 'please', 'hey', 'hi', 'hello',
      'think', 'know', 'what', 'which', 'who', 'how', 'where', 'when', 'why',
      'im', 'ive', 'dont', 'cant', 'wont', 'youre', 'thats', 'theres',
    ]);
    
    const keywords = params.q.trim().toLowerCase().split(/\s+/)
      .filter(k => k.length >= 2 && !STOP_WORDS.has(k));
    
    if (keywords.length > 0) {
      const keywordConditions: SQL[] = [];

      const identityText = sql<string>`(${carListing.make} || ' ' || ${carListing.model} || ' ' || COALESCE(${carListing.trim}, ''))`;

      // If a query is only short/unresolved tokens (e.g. "bm"), don't force an expensive DB scan.
      // Resolved tokens (makes/models/etc) still apply even if they are short (e.g. "x5").
      
      for (const keyword of keywords) {
        const resolved = resolveKeyword(keyword);
        
        if (resolved.make) {
          // Exact make match → B-tree indexed eq()
          keywordConditions.push(eq(carListing.make, resolved.make));
        } else if (resolved.models) {
          // Exact model match → B-tree indexed inArray()
          keywordConditions.push(inArray(carListing.model, resolved.models.map(m => m.model)));
        } else if (resolved.bodyType) {
          keywordConditions.push(eq(carListing.bodyType, resolved.bodyType));
        } else if (resolved.fuelType) {
          keywordConditions.push(eq(carListing.fuelType, resolved.fuelType));
        } else if (resolved.transmission) {
          keywordConditions.push(eq(carListing.transmission, resolved.transmission));
        } else if (resolved.specs) {
          keywordConditions.push(eq(carListing.specs, resolved.specs));
        } else if (resolved.emirate) {
          keywordConditions.push(eq(carListing.emirate, resolved.emirate));
        } else if (resolved.condition) {
          keywordConditions.push(eq(carListing.condition, resolved.condition));
        } else if (resolved.tag) {
          // JSONB contains check for tag
          keywordConditions.push(sql`${carListing.tags} @> ${JSON.stringify([resolved.tag])}::jsonb`);
        } else if (resolved.extra) {
          // JSONB contains check for extra
          keywordConditions.push(sql`${carListing.extras} @> ${JSON.stringify([resolved.extra])}::jsonb`);
        } else {
          // Unresolved keyword → ILIKE fallback on combined identity text.
          // Important: pg_trgm indexes generally don't help for 1–2 char terms, so skip those to avoid scans.
          if (keyword.length >= 3) {
            const searchTerm = `%${keyword}%`;
            keywordConditions.push(ilike(identityText, searchTerm));
          }
        }
      }
      
      // ALL keywords must match (AND logic) — narrows results with each word
      if (keywordConditions.length > 0) {
        conditions.push(and(...keywordConditions)!);
      }
    }
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

  // Export status
  if (params.exportStatus?.length) {
    conditions.push(inArray(carListing.exportStatus, params.exportStatus));
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

  // Extras/Features (JSONB contains check)
  if (params.extras?.length) {
    // Check if listing extras contains ALL of the requested extras
    conditions.push(
      sql`${carListing.extras} ?& array[${sql.join(params.extras.map(e => sql`${e}`), sql`, `)}]`
    );
  }

  return conditions;
}

type CursorSortField = 'sortDate' | 'numeric';

type SearchCursorPayload = {
  v: 1;
  primary: string | number;
  createdAt: string;
  id: string;
};

type SortPlan = {
  sortBy: NonNullable<SearchParams['sortBy']>;
  field: CursorSortField;
  primaryExpr: SQL;
  createdAtExpr: typeof carListing.createdAt;
  orderBy: SQL[];
};

function buildPageJoinOrderBy(sortBy: NonNullable<SearchParams['sortBy']>, pageRows: {
  primary: unknown;
  createdAt: unknown;
  id: unknown;
}): SQL[] {
  switch (sortBy) {
    case 'oldest':
      return [sql`${pageRows.primary} ASC`, sql`${pageRows.createdAt} ASC`, sql`${pageRows.id} ASC`];
    case 'price_low':
    case 'mileage_low':
    case 'year_old':
      return [sql`${pageRows.primary} ASC`, sql`${pageRows.createdAt} DESC`, sql`${pageRows.id} DESC`];
    case 'newest':
    case 'price_high':
    case 'mileage_high':
    case 'year_new':
    case 'popular':
    case 'relevance':
    default:
      return [sql`${pageRows.primary} DESC`, sql`${pageRows.createdAt} DESC`, sql`${pageRows.id} DESC`];
  }
}

function encodeSearchCursor(payload: SearchCursorPayload): string {
  const primaryValue = typeof payload.primary === 'number'
    ? String(payload.primary)
    : String(new Date(payload.primary).getTime());
  const createdAtValue = String(new Date(payload.createdAt).getTime());

  return Buffer.from(`1~${primaryValue}~${createdAtValue}~${payload.id}`).toString('base64url');
}

function decodeSearchCursor(cursor: string | undefined, field: CursorSortField): SearchCursorPayload | null {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [version, primaryRaw, createdAtRaw, id] = decoded.split('~');

    if (version !== '1' || !primaryRaw || !createdAtRaw || !id) {
      return null;
    }

    const primaryNumber = Number(primaryRaw);
    const createdAtMs = Number(createdAtRaw);
    if (!Number.isFinite(primaryNumber) || !Number.isFinite(createdAtMs)) {
      return null;
    }

    return {
      v: 1,
      primary: field === 'sortDate'
        ? new Date(primaryNumber).toISOString()
        : primaryNumber,
      createdAt: new Date(createdAtMs).toISOString(),
      id,
    };
  } catch {
    return null;
  }
}

function buildSortPlan(params: SearchParams): SortPlan {
  const sortBy = params.sortBy || 'relevance';
  const sortDateExpr = sql`COALESCE(${carListing.originalPublishedAt}, ${carListing.publishedAt})`;

  switch (sortBy) {
    case 'newest':
      return {
        sortBy,
        field: 'sortDate',
        primaryExpr: sortDateExpr,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${sortDateExpr} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'oldest':
      return {
        sortBy,
        field: 'sortDate',
        primaryExpr: sortDateExpr,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${sortDateExpr} ASC`, sql`${carListing.createdAt} ASC`, sql`${carListing.id} ASC`],
      };
    case 'price_low':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.price}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.price} ASC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'price_high':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.price}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.price} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'mileage_low':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.mileage}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.mileage} ASC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'mileage_high':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.mileage}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.mileage} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'year_new':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.year}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.year} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'year_old':
      return {
        sortBy,
        field: 'numeric',
        primaryExpr: sql`${carListing.year}`,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${carListing.year} ASC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    case 'popular': {
      const primaryExpr = sql`(${carListing.viewCount} + ${carListing.favouriteCount} * 2)`;
      return {
        sortBy,
        field: 'numeric',
        primaryExpr,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${primaryExpr} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    }
    case 'relevance':
    default: {
      const primaryExpr = sql`(
        COALESCE(${carListing.qiScore}, 35) +
        GREATEST(1 - EXTRACT(EPOCH FROM (now() - ${sortDateExpr})) / 2073600, 0.1) * 20 +
        LEAST(${carListing.favouriteCount} + ${carListing.superlikeCount} * 3, 100) * 0.1
      )`;
      return {
        sortBy: 'relevance',
        field: 'numeric',
        primaryExpr,
        createdAtExpr: carListing.createdAt,
        orderBy: [sql`${primaryExpr} DESC`, sql`${carListing.createdAt} DESC`, sql`${carListing.id} DESC`],
      };
    }
  }
}

function buildCursorWhereClause(plan: SortPlan, decodedCursor: SearchCursorPayload | null): SQL | undefined {
  if (!decodedCursor) {
    return undefined;
  }

  const createdAt = new Date(decodedCursor.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return undefined;
  }

  const createdAtSql = sql`${createdAt}`;
  const idSql = sql`${decodedCursor.id}`;

  if (plan.field === 'sortDate') {
    const primaryValue = new Date(String(decodedCursor.primary));
    if (Number.isNaN(primaryValue.getTime())) {
      return undefined;
    }

    const primarySql = sql`${primaryValue}`;
    const primaryDesc = plan.sortBy === 'newest';

    return primaryDesc
      ? sql`(
          ${plan.primaryExpr} < ${primarySql}
          OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} < ${createdAtSql})
          OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} = ${createdAtSql} AND ${carListing.id} < ${idSql})
        )`
      : sql`(
          ${plan.primaryExpr} > ${primarySql}
          OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} > ${createdAtSql})
          OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} = ${createdAtSql} AND ${carListing.id} > ${idSql})
        )`;
  }

  const primaryValue = Number(decodedCursor.primary);
  if (!Number.isFinite(primaryValue)) {
    return undefined;
  }

  const primarySql = sql`${primaryValue}`;
  const primaryDesc = !['price_low', 'mileage_low', 'year_old'].includes(plan.sortBy);

  if (primaryDesc) {
    return sql`(
      ${plan.primaryExpr} < ${primarySql}
      OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} < ${createdAtSql})
      OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} = ${createdAtSql} AND ${carListing.id} < ${idSql})
    )`;
  }

  return sql`(
    ${plan.primaryExpr} > ${primarySql}
    OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} < ${createdAtSql})
    OR (${plan.primaryExpr} = ${primarySql} AND ${plan.createdAtExpr} = ${createdAtSql} AND ${carListing.id} < ${idSql})
  )`;
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
      min: result?.minYear || 1900, 
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
 * Get make facets with counts (live listings only)
 */
async function getMakeFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  void params;
  const baseConditions = buildPublicBaseConditions(now);

  const results = await db
    .select({
      value: carListing.make,
      count: count(),
    })
    .from(carListing)
    .where(and(isNotNull(carListing.make), ...baseConditions))
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
 * Get model facets (filtered by selected makes, live listings only)
 */
async function getModelFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  const conditions: SQL[] = [...buildPublicBaseConditions(now)];

  if (params.make?.length) {
    conditions.push(inArray(carListing.make, params.make));
  }

  const results = await db
    .select({
      value: carListing.model,
      count: count(),
    })
    .from(carListing)
    .where(and(isNotNull(carListing.model), ...conditions))
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
 * Get trim facets (filtered by selected makes and models, live listings only)
 */
async function getTrimFacets(params: SearchParams, now: Date): Promise<FacetBucket[]> {
  // Only show trims when both make and model are selected
  if (!params.make?.length || !params.model?.length) {
    return [];
  }

  const conditions: SQL[] = [
    ...buildPublicBaseConditions(now),
    inArray(carListing.make, params.make),
    inArray(carListing.model, params.model),
  ];

  const results = await db
    .select({
      value: carListing.trim,
      count: count(),
    })
    .from(carListing)
    .where(and(isNotNull(carListing.trim), ...conditions))
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
const exportStatusLabelMap = { local_only: 'Local Only', gcc: 'GCC', international: 'International', restricted: 'Restricted' };

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
  exportStatus: FacetBucket[];
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
    exportStatus,
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
    getFacetForField('exportStatus', 'export_status', exportStatusLabelMap),
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
    exportStatus,
  };
}

/**
 * Get make, model, and trim facets in a single UNION ALL query — 1 HTTP POST to Neon.
 *
 * Previously fired as 3 parallel db.select() calls (3 round trips).
 * Now: one raw SQL UNION ALL, Postgres scans the table up to 3 times in a single
 * execution plan but the entire result comes back in a single network call.
 *
 * WHERE clause differences:
 *  - make:  base conditions only (ignore make filter so all makes are always visible)
 *  - model: base + make filter (if any)
 *  - trim:  base + make + model filter (only included when both are selected)
 */
async function getAllMakeModelTrimFacets(params: SearchParams, now: Date): Promise<{
  make: FacetBucket[];
  model: FacetBucket[];
  trim: FacetBucket[];
}> {
  const baseConditions = buildPublicBaseConditions(now);
  const baseWhere = and(...baseConditions)!;

  const modelConditions = [...baseConditions];
  if (params.make?.length) {
    modelConditions.push(inArray(carListing.make, params.make));
  }
  const modelWhere = and(...modelConditions)!;

  const hasTrim = (params.make?.length ?? 0) > 0 && (params.model?.length ?? 0) > 0;
  const trimUnion = hasTrim
    ? sql`
        UNION ALL
        SELECT 'trim'::text  AS facet_type, trim::text  AS value, count(*)::int AS count
        FROM car_listing
        WHERE ${and(...baseConditions, inArray(carListing.make, params.make!), inArray(carListing.model, params.model!))!}
          AND trim IS NOT NULL
        GROUP BY trim`
    : sql``;

  const results = await db.execute(sql`
    SELECT 'make'::text  AS facet_type, make::text  AS value, count(*)::int AS count
    FROM car_listing
    WHERE ${baseWhere} AND make IS NOT NULL
    GROUP BY make
    UNION ALL
    SELECT 'model'::text AS facet_type, model::text AS value, count(*)::int AS count
    FROM car_listing
    WHERE ${modelWhere} AND model IS NOT NULL
    GROUP BY model
    ${trimUnion}
  `);

  const rows = (results as any).rows ?? results;

  const make: FacetBucket[] = [];
  const model: FacetBucket[] = [];
  const trim: FacetBucket[] = [];

  for (const row of rows) {
    const bucket: FacetBucket = {
      value: String(row.value),
      label: String(row.value),
      count: Number(row.count),
    };
    if (row.facet_type === 'make') make.push(bucket);
    else if (row.facet_type === 'model') model.push(bucket);
    else if (row.facet_type === 'trim') trim.push(bucket);
  }

  make.sort((a, b) => b.count - a.count);
  model.sort((a, b) => b.count - a.count);
  trim.sort((a, b) => b.count - a.count);

  return { make, model, trim };
}

/**
 * Get all facets — make/model/trim combined into 1 UNION ALL (1 HTTP POST),
 * enum facets and ranges left as empty stubs (not shown in UI currently).
 */
async function getAllFacets(params: SearchParams, now: Date): Promise<SearchFacets> {
  const { make, model, trim } = await getAllMakeModelTrimFacets(params, now);

  return {
    make,
    model,
    trim,
    yearRange: { min: 1900, max: new Date().getFullYear() + 1 },
    priceRange: { min: 0, max: 10000000 },
    mileageRange: { min: 0, max: 500000 },
    emirate: [],
    specs: [],
    bodyType: [],
    fuelType: [],
    transmission: [],
    engineSize: [],
    exteriorColor: [],
    interiorColor: [],
    sellerType: [],
    exportStatus: [],
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
  /** Fast mode: implies skipFacets + skipTotalCount unless explicitly set */
  fast?: boolean;
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
  
  const skipFacets = options.skipFacets ?? options.fast ?? false;
  const skipTotalCount = options.skipTotalCount ?? options.fast ?? false;
  
  const limit = Math.min(Math.max(params.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const conditions = buildSearchConditions(params, now);
  const sortPlan = buildSortPlan(params);
  const decodedCursor = decodeSearchCursor(params.cursor, sortPlan.field);
  const cursorCondition = buildCursorWhereClause(sortPlan, decodedCursor);
  const allConditions = cursorCondition ? [...conditions, cursorCondition] : conditions;
  const currentPage = Math.max(((params as SearchParams & { page?: number }).page) || 1, 1);

  // Build parallel query array dynamically
  const queries: Promise<any>[] = [
    // Use a limited subquery so we keep the fast paging plan but only pay one DB round trip.
    (async () => {
      const pageStart = Date.now();
      const pageRows = db
        .select({
          id: carListing.id,
          primary: sortPlan.primaryExpr.as('primary'),
          createdAt: carListing.createdAt,
        })
        .from(carListing)
        .where(allConditions.length > 0 ? and(...allConditions) : undefined)
        .orderBy(...sortPlan.orderBy)
        .limit(limit + 1)
        .as('search_page_rows');

      const joinedRows = await db
        .select({
          ...buildCardSelectFields(now),
          primary: pageRows.primary,
          cursorCreatedAt: pageRows.createdAt,
        })
        .from(pageRows)
        .innerJoin(carListing, eq(carListing.id, pageRows.id))
        .leftJoin(user, eq(user.id, carListing.userId))
        .leftJoin(userProfile, eq(userProfile.userId, user.id))
        .leftJoin(partner, eq(partner.id, carListing.partnerId))
        .orderBy(...buildPageJoinOrderBy(sortPlan.sortBy, pageRows));
      const pageMs = Date.now() - pageStart;

      if (joinedRows.length === 0) {
        return { listings: [], hasMoreFromFetch: false, nextCursor: null, timing: { ids: pageMs, cards: 0 } };
      }

      const hasMoreFromFetch = joinedRows.length > limit;
      const pageData = joinedRows.slice(0, limit);
      const lastRow = pageData[pageData.length - 1];
      const nextCursor = hasMoreFromFetch && lastRow
        ? encodeSearchCursor({
            v: 1,
            primary: sortPlan.field === 'sortDate'
              ? new Date(String(lastRow.primary)).toISOString()
              : Number(lastRow.primary),
            createdAt: new Date(lastRow.cursorCreatedAt as Date).toISOString(),
            id: lastRow.id,
          })
        : null;
      
      const listings = pageData
        .map(({ primary: _primary, cursorCreatedAt: _cursorCreatedAt, ...listing }) => listing) as unknown as SearchResultItem[];

      return {
        listings,
        hasMoreFromFetch,
        nextCursor,
        timing: { ids: pageMs, cards: 0 },
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
      (async () => {
        const countStart = Date.now();
        const result = await db
          .select({ count: count() })
          .from(carListing)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        const countMs = Date.now() - countStart;
        return { result, countMs };
      })()
    );
  }

  // Execute all queries in parallel
  const results = await Promise.all(queries);
  
  // Extract results based on what was queried
  const searchResult = results[0] as {
    listings: SearchResultItem[];
    hasMoreFromFetch: boolean;
    nextCursor: string | null;
    timing: { ids: number; cards: number };
  };
  let facets: SearchFacets | undefined;
  let total: number | undefined;
  let countMs = 0;
  
  let resultIdx = 1;
  if (!skipFacets) {
    facets = results[resultIdx++] as SearchFacets;
  }
  if (!skipTotalCount) {
    const countResult = results[resultIdx] as { result: Array<{ count: number }>; countMs: number };
    total = Number(countResult.result[0]?.count || 0);
    countMs = countResult.countMs;
  }

  const took = Date.now() - startTime;

  // Log query breakdown for performance monitoring
  if (took > 500) {
    console.warn(`[search] searchListings: ${took}ms (ids=${searchResult.timing.ids}ms, cards=${searchResult.timing.cards}ms, count=${countMs}ms) sort=${params.sortBy || 'relevance'} total=${total}`);
  }

  // Use hasMore from extra row fetch if total count was skipped
  const hasMore = searchResult.hasMoreFromFetch;

  return {
    data: searchResult.listings,
    facets,
    meta: {
      total,
      limit,
      currentPage,
      nextCursor: searchResult.nextCursor,
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
 * MULTI-KEYWORD: "audi rs5" splits into ["audi", "rs5"] - both must match
 * CATEGORY SEARCH: Matches tags, extras, body types, fuel types, etc.
 * 
 * Suggestion Categories:
 * - vehicle: make, model, make_model, make_model_trim (blue)
 * - partner: dealers (yellow)
 * - tag: quality indicators (green)
 * - extra: features/extras (purple)
 * - filter: body type, fuel, transmission, specs, condition, seller (orange)
 */
export async function quickSearch(
  query: string, 
  limit = 4,
  context?: { make?: string; model?: string }
): Promise<Array<{
  type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner' | 'tag' | 'extra' | 'bodyType' | 'fuelType' | 'transmission' | 'specs' | 'condition' | 'sellerType';
  text: string;
  make?: string;
  model?: string;
  trim?: string;
  partnerId?: string;
  partnerName?: string;
  tag?: string;
  extra?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  specs?: string;
  condition?: 'new' | 'used';
  sellerType?: 'dealer' | 'private';
  count: number;
}>> {
  // Allow empty query if context is provided (for popular suggestions)
  const hasValidQuery = query?.trim() && query.length >= 2;
  if (!hasValidQuery && !context) {
    return [];
  }

  // Split query into keywords (min 2 chars each)
  const keywords = (query?.trim().toLowerCase() || '')
    .split(/\s+/)
    .filter(k => k.length >= 2);
  
  const searchTerm = query?.trim().toLowerCase() || '';
  const now = new Date();
  const conditions = buildPublicBaseConditions(now);
  const prefixSearchTerm = `${searchTerm}%`;

  const findMatchingMakes = (term: string): string[] => {
    if (!term) return [];
    return CAR_MAKES.filter(make => {
      const lower = make.toLowerCase();
      return lower.startsWith(term) || lower.split(/[\s-]+/).some(part => part.startsWith(term));
    });
  };

  const findMatchingModels = (term: string, makeFilter?: string): { make: string; model: string }[] => {
    if (!term) return [];

    const matches: { make: string; model: string }[] = [];
    for (const [make, models] of Object.entries(CAR_MODELS)) {
      if (makeFilter && make !== makeFilter) continue;

      for (const model of models) {
        const lower = model.toLowerCase();
        if (lower.startsWith(term) || lower.split(/[\s-]+/).some(part => part.startsWith(term))) {
          matches.push({ make, model });
        }
      }
    }

    return matches;
  };

  // Helper to build multi-keyword match condition
  // Each keyword must match at the start of make/model values to stay index-friendly.
  const buildKeywordConditions = (keywords: string[]) => {
    if (keywords.length === 0) return undefined;
    
    // Each keyword must match somewhere.
    return and(
      ...keywords.map(keyword => {
        const matchedMakes = findMatchingMakes(keyword);
        const matchedModels = findMatchingModels(keyword).map(match => match.model);

        const clauses: SQL[] = [
          ilike(carListing.make, `${keyword}%`),
          ilike(carListing.model, `${keyword}%`),
        ];

        if (matchedMakes.length > 0) {
          clauses.push(inArray(carListing.make, matchedMakes));
        }
        if (matchedModels.length > 0) {
          clauses.push(inArray(carListing.model, [...new Set(matchedModels)]));
        }

        return or(...clauses)!;
      })
    );
  };

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
      trimConditions.push(ilike(carListing.trim, prefixSearchTerm));
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
      const matchedModels = findMatchingModels(searchTerm, context.make).map(match => match.model);
      modelConditions.push(
        matchedModels.length > 0
          ? or(
              ilike(carListing.model, prefixSearchTerm),
              inArray(carListing.model, [...new Set(matchedModels)]),
            )!
          : ilike(carListing.model, prefixSearchTerm)
      );
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
    
    // Build keyword-based conditions for multi-word queries like "audi rs5"
    const keywordCondition = buildKeywordConditions(keywords);
    const matchedMakes = findMatchingMakes(searchTerm);
    const matchedModels = findMatchingModels(searchTerm).map(match => match.model);
    
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
          keywordCondition || or(
            ilike(carListing.make, prefixSearchTerm),
            ilike(carListing.model, prefixSearchTerm),
            ...(matchedMakes.length > 0 ? [inArray(carListing.make, matchedMakes)] : []),
            ...(matchedModels.length > 0 ? [inArray(carListing.model, [...new Set(matchedModels)])] : []),
          )
        )
      )
      .groupBy(carListing.make, carListing.model)
      .orderBy(desc(count()))
      .limit(limit * 2);
  }

  // Run all queries in parallel
  const [partnerResults, makeModelResults] = await Promise.all([
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
                ilike(carListing.partnerBrandName, prefixSearchTerm),
                ilike(partner.brandName, prefixSearchTerm)
              )
            )
          )
          .groupBy(carListing.partnerId, carListing.partnerBrandName, partner.brandName)
          .orderBy(desc(count()))
          .limit(2) // Only show top 2 partner matches
      : Promise.resolve([]),
    
    makeModelQuery,
  ]);

  const suggestions: Array<{
    type: 'make' | 'model' | 'make_model' | 'make_model_trim' | 'partner' | 'tag' | 'extra' | 'bodyType' | 'fuelType' | 'transmission' | 'specs' | 'condition' | 'sellerType';
    text: string;
    make?: string;
    model?: string;
    trim?: string;
    partnerId?: string;
    partnerName?: string;
    tag?: string;
    extra?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    specs?: string;
    condition?: 'new' | 'used';
    sellerType?: 'dealer' | 'private';
    count: number;
  }> = [];

  // ========================================
  // CATEGORY MATCHING + COUNT QUERIES
  // ========================================
  
  if (searchTerm && !context) {
    // First collect all matched categories in-memory
    const matchingTags = LISTING_TAGS.filter(tag => 
      tag.label.toLowerCase().includes(searchTerm) ||
      tag.value.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    const matchingExtras = VEHICLE_EXTRAS.filter(extra => 
      extra.label.toLowerCase().includes(searchTerm) ||
      extra.value.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    const matchingBodyTypes = BODY_TYPES.filter(bt => 
      bt.label.toLowerCase().includes(searchTerm) ||
      bt.value.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    const matchingFuelTypes = FUEL_TYPES.filter(ft => 
      ft.label.toLowerCase().includes(searchTerm) ||
      ft.value.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    const matchingTransmission = TRANSMISSION_TYPES.filter(t => 
      t.label.toLowerCase().includes(searchTerm) ||
      t.value.toLowerCase().includes(searchTerm)
    ).slice(0, 1);
    
    const matchingSpecs = SPECS_TYPES.filter(s => 
      s.label.toLowerCase().includes(searchTerm) ||
      s.value.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    const matchedConditions: Array<{ text: string; value: 'new' | 'used' }> = [];
    if ('new'.includes(searchTerm) || 'brand new'.includes(searchTerm)) {
      matchedConditions.push({ text: 'New Cars', value: 'new' });
    }
    if ('used'.includes(searchTerm) || 'pre-owned'.includes(searchTerm) || 'preowned'.includes(searchTerm)) {
      matchedConditions.push({ text: 'Used Cars', value: 'used' });
    }
    
    const matchedSellerTypes: Array<{ text: string; value: 'dealer' | 'private' }> = [];
    if ('dealer'.includes(searchTerm) || 'showroom'.includes(searchTerm)) {
      matchedSellerTypes.push({ text: 'Dealers Only', value: 'dealer' });
    }
    if ('private'.includes(searchTerm) || 'owner'.includes(searchTerm) || 'individual'.includes(searchTerm)) {
      matchedSellerTypes.push({ text: 'Private Sellers', value: 'private' });
    }

    // Push matched categories without counts (no DB query needed)
    for (const tag of matchingTags) {
      suggestions.push({ type: 'tag', text: tag.label, tag: tag.value, count: 0 });
    }
    for (const extra of matchingExtras) {
      suggestions.push({ type: 'extra', text: extra.label, extra: extra.value, count: 0 });
    }
    for (const bt of matchingBodyTypes) {
      suggestions.push({ type: 'bodyType', text: bt.label, bodyType: bt.value, count: 0 });
    }
    for (const ft of matchingFuelTypes) {
      suggestions.push({ type: 'fuelType', text: ft.label, fuelType: ft.value, count: 0 });
    }
    for (const t of matchingTransmission) {
      suggestions.push({ type: 'transmission', text: t.label, transmission: t.value, count: 0 });
    }
    for (const s of matchingSpecs) {
      suggestions.push({ type: 'specs', text: s.label, specs: s.value, count: 0 });
    }
    for (const c of matchedConditions) {
      suggestions.push({ type: 'condition', text: c.text, condition: c.value, count: 0 });
    }
    for (const st of matchedSellerTypes) {
      suggestions.push({ type: 'sellerType', text: st.text, sellerType: st.value, count: 0 });
    }
  }

  // Process partner results - always show (yellow category)
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
    // Derive make totals by summing make+model group counts
    const makeTotals = new Map<string, number>();
    for (const r of makeModelResults) {
      if (r.make) {
        makeTotals.set(r.make, (makeTotals.get(r.make) ?? 0) + Number(r.count));
      }
    }

    const seenMakes = new Set<string>();
    const seenMakeModels = new Set<string>();

    for (const r of makeModelResults) {
      if (!r.make) continue;

      // Add make suggestion if not seen
      if (!seenMakes.has(r.make) && r.make.toLowerCase().includes(searchTerm)) {
        seenMakes.add(r.make);
        suggestions.push({
          type: 'make',
          text: r.make,
          make: r.make,
          count: makeTotals.get(r.make) ?? Number(r.count),
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

// 1-hour in-memory cache for popular makes — stable data, no need to hit DB per request
let _popularMakesCache: { data: Array<{ type: 'make'; text: string; make: string; count: number }>; expiresAt: number } | null = null;
const POPULAR_MAKES_TTL_MS = 60 * 60 * 1000; // 1 hour

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
  const now = Date.now();
  if (_popularMakesCache && now < _popularMakesCache.expiresAt) {
    return _popularMakesCache.data.slice(0, limit);
  }

  const dbNow = new Date(now);
  const conditions = buildPublicBaseConditions(dbNow);

  const results = await db
    .select({
      make: carListing.make,
      count: count(),
    })
    .from(carListing)
    .where(and(...conditions))
    .groupBy(carListing.make)
    .orderBy(desc(count()))
    .limit(20); // Overfetch so any limit is served from cache

  const mapped = results.map(r => ({
    type: 'make' as const,
    text: r.make,
    make: r.make,
    count: Number(r.count),
  }));

  _popularMakesCache = { data: mapped, expiresAt: now + POPULAR_MAKES_TTL_MS };
  return mapped.slice(0, limit);
}
