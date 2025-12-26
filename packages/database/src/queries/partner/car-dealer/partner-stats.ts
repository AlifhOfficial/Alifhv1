/**
 * Partner Stats Calculation Query
 * 
 * Calculates dynamic metrics on-demand (expensive queries)
 * - inventoryCount: Count of active (published) listings
 * - totalSales: Count of sold listings
 * - responseTime: Average minutes to first response (via messaging)
 * - responseRate: % of inquiries responded to (via messaging)
 */

import { db } from '../../../dbclient';
import { carListing } from '../../../schema/listing';
import { conversation } from '../../../schema/messaging';
import { eq, and, count, sql, gt, isNotNull } from 'drizzle-orm';

export interface PartnerStats {
  inventoryCount: number;
  totalSales: number;
  responseTime: number | null;
  responseRate: number | null;
}

export async function calculatePartnerStats(partnerId: string): Promise<PartnerStats> {
  try {
    const now = new Date();

    // 1. Inventory Count - Published listings
    const inventoryResult = await db
      .select({ count: count() })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.moderationStatus, 'approved'),
          eq(carListing.lifecycleStatus, 'active'),
          isNotNull(carListing.expiresAt),
          gt(carListing.expiresAt, now)
        )
      );

    const inventoryCount = inventoryResult[0]?.count ?? 0;

    // 2. Total Sales - Sold listings
    const salesResult = await db
      .select({ count: count() })
      .from(carListing)
      .where(
        and(
          eq(carListing.partnerId, partnerId),
          eq(carListing.lifecycleStatus, 'sold')
        )
      );

    const totalSales = salesResult[0]?.count ?? 0;

    // 3. Total inquiries (conversations with type='inquiry')
    const totalInquiriesResult = await db
      .select({ count: count() })
      .from(conversation)
      .where(
        and(
          eq(conversation.partnerId, partnerId),
          eq(conversation.type, 'inquiry')
        )
      );

    const totalInquiries = totalInquiriesResult[0]?.count ?? 0;

    // 4. Response Rate - % of inquiries with at least one message
    const respondedInquiriesResult = await db
      .select({ count: count() })
      .from(conversation)
      .where(
        and(
          eq(conversation.partnerId, partnerId),
          eq(conversation.type, 'inquiry'),
          sql`${conversation.messageCount} > 0`
        )
      );

    const respondedInquiries = respondedInquiriesResult[0]?.count ?? 0;
    const responseRate = totalInquiries > 0
      ? Math.round((respondedInquiries / totalInquiries) * 100)
      : null;

    // 5. Response Time - Average time to first message in inquiry conversations
    // Calculate: first message timestamp - conversation created timestamp
    const responseTimeResult = await db
      .select({
        avgMinutes: sql<number>`AVG(EXTRACT(EPOCH FROM (
          (SELECT MIN(created_at) FROM message WHERE conversation_id = ${conversation.id})
          - ${conversation.createdAt}
        )) / 60)`,
      })
      .from(conversation)
      .where(
        and(
          eq(conversation.partnerId, partnerId),
          eq(conversation.type, 'inquiry'),
          sql`${conversation.messageCount} > 0`
        )
      );

    const responseTime = responseTimeResult[0]?.avgMinutes 
      ? Math.round(Number(responseTimeResult[0].avgMinutes)) 
      : null;

    return {
      inventoryCount,
      totalSales,
      responseTime,
      responseRate,
    };
  } catch (error) {
    console.error('[calculatePartnerStats] Error:', error);
    throw error;
  }
}
