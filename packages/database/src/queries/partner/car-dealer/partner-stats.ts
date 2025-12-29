/**
 * Partner Stats Calculation Query
 * 
 * Calculates dynamic metrics with memory cache (5min TTL)
 * - inventoryCount: Count of active (published) listings
 * - totalSales: Count of sold listings
 * - responseTime: Average minutes to first response (via messaging)
 * - responseRate: % of inquiries responded to (via messaging)
 * 
 * Performance optimizations:
 * - Memory cache with 5min TTL (expensive aggregation queries)
 * - Combined listing stats into single query (2 counts in 1 query)
 * - Combined conversation stats into single query (counts + avg in 1 query)
 * - Reduced from 5 DB calls to 2 DB calls
 */

import { db } from '../../../dbclient';
import { memoryCache, CacheKeys, CacheTTL } from '../../../caches/memory-cache';
import { carListing } from '../../../schema/listing';
import { conversation } from '../../../schema/messaging';
import { eq, and, sql, gt, isNotNull } from 'drizzle-orm';

export interface PartnerStats {
  inventoryCount: number;
  totalSales: number;
  responseTime: number | null;
  responseRate: number | null;
}

/**
 * Get partner stats with caching
 * Cached for 5 minutes to reduce expensive aggregation queries
 */
export async function calculatePartnerStats(partnerId: string): Promise<PartnerStats> {
  const cacheKey = CacheKeys.partnerStats(partnerId);
  
  // Check cache first
  const cached = memoryCache.get<PartnerStats>(cacheKey);
  if (cached) {
    console.log(`[calculatePartnerStats] Cache HIT for ${partnerId.slice(0, 8)}...`);
    return cached;
  }

  const queryStart = performance.now();
  
  try {
    const now = new Date();

    // QUERY 1: Listing stats - inventory + sales in single query
    // Uses conditional aggregation to get both counts in one query
    const listingStats = await db
      .select({
        inventoryCount: sql<number>`COUNT(*) FILTER (WHERE 
          ${carListing.moderationStatus} = 'approved' 
          AND ${carListing.lifecycleStatus} = 'active' 
          AND ${carListing.expiresAt} IS NOT NULL 
          AND ${carListing.expiresAt} > ${now}
        )`.as('inventory_count'),
        totalSales: sql<number>`COUNT(*) FILTER (WHERE 
          ${carListing.lifecycleStatus} = 'sold'
        )`.as('total_sales'),
      })
      .from(carListing)
      .where(eq(carListing.partnerId, partnerId));

    const inventoryCount = Number(listingStats[0]?.inventoryCount ?? 0);
    const totalSales = Number(listingStats[0]?.totalSales ?? 0);

    // QUERY 2: Conversation stats - total, responded, and avg response time in single query
    // Combines all conversation-based metrics
    const conversationStats = await db
      .select({
        totalInquiries: sql<number>`COUNT(*) FILTER (WHERE 
          ${conversation.type} = 'inquiry'
        )`.as('total_inquiries'),
        respondedInquiries: sql<number>`COUNT(*) FILTER (WHERE 
          ${conversation.type} = 'inquiry' 
          AND ${conversation.messageCount} > 0
        )`.as('responded_inquiries'),
        avgResponseMinutes: sql<number>`AVG(
          CASE WHEN ${conversation.type} = 'inquiry' AND ${conversation.messageCount} > 0 THEN
            EXTRACT(EPOCH FROM (
              (SELECT MIN(created_at) FROM message WHERE conversation_id = ${conversation.id})
              - ${conversation.createdAt}
            )) / 60
          END
        )`.as('avg_response_minutes'),
      })
      .from(conversation)
      .where(eq(conversation.partnerId, partnerId));

    const totalInquiries = Number(conversationStats[0]?.totalInquiries ?? 0);
    const respondedInquiries = Number(conversationStats[0]?.respondedInquiries ?? 0);
    
    const responseRate = totalInquiries > 0
      ? Math.round((respondedInquiries / totalInquiries) * 100)
      : null;
    
    const responseTime = conversationStats[0]?.avgResponseMinutes 
      ? Math.round(Number(conversationStats[0].avgResponseMinutes)) 
      : null;

    const stats: PartnerStats = {
      inventoryCount,
      totalSales,
      responseTime,
      responseRate,
    };

    const queryTime = performance.now() - queryStart;
    console.log(`[calculatePartnerStats] Cache MISS for ${partnerId.slice(0, 8)}... - DB query: ${queryTime.toFixed(2)}ms (2 queries)`);

    // Store in cache (5min TTL)
    memoryCache.set(cacheKey, stats, CacheTTL.partnerStats);

    return stats;
  } catch (error) {
    console.error('[calculatePartnerStats] Error:', error);
    throw error;
  }
}
