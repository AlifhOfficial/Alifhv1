/**
 * User Stats Query
 * Calculate dynamic user statistics
 * 
 * Metrics:
 * - listingsCount: Total PERSONAL listings by user (excludes partner/work listings)
 * - soldCount: Completed personal sales
 * - responseRate: % of inquiries responded to on personal listings
 * 
 * Note: Partner/work listings (where partnerId is set) are excluded.
 * Those are counted separately in partner stats.
 */

import { db } from '../index';
import { carListing, conversation, conversationParticipant } from '../schema';
import { eq, and, sql, count, isNull } from 'drizzle-orm';

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseRate: number | null; // Percentage (0-100)
}

export async function calculateUserStats(userId: string): Promise<UserStats> {
  // Run all 4 queries in parallel since they're independent
  const [listingsResult, soldResult, totalInquiriesResult, respondedInquiriesResult] = await Promise.all([
    // Total PERSONAL listings count (exclude partner/work listings)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(carListing)
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId)
        )
      ),

    // Sold count (personal listings only)
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

    // Total inquiries on personal listings
    db
      .select({ count: count() })
      .from(conversation)
      .innerJoin(carListing, eq(conversation.listingId, carListing.id))
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId),
          eq(conversation.type, 'inquiry')
        )
      ),

    // Responded inquiries on personal listings
    db
      .select({ count: count() })
      .from(conversation)
      .innerJoin(carListing, eq(conversation.listingId, carListing.id))
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId),
          eq(conversation.type, 'inquiry'),
          sql`${conversation.messageCount} > 0`
        )
      ),
  ]);

  const listingsCount = listingsResult[0]?.count ?? 0;
  const soldCount = soldResult[0]?.count ?? 0;
  const totalInquiries = totalInquiriesResult[0]?.count ?? 0;
  const respondedInquiries = respondedInquiriesResult[0]?.count ?? 0;
  const responseRate = totalInquiries > 0 ? Math.round((respondedInquiries / totalInquiries) * 100) : null;

  return {
    listingsCount,
    soldCount,
    responseRate,
  };
}
