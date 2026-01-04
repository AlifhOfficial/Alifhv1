/**
 * Consignment Funnel Queries
 * 
 * CRUD operations for partner consignment funnels (saved searches).
 * Funnels let partners define criteria for finding consignment-ready listings.
 * 
 * @module queries/consignment/funnel-queries
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, and, asc, desc, isNull, inArray, lte, gte, sql } from 'drizzle-orm';
import { db } from '../../dbclient';
import { consignmentFunnel, type ConsignmentFunnelFilters } from '../../schema/consignment';
import { carListing } from '../../schema/listing';
import { userProfile } from '../../schema/profile';

const FUNNEL_ID_PREFIX = 'funl_';
const makeFunnelId = () => `${FUNNEL_ID_PREFIX}${createId()}`;

// ============================================================================
// Types
// ============================================================================

export type ConsignmentFunnelRecord = typeof consignmentFunnel.$inferSelect;

export type CreateFunnelInput = {
  partnerId: string;
  staffId: string;
  name: string;
  description?: string;
  filters: ConsignmentFunnelFilters;
  position?: number;
  isActive?: boolean;
};

export type UpdateFunnelInput = Partial<{
  name: string;
  description: string | null;
  filters: ConsignmentFunnelFilters;
  position: number;
  isActive: boolean;
}>;

// ============================================================================
// Funnel CRUD
// ============================================================================

/**
 * Get all funnels for a staff member
 */
export async function getPartnerFunnels(partnerId: string, staffId: string): Promise<ConsignmentFunnelRecord[]> {
  return db.query.consignmentFunnel.findMany({
    where: and(
      eq(consignmentFunnel.partnerId, partnerId),
      eq(consignmentFunnel.staffId, staffId)
    ),
    orderBy: [asc(consignmentFunnel.position), desc(consignmentFunnel.createdAt)],
  });
}

/**
 * Get all funnels for a partner (all staff) with staff info
 * Used by partner managers/owners to see all funnels across the organization
 */
export async function getAllPartnerFunnels(partnerId: string): Promise<(ConsignmentFunnelRecord & { staffName: string | null })[]> {
  const results = await db
    .select({
      id: consignmentFunnel.id,
      partnerId: consignmentFunnel.partnerId,
      staffId: consignmentFunnel.staffId,
      name: consignmentFunnel.name,
      description: consignmentFunnel.description,
      filters: consignmentFunnel.filters,
      position: consignmentFunnel.position,
      isActive: consignmentFunnel.isActive,
      createdAt: consignmentFunnel.createdAt,
      updatedAt: consignmentFunnel.updatedAt,
      staffFirstName: userProfile.firstName,
      staffLastName: userProfile.lastName,
    })
    .from(consignmentFunnel)
    .leftJoin(userProfile, eq(consignmentFunnel.staffId, userProfile.userId))
    .where(eq(consignmentFunnel.partnerId, partnerId))
    .orderBy(desc(consignmentFunnel.createdAt));
  
  return results.map(r => ({
    id: r.id,
    partnerId: r.partnerId,
    staffId: r.staffId,
    name: r.name,
    description: r.description,
    filters: r.filters,
    position: r.position,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    staffName: r.staffFirstName && r.staffLastName 
      ? `${r.staffFirstName} ${r.staffLastName}`
      : r.staffFirstName || r.staffLastName || null,
  }));
}

/**
 * Get a single funnel by ID
 */
export async function getFunnelById(funnelId: string): Promise<ConsignmentFunnelRecord | null> {
  const result = await db.query.consignmentFunnel.findFirst({
    where: eq(consignmentFunnel.id, funnelId),
  });
  return result ?? null;
}

/**
 * Create a new funnel
 */
export async function createFunnel(input: CreateFunnelInput): Promise<ConsignmentFunnelRecord> {
  const id = makeFunnelId();
  
  const [result] = await db
    .insert(consignmentFunnel)
    .values({
      id,
      partnerId: input.partnerId,
      staffId: input.staffId,
      name: input.name,
      description: input.description ?? null,
      filters: input.filters,
      position: input.position ?? 0,
      isActive: input.isActive ?? true,
    })
    .returning();
  
  return result;
}

/**
 * Update a funnel (only owner can update)
 */
export async function updateFunnel(
  funnelId: string,
  partnerId: string,
  staffId: string,
  updates: UpdateFunnelInput
): Promise<ConsignmentFunnelRecord | null> {
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );
  
  if (Object.keys(cleanUpdates).length === 0) {
    return getFunnelById(funnelId);
  }
  
  const [result] = await db
    .update(consignmentFunnel)
    .set({
      ...cleanUpdates,
      updatedAt: new Date(),
    })
    .where(and(
      eq(consignmentFunnel.id, funnelId),
      eq(consignmentFunnel.partnerId, partnerId),
      eq(consignmentFunnel.staffId, staffId)
    ))
    .returning();
  
  return result ?? null;
}

/**
 * Delete a funnel
 * - Staff can only delete their own funnels
 * - Managers/owners can delete any funnel in their organization
 */
