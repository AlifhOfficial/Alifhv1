/**
 * Listings Queries
 *
 * CRUD operations for carListing, listingPriceHistory, and listingView tables.
 * Following the same pattern as partner queries for consistency.
 */

import { createId } from '@paralleldrive/cuid2';
import { eq, and, desc, asc, sql, gte, lte, inArray, or } from 'drizzle-orm';
import { db } from '../dbclient';
import { 
  carListing, 
  listingPriceHistory, 
  listingView 
} from '../schema/listing';

// ID Prefixes
const LISTING_ID_PREFIX = 'listing_';
const PRICE_HISTORY_ID_PREFIX = 'price_';
const VIEW_ID_PREFIX = 'view_';

const makeListingId = () => `${LISTING_ID_PREFIX}${createId()}`;
const makePriceHistoryId = () => `${PRICE_HISTORY_ID_PREFIX}${createId()}`;
const makeViewId = () => `${VIEW_ID_PREFIX}${createId()}`;

// Type Exports
export type ListingRecord = typeof carListing.$inferSelect;
export type ListingInsert = typeof carListing.$inferInsert;
export type ListingUpdate = Partial<Omit<ListingInsert, 'id' | 'createdAt'>>;

export type PriceHistoryRecord = typeof listingPriceHistory.$inferSelect;
export type PriceHistoryInsert = typeof listingPriceHistory.$inferInsert;

export type ListingViewRecord = typeof listingView.$inferSelect;
export type ListingViewInsert = typeof listingView.$inferInsert;

// Utility to prune undefined values
const pruneUndefined = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<T>;

// ==================== LISTING CRUD ====================

/**
 * Get listing by ID
 */
