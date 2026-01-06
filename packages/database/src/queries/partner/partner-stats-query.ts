/**
 * Partner Stats Query - Production
 * 
 * Actionable business metrics for partner insights dashboard.
 * Focused on metrics that drive decisions, not vanity stats.
 * 
 * @module queries/partner/partner-stats-query
 */

import { eq, and, sql, gte, lt, count, sum, avg, desc, asc, isNull, isNotNull, or } from 'drizzle-orm';
import { db } from '../../dbclient';
import { carListing, listingView } from '../../schema/listing';
import { booking } from '../../schema/booking';

// ============================================================================
// Types
// ============================================================================

export interface PartnerInventoryStats {
  activeCount: number;
  totalValue: number;
  avgPrice: number;
  staleCount: number; // 30+ days, no sale
  expiringCount: number; // expires in 7 days
  pendingApprovalCount: number;
  needsRemoderationCount: number;
  draftCount: number;
  reservedCount: number;
}

export interface PartnerSalesStats {
  soldThisMonth: number;
  revenueThisMonth: number;
  avgDaysToSell: number | null;
  sellThroughRate: number; // percentage
  avgSoldPrice: number | null;
  totalSoldAllTime: number;
  revenueAllTime: number;
  fastestSale: number | null; // days
  slowestActiveListing: {
    id: string;
    title: string;
    daysSincePublished: number;
    thumbnail: string | null;
  } | null;
}

export interface PartnerEngagementStats {
  totalViewsThisMonth: number;
  avgViewsPerListing: number;
  totalImpressions: number;
  totalFavorites: number;
  totalSuperlikes: number;
  viewToFavoriteRate: number; // percentage
  listingsWithVideo: number;
  avgQiScore: number | null;
  topViewedListings: Array<{
    id: string;
    title: string;
    viewCount: number;
    thumbnail: string | null;
  }>;
  coldListings: Array<{
    id: string;
    title: string;
    viewCount: number;
    daysSincePublished: number;
    thumbnail: string | null;
  }>;
}

export interface PartnerBookingStats {
  pendingBookings: number;
  confirmedBookings: number;
  completedThisMonth: number;
  noShowRate: number; // percentage
  bookingsThisWeek: number;
  cancellationRate: number; // percentage
}

export interface PartnerTrendStats {
  listingsAddedThisMonth: number;
  listingsAddedLastMonth: number;
  listingsAddedDelta: number; // percentage change
  viewsThisMonth: number;
  viewsLastMonth: number;
  viewsDelta: number; // percentage change
  salesThisMonth: number;
  salesLastMonth: number;
  salesDelta: number; // percentage change
  soldThisWeek: number;
  soldLastWeek: number;
  weekOverWeekSalesDelta: number; // percentage change
}

export interface PartnerInventoryComposition {
  byCondition: { condition: string; count: number }[];
  byBodyType: { bodyType: string; count: number }[];
  byMake: { make: string; count: number }[];
  byFuelType: { fuelType: string; count: number }[];
  priceRangeDistribution: { range: string; count: number; min: number; max: number }[];
  avgMileage: number | null;
  avgYear: number | null;
}

