/**
 * Partner Stats Calculation Query
 * 
 * Calculates dynamic metrics:
 * - inventoryCount: Count of active (published) listings
 * - totalSales: Count of sold listings
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
 * Performance optimizations:
 * - Combined listing stats into single query (2 counts in 1 query)
 * - Combined conversation stats into single query (counts + avg in 1 query)
 * - Reduced from 5 DB calls to 2 DB calls
 */

import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { conversation } from '../../../schema/messaging';
import { eq, and, sql, gt, isNotNull } from 'drizzle-orm';

// Minimum inquiries required to show response stats
const MIN_INQUIRIES_FOR_STATS = 5;

export interface PartnerStats {
  inventoryCount: number;
  totalSales: number;
  responseTime: number | null;
  responseRate: number | null;
}

/**
 * Get partner stats
 * Expensive aggregation queries
 */
export async function calculatePartnerStats(partnerId: string): Promise<PartnerStats> {
  try {
    const now = new Date();

    // Run both queries in parallel since they're independent
    const [listingStats, conversationStats] = await Promise.all([
      // QUERY 1: Listing stats - inventory + sales in single query
      // Note: inventoryCount only counts PUBLIC listings (must match buildPublicConditions)
      db
        .select({
          inventoryCount: sql<number>`COUNT(*) FILTER (WHERE 
            ${carListing.moderationStatus} = 'approved' 
            AND ${carListing.lifecycleStatus} = 'active' 
            AND ${carListing.needsRemoderation} = false
            AND ${carListing.expiresAt} IS NOT NULL 
            AND ${carListing.expiresAt} > ${now.toISOString()}
          )`.as('inventory_count'),
          totalSales: sql<number>`COUNT(*) FILTER (WHERE 
            ${carListing.lifecycleStatus} = 'sold'
          )`.as('total_sales'),
        })
        .from(carListing)
        .where(eq(carListing.partnerId, partnerId)),

      // QUERY 2: Conversation stats - total, responded, and avg response time in single query
      // NOTE: A conversation is considered "responded" when there's a message from someone
      // OTHER than the initiator (i.e., the partner/seller replied to the buyer's inquiry)
      // 
      // Business Hours Response Time:
      // - Uses a custom function to calculate minutes only during 9am-8pm GST (UTC+4)
      // - Inquiry at 2am GST -> clock starts at 9am GST
      // - Reply at 10pm GST -> counts as 8pm GST
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
        .where(eq(conversation.partnerId, partnerId)),
    ]);

    // Extract listing stats
    const inventoryCount = Number(listingStats[0]?.inventoryCount ?? 0);
    const totalSales = Number(listingStats[0]?.totalSales ?? 0);

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

    const stats: PartnerStats = {
      inventoryCount,
      totalSales,
      responseTime,
      responseRate,
    };

    return stats;
  } catch (error) {
    console.error('[calculatePartnerStats] Error:', error);
    throw error;
  }
}