export const getListingById = async (
  id: string
): Promise<ListingRecord | null> => {
  const result = await db
    .select()
    .from(carListing)
    .where(eq(carListing.id, id))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Get listing by slug (URL-friendly identifier)
 */
export const getListingBySlug = async (
  slug: string
): Promise<ListingRecord | null> => {
  const result = await db
    .select()
    .from(carListing)
    .where(eq(carListing.slug, slug))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Get listing by VIN (Vehicle Identification Number)
 */
export const getListingByVIN = async (
  vin: string
): Promise<ListingRecord | null> => {
  const result = await db
    .select()
    .from(carListing)
    .where(eq(carListing.vin, vin))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Get listings by partner ID
 */
export const getListingsByPartnerId = async (
  partnerId: string,
  filters?: {
    status?: 'draft' | 'pending' | 'published' | 'reserved' | 'sold' | 'archived';
    limit?: number;
    offset?: number;
    sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'publishedAt';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ListingRecord[]> => {
  const conditions = [eq(carListing.partnerId, partnerId)];

  if (filters?.status) {
    conditions.push(eq(carListing.status, filters.status));
  }

  let query = db
    .select()
    .from(carListing)
    .where(and(...conditions)) as any;

  // Sorting
  const sortField = filters?.sortBy ?? 'createdAt';
  const sortOrder = filters?.sortOrder ?? 'desc';
  
  if (sortField === 'price') {
    query = query.orderBy(sortOrder === 'asc' ? asc(carListing.price) : desc(carListing.price)) as any;
  } else if (sortField === 'year') {
    query = query.orderBy(sortOrder === 'asc' ? asc(carListing.year) : desc(carListing.year)) as any;
  } else if (sortField === 'mileage') {
    query = query.orderBy(sortOrder === 'asc' ? asc(carListing.mileage) : desc(carListing.mileage)) as any;
  } else if (sortField === 'publishedAt') {
    query = query.orderBy(sortOrder === 'asc' ? asc(carListing.publishedAt) : desc(carListing.publishedAt)) as any;
  } else {
    query = query.orderBy(sortOrder === 'asc' ? asc(carListing.createdAt) : desc(carListing.createdAt)) as any;
  }

  // Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

/**
 * Get listings by user ID (for P2P listings)
 */
export const getListingsByUserId = async (
  userId: string,
  filters?: {
    status?: 'draft' | 'pending' | 'published' | 'reserved' | 'sold' | 'archived';
    limit?: number;
    offset?: number;
  }
): Promise<ListingRecord[]> => {
  const conditions = [eq(carListing.userId, userId)];

  if (filters?.status) {
    conditions.push(eq(carListing.status, filters.status));
  }

  let query = db
    .select()
    .from(carListing)
    .where(and(...conditions))
    .orderBy(desc(carListing.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

/**
 * Get all listings with comprehensive filters (public search)
 */
export const getAllListings = async (filters?: {
  status?: 'draft' | 'pending' | 'published' | 'reserved' | 'sold' | 'archived';
  emirate?: string;
  make?: string;
  model?: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  sellerType?: 'dealer' | 'private' | 'consignment';
  isFeatured?: boolean;
  isBlackMember?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'year' | 'mileage' | 'createdAt' | 'publishedAt' | 'qiScore';
  sortOrder?: 'asc' | 'desc';
}): Promise<ListingRecord[]> => {
  const conditions = [];

  // Status filter (default to published for public)
  if (filters?.status) {
    conditions.push(eq(carListing.status, filters.status));
  }

  // Location
  if (filters?.emirate) {
    conditions.push(eq(carListing.emirate, filters.emirate));
  }

  // Vehicle
  if (filters?.make) {
    conditions.push(eq(carListing.make, filters.make));
  }
  if (filters?.model) {
    conditions.push(eq(carListing.model, filters.model));
  }
  if (filters?.year) {
    conditions.push(eq(carListing.year, filters.year));
  }
  if (filters?.minYear) {
    conditions.push(gte(carListing.year, filters.minYear));
  }
  if (filters?.maxYear) {
    conditions.push(lte(carListing.year, filters.maxYear));
  }

  // Price range
  if (filters?.minPrice) {
    conditions.push(gte(carListing.price, filters.minPrice));
  }
  if (filters?.maxPrice) {
    conditions.push(lte(carListing.price, filters.maxPrice));
  }

  // Mileage range
  if (filters?.minMileage) {
    conditions.push(gte(carListing.mileage, filters.minMileage));
  }
  if (filters?.maxMileage) {
    conditions.push(lte(carListing.mileage, filters.maxMileage));
  }

  // Array filters
  if (filters?.bodyType && filters.bodyType.length > 0) {
    conditions.push(inArray(carListing.bodyType, filters.bodyType as any[]));
  }
  if (filters?.fuelType && filters.fuelType.length > 0) {
    conditions.push(inArray(carListing.fuelType, filters.fuelType as any[]));
  }
  if (filters?.transmission && filters.transmission.length > 0) {
    conditions.push(inArray(carListing.transmission, filters.transmission as any[]));
  }

  // Seller type
  if (filters?.sellerType) {
    conditions.push(eq(carListing.sellerType, filters.sellerType));
  }

  // Premium features
  if (filters?.isFeatured !== undefined) {
    conditions.push(eq(carListing.isFeatured, filters.isFeatured));
  }
  if (filters?.isBlackMember !== undefined) {
    conditions.push(eq(carListing.isBlackMember, filters.isBlackMember));
  }

  let query = db.select().from(carListing) as any;

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Sorting
  const sortField = filters?.sortBy ?? 'publishedAt';
  const sortOrder = filters?.sortOrder ?? 'desc';
  
  switch (sortField) {
    case 'price':
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.price) : desc(carListing.price)) as any;
      break;
    case 'year':
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.year) : desc(carListing.year)) as any;
      break;
    case 'mileage':
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.mileage) : desc(carListing.mileage)) as any;
      break;
    case 'qiScore':
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.qiScore) : desc(carListing.qiScore)) as any;
      break;
    case 'publishedAt':
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.publishedAt) : desc(carListing.publishedAt)) as any;
      break;
    default:
      query = query.orderBy(sortOrder === 'asc' ? asc(carListing.createdAt) : desc(carListing.createdAt)) as any;
  }

  // Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

/**
 * Create a new listing
 */