export interface PartnerDescriptiveStats {
  inventory: PartnerInventoryStats;
  sales: PartnerSalesStats;
  engagement: PartnerEngagementStats;
  bookings: PartnerBookingStats;
  trends: PartnerTrendStats;
  composition: PartnerInventoryComposition;
  generatedAt: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getLastMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get inventory statistics for a partner
 * Optimized: Single query with conditional aggregation
 */
export async function getPartnerInventoryStats(partnerId: string): Promise<PartnerInventoryStats> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Single query with conditional aggregation for all inventory stats
  const [stats] = await db
    .select({
      // Active listings stats
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.moderationStatus} = 'approved' AND ${carListing.lifecycleStatus} = 'active')`,
      totalValue: sql<number>`COALESCE(SUM(${carListing.price}) FILTER (WHERE ${carListing.moderationStatus} = 'approved' AND ${carListing.lifecycleStatus} = 'active'), 0)`,
      avgPrice: sql<number>`AVG(${carListing.price}) FILTER (WHERE ${carListing.moderationStatus} = 'approved' AND ${carListing.lifecycleStatus} = 'active')`,
      // Stale listings (30+ days old, not sold)
      staleCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.moderationStatus} = 'approved' AND ${carListing.lifecycleStatus} = 'active' AND ${carListing.publishedAt} < ${thirtyDaysAgo} AND ${carListing.soldAt} IS NULL)`,
      // Expiring soon (within 7 days)
      expiringCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.lifecycleStatus} = 'active' AND ${carListing.expiresAt} >= ${now} AND ${carListing.expiresAt} < ${sevenDaysFromNow})`,
      // Pending approval
      pendingApprovalCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.moderationStatus} IN ('submitted', 'pending_review'))`,
      // Needs remoderation
      needsRemoderationCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.needsRemoderation} = true)`,
      // Drafts
      draftCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.moderationStatus} = 'draft')`,
      // Reserved
      reservedCount: sql<number>`COUNT(*) FILTER (WHERE ${carListing.reservedAt} IS NOT NULL AND ${carListing.soldAt} IS NULL)`,
    })
    .from(carListing)
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        isNull(carListing.deletedAt)
      )
    );

  return {
    activeCount: Number(stats?.activeCount ?? 0),
    totalValue: Number(stats?.totalValue ?? 0),
    avgPrice: Math.round(Number(stats?.avgPrice ?? 0)),
    staleCount: Number(stats?.staleCount ?? 0),
    expiringCount: Number(stats?.expiringCount ?? 0),
    pendingApprovalCount: Number(stats?.pendingApprovalCount ?? 0),
    needsRemoderationCount: Number(stats?.needsRemoderationCount ?? 0),
    draftCount: Number(stats?.draftCount ?? 0),
    reservedCount: Number(stats?.reservedCount ?? 0),
  };
}

/**
 * Get sales statistics for a partner
 * Optimized: Consolidated queries with conditional aggregation + parallel execution
 */
