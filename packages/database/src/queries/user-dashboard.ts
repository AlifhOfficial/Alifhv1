/**
 * User Dashboard Stats Query
 * 
 * Single efficient query for dashboard overview.
 * Returns all metrics needed for the user dashboard in one call.
 * 
 * Metrics:
 * - Listings: active, total, expiring soon
 * - Engagement: total views, total saves, avg per listing
 * - Sales: sold count
 * - Activity: saves made, superlikes used/remaining
 * - Trend: placeholder last 7 days data until daily aggregates are introduced
 */

import { db } from '../dbclient';
import { 
  carListing, 
  userFavorite, 
  userSuperlikeQuota,
} from '../schema';
import { eq, and, sql, isNull, gte, lte } from 'drizzle-orm';

// ============================================================================
// Types
// ============================================================================

export interface UserDashboardStats {
  // Listings
  activeListings: number;
  totalListings: number;
  expiringSoon: number; // Expiring within 7 days
  
  // Engagement (aggregate across all user's listings)
  totalViews: number;
  totalSaves: number;
  avgViewsPerListing: number;
  saveRate: number; // (saves / views) * 100
  
  // Sales
  soldCount: number;
  
  // User Activity
  mySaves: number; // Listings user has saved
  superlikesUsed: number;
  superlikesRemaining: number;
  
  // Member info
  memberSince: string | null;
  
  // Trend data (last 7 days views for sparkline)
  viewsTrend: { date: string; views: number }[];
}

// ============================================================================
// Query
// ============================================================================

export async function getUserDashboardStats(userId: string): Promise<UserDashboardStats> {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [
    listingStats,
    soldResult,
    expiringResult,
    mySavesResult,
    superlikeQuotaResult,
  ] = await Promise.all([
    // 1. Aggregate listing stats (active listings, views, saves)
    db
      .select({
        activeCount: sql<number>`count(*) filter (where ${carListing.moderationStatus} = 'approved' and ${carListing.lifecycleStatus} = 'active')::int`,
        totalCount: sql<number>`count(*)::int`,
        totalViews: sql<number>`coalesce(sum(${carListing.viewCount}), 0)::int`,
        totalSaves: sql<number>`coalesce(sum(${carListing.favouriteCount}), 0)::int`,
      })
      .from(carListing)
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId)
        )
      ),

    // 2. Sold count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(carListing)
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId),
          eq(carListing.lifecycleStatus, 'sold')
        )
      ),

    // 3. Expiring soon (within 7 days)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(carListing)
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId),
          eq(carListing.moderationStatus, 'approved'),
          eq(carListing.lifecycleStatus, 'active'),
          gte(carListing.expiresAt, now),
          lte(carListing.expiresAt, sevenDaysFromNow)
        )
      ),

    // 4. User's saved listings count
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userFavorite)
      .where(eq(userFavorite.userId, userId)),

    // 5. Superlike quota
    db
      .select({
        used: userSuperlikeQuota.currentMonthSuperlikesUsed,
        max: userSuperlikeQuota.maxSuperlikesPerMonth,
      })
      .from(userSuperlikeQuota)
      .where(eq(userSuperlikeQuota.userId, userId)),

  ]);

  // Process results
  const stats = listingStats[0];
  const activeListings = stats?.activeCount ?? 0;
  const totalListings = stats?.totalCount ?? 0;
  const totalViews = stats?.totalViews ?? 0;
  const totalSaves = stats?.totalSaves ?? 0;
  
  const avgViewsPerListing = activeListings > 0 ? Math.round(totalViews / activeListings) : 0;
  const saveRate = totalViews > 0 ? Math.round((totalSaves / totalViews) * 100 * 10) / 10 : 0;

  const soldCount = soldResult[0]?.count ?? 0;
  const expiringSoon = expiringResult[0]?.count ?? 0;
  const mySaves = mySavesResult[0]?.count ?? 0;

  const quota = superlikeQuotaResult[0];
  const superlikesUsed = quota?.used ?? 0;
  const superlikesRemaining = (quota?.max ?? 5) - superlikesUsed;

  // Fill in missing days for trend (ensure 7 data points)
  const viewsTrend: { date: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    viewsTrend.push({
      date: dateStr,
      views: 0,
    });
  }

  return {
    activeListings,
    totalListings,
    expiringSoon,
    totalViews,
    totalSaves,
    avgViewsPerListing,
    saveRate,
    soldCount,
    mySaves,
    superlikesUsed,
    superlikesRemaining,
    memberSince: null, // Filled by API from profile
    viewsTrend,
  };
}