export const createListing = async (
  data: Omit<ListingInsert, 'id'>
): Promise<ListingRecord> => {
  const now = new Date();
  
  // Generate slug from make, model, year
  const slugBase = `${data.year}-${data.make}-${data.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const randomSuffix = createId().slice(0, 8);
  const slug = `${slugBase}-${randomSuffix}`;

  const [result] = await db
    .insert(carListing)
    .values({
      id: makeListingId(),
      ...data,
      slug: data.slug || slug,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return result;
};

/**
 * Update an existing listing
 */
export const updateListing = async (
  id: string,
  data: ListingUpdate
): Promise<ListingRecord | null> => {
  const pruned = pruneUndefined(data);
  
  const [result] = await db
    .update(carListing)
    .set({
      ...pruned,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, id))
    .returning();

  return result ?? null;
};

/**
 * Delete a listing (soft delete by setting status to archived)
 */
export const deleteListing = async (id: string): Promise<boolean> => {
  const [result] = await db
    .update(carListing)
    .set({
      status: 'archived',
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, id))
    .returning();

  return !!result;
};

// ==================== PRICE HISTORY ====================

/**
 * Get price history for a listing
 */
export const getPriceHistory = async (
  listingId: string
): Promise<PriceHistoryRecord[]> => {
  return await db
    .select()
    .from(listingPriceHistory)
    .where(eq(listingPriceHistory.listingId, listingId))
    .orderBy(desc(listingPriceHistory.createdAt));
};

/**
 * Get latest price change for a listing
 */
export const getLatestPriceChange = async (
  listingId: string
): Promise<PriceHistoryRecord | null> => {
  const result = await db
    .select()
    .from(listingPriceHistory)
    .where(eq(listingPriceHistory.listingId, listingId))
    .orderBy(desc(listingPriceHistory.createdAt))
    .limit(1);

  return result[0] ?? null;
};

/**
 * Add a price change record
 * Also updates the listing's price change counter and timestamp
 */
export const addPriceChange = async (
  listingId: string,
  oldPrice: number,
  newPrice: number,
  reason?: string,
  changedBy?: string
): Promise<PriceHistoryRecord> => {
  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

  // Create price history record
  const [priceHistory] = await db
    .insert(listingPriceHistory)
    .values({
      id: makePriceHistoryId(),
      listingId,
      oldPrice,
      newPrice,
      changePercent,
      reason,
      changedBy,
      createdAt: new Date(),
    })
    .returning();

  // Update listing's price change metadata
  await db
    .update(carListing)
    .set({
      priceChanges: sql`${carListing.priceChanges} + 1`,
      lastPriceChange: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));

  return priceHistory;
};

// ==================== VIEW TRACKING ====================

/**
 * Record a listing view
 */
export const recordListingView = async (
  data: Omit<ListingViewInsert, 'id' | 'createdAt'>
): Promise<ListingViewRecord> => {
  const [view] = await db
    .insert(listingView)
    .values({
      id: makeViewId(),
      ...data,
      createdAt: new Date(),
    })
    .returning();

  // Increment listing view count (atomic)
  await incrementViewCount(data.listingId);

  return view;
};

/**
 * Get total view count for a listing
 */
export const getViewCount = async (listingId: string): Promise<number> => {
  const listing = await getListingById(listingId);
  return listing?.viewCount ?? 0;
};

/**
 * Get unique view count (unique user IDs)
 */
export const getUniqueViewCount = async (listingId: string): Promise<number> => {
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${listingView.userId})` })
    .from(listingView)
    .where(
      and(
        eq(listingView.listingId, listingId),
        sql`${listingView.userId} IS NOT NULL`
      )
    );

  return result[0]?.count ?? 0;
};

/**
 * Get detailed view records for a listing
 */