export async function getPartnerSalesStats(partnerId: string): Promise<PartnerSalesStats> {
  const now = new Date();
  const monthStart = getMonthStart(now);

  // Run consolidated sales query and slowest listing query in parallel
  const [salesStatsResult, slowestActiveResult] = await Promise.all([
    // Single query for all sales aggregations
    db
      .select({
        // This month
        soldThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${carListing.soldAt} >= ${monthStart})`,
        revenueThisMonth: sql<number>`COALESCE(SUM(${carListing.soldPrice}) FILTER (WHERE ${carListing.soldAt} >= ${monthStart}), 0)`,
        // All time
        totalSoldAllTime: count(),
        revenueAllTime: sql<number>`COALESCE(SUM(${carListing.soldPrice}), 0)`,
        avgSoldPrice: avg(carListing.soldPrice),
        // Days to sell metrics
        avgDaysToSell: sql<number>`AVG(EXTRACT(EPOCH FROM (${carListing.soldAt} - ${carListing.publishedAt})) / 86400) FILTER (WHERE ${carListing.publishedAt} IS NOT NULL)`,
        fastestSale: sql<number>`MIN(EXTRACT(EPOCH FROM (${carListing.soldAt} - ${carListing.publishedAt})) / 86400) FILTER (WHERE ${carListing.publishedAt} IS NOT NULL)`,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          isNotNull(carListing.soldAt)
        )
      ),
    // Slowest active listing (oldest unsold) + active count in one query
    db
      .select({
        id: carListing.id,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
        publishedAt: carListing.publishedAt,
        thumbnail: carListing.thumbnail,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.moderationStatus, 'approved'),
          eq(carListing.lifecycleStatus, 'active'),
          isNotNull(carListing.publishedAt),
          isNull(carListing.deletedAt)
        )
      )
      .orderBy(asc(carListing.publishedAt))
      .limit(1),
  ]);

  // Get active count for sell-through rate
  const [activeCount] = await db
    .select({ count: count() })
    .from(carListing)
    .where(
      and(
        eq(carListing.partnerId, partnerId),
        eq(carListing.lifecycleStatus, 'active'),
        isNull(carListing.deletedAt)
      )
    );

  const salesStats = salesStatsResult[0];
  const soldCount = Number(salesStats?.soldThisMonth ?? 0);
  const active = Number(activeCount?.count ?? 0);
  const sellThroughRate = soldCount + active > 0 
    ? Math.round((soldCount / (soldCount + active)) * 100) 
    : 0;

  const slowestListing = slowestActiveResult[0];
  const slowestActiveListing = slowestListing ? {
    id: slowestListing.id,
    title: `${slowestListing.year} ${slowestListing.make} ${slowestListing.model}`,
    daysSincePublished: slowestListing.publishedAt 
      ? Math.floor((now.getTime() - new Date(slowestListing.publishedAt).getTime()) / (24 * 60 * 60 * 1000))
      : 0,
    thumbnail: slowestListing.thumbnail,
  } : null;

  return {
    soldThisMonth: soldCount,
    revenueThisMonth: Number(salesStats?.revenueThisMonth ?? 0),
    avgDaysToSell: salesStats?.avgDaysToSell ? Math.round(salesStats.avgDaysToSell) : null,
    sellThroughRate,
    avgSoldPrice: salesStats?.avgSoldPrice ? Math.round(Number(salesStats.avgSoldPrice)) : null,
    totalSoldAllTime: Number(salesStats?.totalSoldAllTime ?? 0),
    revenueAllTime: Number(salesStats?.revenueAllTime ?? 0),
    fastestSale: salesStats?.fastestSale ? Math.round(salesStats.fastestSale) : null,
    slowestActiveListing,
  };
}

/**
 * Get engagement statistics for a partner
 * Optimized: Run all queries in parallel
 */
export async function getPartnerEngagementStats(partnerId: string): Promise<PartnerEngagementStats> {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Run all queries in parallel
  const [engagementStatsResult, topViewed, coldListings] = await Promise.all([
    // Combined stats query with video count
    db
      .select({
        totalViews: sum(carListing.viewCount),
        totalFavorites: sum(carListing.favouriteCount),
        totalSuperlikes: sum(carListing.superlikeCount),
        listingCount: count(),
        avgQiScore: avg(carListing.qiScore),
        listingsWithVideo: sql<number>`COUNT(*) FILTER (WHERE ${carListing.videoUrl} IS NOT NULL)`,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.lifecycleStatus, 'active'),
          isNull(carListing.deletedAt)
        )
      ),
    // Top 3 viewed listings
    db
      .select({
        id: carListing.id,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
        viewCount: carListing.viewCount,
        thumbnail: carListing.thumbnail,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.lifecycleStatus, 'active'),
          isNull(carListing.deletedAt)
        )
      )
      .orderBy(desc(carListing.viewCount))
      .limit(3),
    // Cold listings (low views, 5+ days old)
    db
      .select({
        id: carListing.id,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
        viewCount: carListing.viewCount,
        publishedAt: carListing.publishedAt,
        thumbnail: carListing.thumbnail,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.lifecycleStatus, 'active'),
          lt(carListing.viewCount, 10),
          lt(carListing.publishedAt, fiveDaysAgo),
          isNull(carListing.deletedAt)
        )
      )
      .orderBy(asc(carListing.viewCount))
      .limit(5),
  ]);

  const engagementStats = engagementStatsResult[0];
  const totalViews = Number(engagementStats?.totalViews ?? 0);
  const totalFavorites = Number(engagementStats?.totalFavorites ?? 0);
  const totalSuperlikes = Number(engagementStats?.totalSuperlikes ?? 0);
  const listingCount = Number(engagementStats?.listingCount ?? 0);
  const avgQiScore = engagementStats?.avgQiScore ? Math.round(Number(engagementStats.avgQiScore)) : null;

  // View to favorite rate
  const viewToFavoriteRate = totalViews > 0 
    ? Math.round((totalFavorites / totalViews) * 100) 
    : 0;

  return {
    totalViewsThisMonth: totalViews,
    avgViewsPerListing: listingCount > 0 ? Math.round(totalViews / listingCount) : 0,
    topViewedListings: topViewed.map(l => ({
      id: l.id,
      title: `${l.year} ${l.make} ${l.model}`,
      viewCount: l.viewCount,
      thumbnail: l.thumbnail,
    })),
    coldListings: coldListings.map(l => ({
      id: l.id,
      title: `${l.year} ${l.make} ${l.model}`,
      viewCount: l.viewCount,
      daysSincePublished: l.publishedAt 
        ? Math.floor((now.getTime() - new Date(l.publishedAt).getTime()) / (24 * 60 * 60 * 1000))
        : 0,
      thumbnail: l.thumbnail,
    })),
    totalImpressions: totalViews, // For now, impressions = views
    totalFavorites,
    totalSuperlikes,
    viewToFavoriteRate,
    listingsWithVideo: Number(engagementStats?.listingsWithVideo ?? 0),
    avgQiScore,
  };
}

/**
 * Get booking statistics for partner insights dashboard
 * Optimized: Single query with conditional aggregation
 */
export async function getPartnerInsightsBookingStats(partnerId: string): Promise<PartnerBookingStats> {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Single query with conditional aggregation for all booking stats
  const [stats] = await db
    .select({
      // Pending bookings
      pendingBookings: sql<number>`COUNT(*) FILTER (WHERE ${booking.status} = 'pending')`,
      // Confirmed bookings (upcoming)
      confirmedBookings: sql<number>`COUNT(*) FILTER (WHERE ${booking.status} = 'confirmed' AND ${booking.scheduledStartTime} >= ${now})`,
      // Completed this month
      completedThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${booking.status} = 'completed' AND ${booking.scheduledStartTime} >= ${monthStart})`,
      // Bookings this week
      bookingsThisWeek: sql<number>`COUNT(*) FILTER (WHERE ${booking.createdAt} >= ${weekStart})`,
      // For no-show rate: past bookings this month
      totalPastBookingsMonth: sql<number>`COUNT(*) FILTER (WHERE ${booking.scheduledStartTime} >= ${monthStart} AND ${booking.scheduledStartTime} < ${now})`,
      noShowCount: sql<number>`COUNT(*) FILTER (WHERE ${booking.status} = 'no_show' AND ${booking.scheduledStartTime} >= ${monthStart})`,
      // For cancellation rate: bookings created this month
      totalCreatedMonth: sql<number>`COUNT(*) FILTER (WHERE ${booking.createdAt} >= ${monthStart})`,
      cancelledCount: sql<number>`COUNT(*) FILTER (WHERE ${booking.status} = 'cancelled' AND ${booking.createdAt} >= ${monthStart})`,
    })
    .from(booking)
    .where(eq(booking.partnerId, partnerId));

  const totalPastBookings = Number(stats?.totalPastBookingsMonth ?? 0);
  const noShows = Number(stats?.noShowCount ?? 0);
  const noShowRate = totalPastBookings > 0 
    ? Math.round((noShows / totalPastBookings) * 100) 
    : 0;

  const totalCreated = Number(stats?.totalCreatedMonth ?? 0);
  const cancelled = Number(stats?.cancelledCount ?? 0);
  const cancellationRate = totalCreated > 0
    ? Math.round((cancelled / totalCreated) * 100)
    : 0;

  return {
    pendingBookings: Number(stats?.pendingBookings ?? 0),
    confirmedBookings: Number(stats?.confirmedBookings ?? 0),
    completedThisMonth: Number(stats?.completedThisMonth ?? 0),
    noShowRate,
    bookingsThisWeek: Number(stats?.bookingsThisWeek ?? 0),
    cancellationRate,
  };
}

/**
 * Get trend statistics comparing this month vs last month
 * Optimized: 2 parallel queries (one for listings, one for views) with conditional aggregation
 */
export async function getPartnerTrendStats(partnerId: string): Promise<PartnerTrendStats> {
  const now = new Date();
  const thisMonthStart = getMonthStart(now);
  const lastMonthStart = getLastMonthStart(now);
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Run both queries in parallel
  const [listingStats, viewStats] = await Promise.all([
    // Listing trends: single query with conditional aggregation
    db
      .select({
        listingsThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${carListing.createdAt} >= ${thisMonthStart})`,
        listingsLastMonth: sql<number>`COUNT(*) FILTER (WHERE ${carListing.createdAt} >= ${lastMonthStart} AND ${carListing.createdAt} < ${thisMonthStart})`,
        salesThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${carListing.soldAt} IS NOT NULL AND ${carListing.soldAt} >= ${thisMonthStart})`,
        salesLastMonth: sql<number>`COUNT(*) FILTER (WHERE ${carListing.soldAt} IS NOT NULL AND ${carListing.soldAt} >= ${lastMonthStart} AND ${carListing.soldAt} < ${thisMonthStart})`,
        soldThisWeek: sql<number>`COUNT(*) FILTER (WHERE ${carListing.soldAt} IS NOT NULL AND ${carListing.soldAt} >= ${thisWeekStart})`,
        soldLastWeek: sql<number>`COUNT(*) FILTER (WHERE ${carListing.soldAt} IS NOT NULL AND ${carListing.soldAt} >= ${lastWeekStart} AND ${carListing.soldAt} < ${thisWeekStart})`,
      })
      .from(carListing)
      .where(eq(carListing.partnerId, partnerId)),
    // View trends: single query with conditional aggregation
    db
      .select({
        viewsThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${listingView.createdAt} >= ${thisMonthStart})`,
        viewsLastMonth: sql<number>`COUNT(*) FILTER (WHERE ${listingView.createdAt} >= ${lastMonthStart} AND ${listingView.createdAt} < ${thisMonthStart})`,
      })
      .from(listingView)
      .innerJoin(carListing, eq(listingView.listingId, carListing.id))
      .where(eq(carListing.partnerId, partnerId)),
  ]);

  const stats = listingStats[0];
  const views = viewStats[0];

  const listingsThisMonth = Number(stats?.listingsThisMonth ?? 0);
  const listingsLastMonth = Number(stats?.listingsLastMonth ?? 0);
  const viewsThisMonth = Number(views?.viewsThisMonth ?? 0);
  const viewsLastMonth = Number(views?.viewsLastMonth ?? 0);
  const salesThisMonth = Number(stats?.salesThisMonth ?? 0);
  const salesLastMonth = Number(stats?.salesLastMonth ?? 0);
  const soldThisWeek = Number(stats?.soldThisWeek ?? 0);
  const soldLastWeek = Number(stats?.soldLastWeek ?? 0);

  return {
    listingsAddedThisMonth: listingsThisMonth,
    listingsAddedLastMonth: listingsLastMonth,
    listingsAddedDelta: calculateDelta(listingsThisMonth, listingsLastMonth),
    viewsThisMonth,
    viewsLastMonth,
    viewsDelta: calculateDelta(viewsThisMonth, viewsLastMonth),
    salesThisMonth,
    salesLastMonth,
    salesDelta: calculateDelta(salesThisMonth, salesLastMonth),
    soldThisWeek,
    soldLastWeek,
    weekOverWeekSalesDelta: calculateDelta(soldThisWeek, soldLastWeek),
  };
}

/**
 * Get inventory composition breakdown
 * Optimized: Run all groupBy queries in parallel + single query for price ranges
 */
export async function getPartnerInventoryComposition(partnerId: string): Promise<PartnerInventoryComposition> {
  const activeListingCondition = and(
    eq(carListing.partnerId, partnerId),
    eq(carListing.lifecycleStatus, 'active'),
    isNull(carListing.deletedAt)
  );

  // Run all queries in parallel
  const [conditionResult, bodyTypeResult, makeResult, fuelTypeResult, priceAndAvgStats] = await Promise.all([
    // By condition (new/used)
    db
      .select({
        condition: carListing.condition,
        count: count(),
      })
      .from(carListing)
      .where(activeListingCondition)
      .groupBy(carListing.condition),
    // By body type (top 5)
    db
      .select({
        bodyType: carListing.bodyType,
        count: count(),
      })
      .from(carListing)
      .where(activeListingCondition)
      .groupBy(carListing.bodyType)
      .orderBy(desc(count()))
      .limit(5),
    // By make (top 5)
    db
      .select({
        make: carListing.make,
        count: count(),
      })
      .from(carListing)
      .where(activeListingCondition)
      .groupBy(carListing.make)
      .orderBy(desc(count()))
      .limit(5),
    // By fuel type
    db
      .select({
        fuelType: carListing.fuelType,
        count: count(),
      })
      .from(carListing)
      .where(activeListingCondition)
      .groupBy(carListing.fuelType)
      .orderBy(desc(count())),
    // Price ranges + averages in single query using CASE expressions
    db
      .select({
        under50k: sql<number>`COUNT(*) FILTER (WHERE ${carListing.price} >= 0 AND ${carListing.price} < 50000)`,
        range50to100k: sql<number>`COUNT(*) FILTER (WHERE ${carListing.price} >= 50000 AND ${carListing.price} < 100000)`,
        range100to200k: sql<number>`COUNT(*) FILTER (WHERE ${carListing.price} >= 100000 AND ${carListing.price} < 200000)`,
        range200to500k: sql<number>`COUNT(*) FILTER (WHERE ${carListing.price} >= 200000 AND ${carListing.price} < 500000)`,
        over500k: sql<number>`COUNT(*) FILTER (WHERE ${carListing.price} >= 500000)`,
        avgMileage: avg(carListing.mileage),
        avgYear: avg(carListing.year),
      })
      .from(carListing)
      .where(activeListingCondition),
  ]);

  const priceStats = priceAndAvgStats[0];
  const priceDistribution = [
    { range: 'Under 50K', count: Number(priceStats?.under50k ?? 0), min: 0, max: 50000 },
    { range: '50K - 100K', count: Number(priceStats?.range50to100k ?? 0), min: 50000, max: 100000 },
    { range: '100K - 200K', count: Number(priceStats?.range100to200k ?? 0), min: 100000, max: 200000 },
    { range: '200K - 500K', count: Number(priceStats?.range200to500k ?? 0), min: 200000, max: 500000 },
    { range: 'Over 500K', count: Number(priceStats?.over500k ?? 0), min: 500000, max: 999999999 },
  ];

  return {
    byCondition: conditionResult.map(r => ({
      condition: r.condition ?? 'Unknown',
      count: Number(r.count),
    })),
    byBodyType: bodyTypeResult.map(r => ({
      bodyType: r.bodyType ?? 'Unknown',
      count: Number(r.count),
    })),
    byMake: makeResult.map(r => ({
      make: r.make ?? 'Unknown',
      count: Number(r.count),
    })),
    byFuelType: fuelTypeResult.map(r => ({
      fuelType: r.fuelType ?? 'Unknown',
      count: Number(r.count),
    })),
    priceRangeDistribution: priceDistribution,
    avgMileage: priceStats?.avgMileage ? Math.round(Number(priceStats.avgMileage)) : null,
    avgYear: priceStats?.avgYear ? Math.round(Number(priceStats.avgYear)) : null,
  };
}

/**
 * Get all partner descriptive statistics
 * Main entry point for the insights dashboard
 */
export async function getPartnerDescriptiveStats(partnerId: string): Promise<PartnerDescriptiveStats> {
  // Run all queries in parallel for performance
  const [inventory, sales, engagement, bookings, trends, composition] = await Promise.all([
    getPartnerInventoryStats(partnerId),
    getPartnerSalesStats(partnerId),
    getPartnerEngagementStats(partnerId),
    getPartnerInsightsBookingStats(partnerId),
    getPartnerTrendStats(partnerId),
    getPartnerInventoryComposition(partnerId),
  ]);

  return {
    inventory,
    sales,
    engagement,
    bookings,
    trends,
    composition,
    generatedAt: new Date().toISOString(),
  };
}
