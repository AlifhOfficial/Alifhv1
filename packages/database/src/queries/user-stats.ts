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
import { carListing, conversation, conversationParticipant } from '../schema';
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
  
  // Run queries in parallel since they're independent
  const [listingsResult, soldResult, conversationStats] = await Promise.all([
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

    // Conversation stats - total, responded, and avg response time
    // Only for personal listings (not partner/work listings)
    db
      .select({
        totalInquiries: sql<number>`COUNT(*) FILTER (WHERE 
          ${conversation.type} = 'inquiry'
        )`.as('total_inquiries'),
        respondedInquiries: sql<number>`COUNT(*) FILTER (WHERE 
          ${conversation.type} = 'inquiry' 
          AND EXISTS (
            SELECT 1 FROM message m 
            WHERE m.conversation_id = ${conversation.id} 
            AND m.sender_id != ${conversation.initiatedBy}
            AND m.is_system_message = false
          )
        )`.as('responded_inquiries'),
        avgResponseMinutes: sql<number>`AVG(
          CASE WHEN ${conversation.type} = 'inquiry' AND EXISTS (
            SELECT 1 FROM message m 
            WHERE m.conversation_id = ${conversation.id} 
            AND m.sender_id != ${conversation.initiatedBy}
            AND m.is_system_message = false
          ) THEN
            -- Calculate business hours response time (9am-8pm GST = UTC+4)
            -- Convert times to GST, clamp to business hours, then calculate difference
            (
              SELECT 
                GREATEST(0,
                  -- Calculate business minutes between clamped start and end times
                  EXTRACT(EPOCH FROM (
                    -- Clamp reply time to business hours (max 20:00 GST)
                    LEAST(
                      (m.created_at AT TIME ZONE 'Asia/Dubai'),
                      DATE_TRUNC('day', m.created_at AT TIME ZONE 'Asia/Dubai') + INTERVAL '20 hours'
                    )
                    -
                    -- Clamp inquiry time to business hours (min 09:00 GST)
                    GREATEST(
                      (${conversation.createdAt} AT TIME ZONE 'Asia/Dubai'),
                      DATE_TRUNC('day', ${conversation.createdAt} AT TIME ZONE 'Asia/Dubai') + INTERVAL '9 hours'
                    )
                  )) / 60
                )
              FROM message m 
              WHERE m.conversation_id = ${conversation.id} 
              AND m.sender_id != ${conversation.initiatedBy}
              AND m.is_system_message = false
              ORDER BY m.created_at ASC
              LIMIT 1
            )
          END
        )`.as('avg_response_minutes'),
      })
      .from(conversation)
      .innerJoin(carListing, eq(conversation.listingId, carListing.id))
      .where(
        and(
          eq(carListing.userId, userId),
          eq(carListing.postedByRole, 'user'),
          isNull(carListing.partnerId)
        )
      ),
  ]);

  const listingsCount = listingsResult[0]?.count ?? 0;
  const soldCount = soldResult[0]?.count ?? 0;
  
  // Extract conversation stats
  const totalInquiries = Number(conversationStats[0]?.totalInquiries ?? 0);
  const respondedInquiries = Number(conversationStats[0]?.respondedInquiries ?? 0);
  
  // Only show response stats if minimum threshold met
  const hasEnoughData = totalInquiries >= MIN_INQUIRIES_FOR_STATS;
  
  const responseRate = hasEnoughData
    ? Math.round((respondedInquiries / totalInquiries) * 100)
    : null;
  
  const responseTime = hasEnoughData && conversationStats[0]?.avgResponseMinutes 
    ? Math.round(Number(conversationStats[0].avgResponseMinutes)) 
    : null;

  return {
    listingsCount,
    soldCount,
    responseTime,
    responseRate,
  };
}