export const getViewsByListing = async (
  listingId: string,
  filters?: {
    userId?: string;
    deviceType?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ListingViewRecord[]> => {
  const conditions = [eq(listingView.listingId, listingId)];

  if (filters?.userId) {
    conditions.push(eq(listingView.userId, filters.userId));
  }
  if (filters?.deviceType) {
    conditions.push(eq(listingView.deviceType, filters.deviceType));
  }

  let query = db
    .select()
    .from(listingView)
    .where(and(...conditions))
    .orderBy(desc(listingView.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

// ==================== ENGAGEMENT COUNTERS ====================

/**
 * Increment view count (atomic)
 */
export const incrementViewCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      viewCount: sql`${carListing.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Increment favourite count (atomic)
 */
export const incrementFavouriteCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      favouriteCount: sql`${carListing.favouriteCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Decrement favourite count (atomic)
 */
export const decrementFavouriteCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      favouriteCount: sql`GREATEST(0, ${carListing.favouriteCount} - 1)`, // Prevent negative
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Increment share count (atomic)
 */
export const incrementShareCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      shareCount: sql`${carListing.shareCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Increment inquiry count (atomic)
 */
export const incrementInquiryCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      inquiryCount: sql`${carListing.inquiryCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Increment call count (atomic)
 */
export const incrementCallCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      callCount: sql`${carListing.callCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Increment WhatsApp count (atomic)
 */
export const incrementWhatsappCount = async (listingId: string): Promise<void> => {
  await db
    .update(carListing)
    .set({
      whatsappCount: sql`${carListing.whatsappCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

// ==================== ANALYTICS & STATS ====================

/**
 * Get comprehensive listing statistics
 */
export const getListingStats = async (listingId: string) => {
  const listing = await getListingById(listingId);
  if (!listing) return null;

  const uniqueViews = await getUniqueViewCount(listingId);
  const priceHistory = await getPriceHistory(listingId);

  return {
    // Engagement metrics
    viewCount: listing.viewCount,
    uniqueViewCount: uniqueViews,
    favouriteCount: listing.favouriteCount,
    superlikeCount: listing.superlikeCount,
    shareCount: listing.shareCount,
    
    // Lead generation
    inquiryCount: listing.inquiryCount,
    bookingCount: listing.bookingCount,
    callCount: listing.callCount,
    whatsappCount: listing.whatsappCount,
    
    // Performance
    qiScore: listing.qiScore,
    performanceScore: listing.performanceScore,
    daysOnMarket: listing.daysOnMarket,
    
    // Pricing
    currentPrice: listing.price,
    priceChanges: listing.priceChanges,
    lastPriceChange: listing.lastPriceChange,
    priceHistory: priceHistory,
    
    // Conversion
    leadQuality: listing.leadQuality,
    conversionRate: listing.conversionRate,
  };
};

/**
 * Update performance score (can be called after analytics calculation)
 */
export const updatePerformanceScore = async (
  listingId: string,
  score: number
): Promise<void> => {
  await db
    .update(carListing)
    .set({
      performanceScore: score,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

/**
 * Update days on market
 */
export const updateDaysOnMarket = async (listingId: string): Promise<void> => {
  const listing = await getListingById(listingId);
  if (!listing?.publishedAt) return;

  const daysOnMarket = Math.floor(
    (Date.now() - new Date(listing.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  await db
    .update(carListing)
    .set({
      daysOnMarket,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId));
};

// ==================== RESERVATION & SALES WORKFLOW ====================

/**
 * Reserve a listing for a user
 */
export const reserveListing = async (
  listingId: string,
  userId: string
): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'reserved',
      reservedAt: now,
      reservedBy: userId,
      updatedAt: now,
    })
    .where(and(
      eq(carListing.id, listingId),
      eq(carListing.status, 'published') // Only published listings can be reserved
    ))
    .returning();

  return result ?? null;
};

/**
 * Unreserve a listing (cancel reservation)
 */
export const unreserveListing = async (
  listingId: string,
  userId?: string
): Promise<ListingRecord | null> => {
  const conditions = [eq(carListing.id, listingId)];
  
  if (userId) {
    // Only allow the user who reserved it to unreserve
    conditions.push(eq(carListing.reservedBy, userId));
  }
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'published',
      reservedAt: null,
      reservedBy: null,
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning();

  return result ?? null;
};

/**
 * Mark listing as sold
 */
export const markListingAsSold = async (
  listingId: string,
  soldToUserId: string,
  soldPrice?: number
): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'sold',
      soldAt: now,
      soldTo: soldToUserId,
      soldPrice: soldPrice,
      updatedAt: now,
    })
    .where(eq(carListing.id, listingId))
    .returning();

  return result ?? null;
};

/**
 * Get listings by reservation status
 */
export const getReservedListings = async (
  userId?: string,
  filters?: {
    limit?: number;
    offset?: number;
  }
): Promise<ListingRecord[]> => {
  const conditions = [eq(carListing.status, 'reserved')];
  
  if (userId) {
    conditions.push(eq(carListing.reservedBy, userId));
  }
  
  let query = db
    .select()
    .from(carListing)
    .where(and(...conditions))
    .orderBy(desc(carListing.reservedAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

/**
 * Get sold listings
 */
export const getSoldListings = async (filters?: {
  partnerId?: string;
  userId?: string; // Sold to user
  limit?: number;
  offset?: number;
}): Promise<ListingRecord[]> => {
  const conditions = [eq(carListing.status, 'sold')];
  
  if (filters?.partnerId) {
    conditions.push(eq(carListing.partnerId, filters.partnerId));
  }
  if (filters?.userId) {
    conditions.push(eq(carListing.soldTo, filters.userId));
  }
  
  let query = db
    .select()
    .from(carListing)
    .where(and(...conditions))
    .orderBy(desc(carListing.soldAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

// ==================== MODERATION WORKFLOW ====================

/**
 * Submit listing for review
 */
export const submitForReview = async (listingId: string): Promise<ListingRecord | null> => {
  const [result] = await db
    .update(carListing)
    .set({
      status: 'pending',
      updatedAt: new Date(),
    })
    .where(and(
      eq(carListing.id, listingId),
      eq(carListing.status, 'draft')
    ))
    .returning();

  return result ?? null;
};

/**
 * Approve listing (move from pending to published)
 */
export const approveListing = async (
  listingId: string,
  reviewedBy: string
): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'published',
      publishedAt: now,
      reviewedBy: reviewedBy,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(and(
      eq(carListing.id, listingId),
      eq(carListing.status, 'pending')
    ))
    .returning();

  return result ?? null;
};

/**
 * Reject listing with reason
 */
export const rejectListing = async (
  listingId: string,
  reviewedBy: string,
  rejectionReason: string
): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'rejected',
      reviewedBy: reviewedBy,
      reviewedAt: now,
      rejectionReason: rejectionReason,
      updatedAt: now,
    })
    .where(and(
      eq(carListing.id, listingId),
      eq(carListing.status, 'pending')
    ))
    .returning();

  return result ?? null;
};

/**
 * Get listings pending review
 */
export const getPendingListings = async (filters?: {
  limit?: number;
  offset?: number;
}): Promise<ListingRecord[]> => {
  let query = db
    .select()
    .from(carListing)
    .where(eq(carListing.status, 'pending'))
    .orderBy(asc(carListing.createdAt)) as any; // Oldest first for fair review queue

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
};

// ==================== ADVANCED ANALYTICS ====================

/**
 * Update conversion metrics
 */
export const updateConversionMetrics = async (
  listingId: string,
  metrics: {
    leadQuality?: number;
    conversionRate?: number;
    avgTimeToSale?: number;
  }
): Promise<ListingRecord | null> => {
  const pruned = pruneUndefined(metrics);
  
  const [result] = await db
    .update(carListing)
    .set({
      ...pruned,
      updatedAt: new Date(),
    })
    .where(eq(carListing.id, listingId))
    .returning();

  return result ?? null;
};

/**
 * Publish listing (from draft directly)
 */
export const publishListing = async (listingId: string): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    })
    .where(and(
      eq(carListing.id, listingId),
      eq(carListing.status, 'draft')
    ))
    .returning();

  return result ?? null;
};

/**
 * Archive listing
 */
export const archiveListing = async (listingId: string): Promise<ListingRecord | null> => {
  const now = new Date();
  
  const [result] = await db
    .update(carListing)
    .set({
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    })
    .where(eq(carListing.id, listingId))
    .returning();

  return result ?? null;
};
