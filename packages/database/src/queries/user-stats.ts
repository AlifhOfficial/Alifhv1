/**
 * User Stats Query
 * Calculate dynamic user statistics
 * 
 * Metrics:
 * - listingsCount: Total PUBLIC personal listings by user (excludes partner/work listings)
 * - soldCount: Completed personal sales
 * - responseTime: Average minutes to first response (business hours only: 9am-8pm GST)
 * - responseRate: % of inquiries responded to (min 5 inquiries required)
 * 
 * Business Hours Logic:
 * - Response time only counts hours between 9am-8pm (11 hours/day)
 * - If inquiry comes at 2am, clock starts at 9am
 * - If reply comes at 10pm, it counts as 8pm same day
 * - This prevents unfair penalization for after-hours inquiries
 * 
 * Minimum Threshold:
 * - responseRate and responseTime only shown if 5+ inquiries
 * - Prevents misleading stats from small sample sizes
 * 
 * Note: Partner/work listings (where partnerId is set) are excluded.
 * Those are counted separately in partner stats.
 * 
 * Public visibility requires:
 * - moderationStatus = 'approved'
 * - lifecycleStatus = 'active'
 * - needsRemoderation = false
 * - expiresAt IS NOT NULL AND expiresAt > now
 */

import { db } from '../index';
import { carListing, conversation, message } from '../schema';
import { eq, and, sql, count, isNull, gt, isNotNull } from 'drizzle-orm';

// Minimum inquiries required to show response stats
const MIN_INQUIRIES_FOR_STATS = 5;

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseTime: number | null; // Minutes (business hours only)
  responseRate: number | null; // Percentage (0-100)
}

export async function calculateUserStats(userId: string): Promise<UserStats> {
  const now = new Date();
  
  // Run base counters in parallel since they're independent.
  // Keep inquiry count separate so we can skip the expensive response-time query
  // when there is not enough data to display stats.
  const [listingsResult, soldResult, inquiryCountResult] = await Promise.all([
    // Total PUBLIC personal listings count (exclude partner/work listings)
    // Must match public visibility conditions (same as buildPublicConditions in car-card-query.ts)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(carListing)
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId),
          // Public visibility conditions
          eq(carListing.moderationStatus, 'approved'),
          eq(carListing.lifecycleStatus, 'active'),
          eq(carListing.needsRemoderation, false),
          isNotNull(carListing.expiresAt),
          gt(carListing.expiresAt, now)
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

    // Total inquiries count (cheap aggregate)
    db
      .select({ totalInquiries: count() })
      .from(conversation)
      .innerJoin(carListing, eq(conversation.listingId, carListing.id))
      .where(
        and(
          eq(conversation.type, 'inquiry'),
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId)
        )
      ),
  ]);

  const listingsCount = listingsResult[0]?.count ?? 0;
  const soldCount = soldResult[0]?.count ?? 0;
  
  const totalInquiries = Number(inquiryCountResult[0]?.totalInquiries ?? 0);
  
  const hasEnoughData = totalInquiries >= MIN_INQUIRIES_FOR_STATS;

  // Skip expensive response-time query when UI won't display these stats anyway.
  if (!hasEnoughData) {
    return {
      listingsCount,
      soldCount,
      responseTime: null,
      responseRate: null,
    };
  }

  // Conversation stats for users with sufficient inquiry volume.
  // Use one lateral lookup to fetch first non-system response per inquiry.
  const [conversationStats] = await db
    .select({
      respondedInquiries: sql<number>`COUNT(*) FILTER (WHERE first_response.first_response_at IS NOT NULL)`.as('responded_inquiries'),
      avgResponseMinutes: sql<number>`AVG(
        CASE WHEN first_response.first_response_at IS NOT NULL THEN
          GREATEST(
            0,
            EXTRACT(EPOCH FROM (
              LEAST(
                (first_response.first_response_at AT TIME ZONE 'Asia/Dubai'),
                DATE_TRUNC('day', first_response.first_response_at AT TIME ZONE 'Asia/Dubai') + INTERVAL '20 hours'
              )
              -
              GREATEST(
                (${conversation.createdAt} AT TIME ZONE 'Asia/Dubai'),
                DATE_TRUNC('day', ${conversation.createdAt} AT TIME ZONE 'Asia/Dubai') + INTERVAL '9 hours'
              )
            )) / 60
          )
        END
      )`.as('avg_response_minutes'),
    })
    .from(conversation)
    .innerJoin(carListing, eq(conversation.listingId, carListing.id))
    .leftJoin(
      sql<{ first_response_at: Date | null }>`LATERAL (
        SELECT ${message.createdAt} AS first_response_at
        FROM ${message}
        WHERE ${message.conversationId} = ${conversation.id}
          AND ${message.senderId} != ${conversation.initiatedBy}
          AND ${message.isSystemMessage} = false
        ORDER BY ${message.createdAt} ASC
        LIMIT 1
      ) AS first_response`,
      sql`true`
    )
    .where(
      and(
        eq(conversation.type, 'inquiry'),
        eq(carListing.userId, userId),
        eq(carListing.postedByRole, 'user'),
        isNull(carListing.partnerId)
      )
    );

  const respondedInquiries = Number(conversationStats?.respondedInquiries ?? 0);
  
  const responseRate = Math.round((respondedInquiries / totalInquiries) * 100);
  
  const responseTime = conversationStats?.avgResponseMinutes
    ? Math.round(Number(conversationStats.avgResponseMinutes))
    : null;

  return {
    listingsCount,
    soldCount,
    responseTime,
    responseRate,
  };
}