export async function deleteFunnel(
  funnelId: string,
  partnerId: string,
  staffId: string,
  isManager: boolean = false
): Promise<boolean> {
  // Build where conditions
  const conditions = [
    eq(consignmentFunnel.id, funnelId),
    eq(consignmentFunnel.partnerId, partnerId),
  ];
  
  // Only check staffId if not a manager/owner
  if (!isManager) {
    conditions.push(eq(consignmentFunnel.staffId, staffId));
  }

  const result = await db
    .delete(consignmentFunnel)
    .where(and(...conditions))
    .returning({ id: consignmentFunnel.id });
  
  return result.length > 0;
}

// ============================================================================
// Funnel Matching - Get listings matching funnel filters
// ============================================================================

export type FunnelListingResult = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  thumbnail: string | null;
};

/**
 * Get listings matching a funnel's filters
 * 
 * Criteria:
 * - User has consignmentMode = true in their profile (opted in for all their listings)
 * - partnerId IS NULL (user listings only, no dealer listings)
 * - moderationStatus = 'approved'
 * - lifecycleStatus = 'active'
 * - Apply funnel filters
 */
export async function getFunnelMatchingListings(
  funnelId: string,
  partnerId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ listings: FunnelListingResult[]; total: number }> {
  const { limit = 20, offset = 0 } = options;
  
  // Get funnel
  const funnel = await db.query.consignmentFunnel.findFirst({
    where: and(
      eq(consignmentFunnel.id, funnelId),
      eq(consignmentFunnel.partnerId, partnerId)
    ),
  });
  
  if (!funnel) {
    return { listings: [], total: 0 };
  }
  
  const filters = funnel.filters;
  
  // Build dynamic filter conditions
  // Note: For enum columns, we need to cast the filter values to the enum types
  const filterConditions: ReturnType<typeof eq>[] = [];
  
  if (filters.makes?.length) {
    filterConditions.push(inArray(carListing.make, filters.makes));
  }
  if (filters.bodyTypes?.length) {
    // Cast to enum type - values are validated at input
    filterConditions.push(inArray(carListing.bodyType, filters.bodyTypes as typeof carListing.bodyType.enumValues));
  }
  if (filters.fuelTypes?.length) {
    filterConditions.push(inArray(carListing.fuelType, filters.fuelTypes as typeof carListing.fuelType.enumValues));
  }
  if (filters.emirates?.length) {
    filterConditions.push(inArray(carListing.emirate, filters.emirates));
  }
  if (filters.specs?.length) {
    filterConditions.push(inArray(carListing.specs, filters.specs as typeof carListing.specs.enumValues));
  }
  if (filters.minYear) {
    filterConditions.push(gte(carListing.year, filters.minYear));
  }
  if (filters.maxYear) {
    filterConditions.push(lte(carListing.year, filters.maxYear));
  }
  if (filters.minPrice) {
    filterConditions.push(gte(carListing.price, filters.minPrice));
  }
  if (filters.maxPrice) {
    filterConditions.push(lte(carListing.price, filters.maxPrice));
  }
  if (filters.maxMileage) {
    filterConditions.push(lte(carListing.mileage, filters.maxMileage));
  }
  
  // Join with userProfile to check consignmentMode
  const baseQuery = db
    .select({
      id: carListing.id,
      make: carListing.make,
      model: carListing.model,
      year: carListing.year,
      price: carListing.price,
      thumbnail: carListing.thumbnail,
    })
    .from(carListing)
    .innerJoin(userProfile, eq(carListing.userId, userProfile.userId))
    .where(and(
      eq(userProfile.consignmentMode, true), // User opted in
      isNull(carListing.partnerId), // User listings only
      eq(carListing.moderationStatus, 'approved'),
      eq(carListing.lifecycleStatus, 'active'),
      ...filterConditions
    ))
    .orderBy(desc(carListing.createdAt));
  
  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(carListing)
    .innerJoin(userProfile, eq(carListing.userId, userProfile.userId))
    .where(and(
      eq(userProfile.consignmentMode, true),
      isNull(carListing.partnerId),
      eq(carListing.moderationStatus, 'approved'),
      eq(carListing.lifecycleStatus, 'active'),
      ...filterConditions
    ));
  
  // Execute queries
  // For small limits (previews), skip count query for performance
  const skipCount = limit <= 10 && offset === 0;
  
  if (skipCount) {
    // Just get listings, estimate total as limit if we got full results
    const listings = await baseQuery.limit(limit).offset(offset);
    return { 
      listings: listings as FunnelListingResult[], 
      total: listings.length >= limit ? limit + 1 : listings.length // Indicate there may be more
    };
  }
  
  const [listings, countResult] = await Promise.all([
    baseQuery.limit(limit).offset(offset),
    countQuery,
  ]);
  
  const total = Number(countResult[0]?.count ?? 0);
  
  return { listings: listings as FunnelListingResult[], total };
}

/**
 * Get count of matching listings for all funnels of a staff member
 * Useful for showing counts in the funnel list UI
 */
export async function getPartnerFunnelCounts(partnerId: string, staffId: string): Promise<Record<string, number>> {
  const funnels = await getPartnerFunnels(partnerId, staffId);
  const counts: Record<string, number> = {};
  
  // Get counts in parallel for better performance
  await Promise.all(
    funnels.map(async (funnel) => {
      if (funnel.isActive) {
        const { total } = await getFunnelMatchingListings(funnel.id, partnerId, { limit: 1, offset: 0 });
        counts[funnel.id] = total;
      } else {
        counts[funnel.id] = 0;
      }
    })
  );
  
  return counts;
}
