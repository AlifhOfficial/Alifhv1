/**
 * Get Partner Statistics
 * Analytics and performance metrics for dashboard
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partner } from '../../schema/partner';

/**
 * Get partner statistics for dashboard/analytics
 */
export async function getPartnerStats(partnerId: string) {
  const stats = await db.query.partner.findFirst({
    where: eq(partner.id, partnerId),
    columns: {
      totalInventory: true,
      activeListings: true,
      soldListings: true,
      totalSales: true,
      totalRevenue: true,
      avgDealValue: true,
      leadConversionRate: true,
      repeatCustomerRate: true,
      monthlyViews: true,
      monthlyLeads: true,
      monthlySales: true,
      monthlyRevenue: true,
      platformRating: true,
      platformReviewCount: true,
      customerSatisfaction: true,
      avgResponseTime: true,
      responseRate: true,
      teamSize: true,
      activeStaffCount: true,
    },
  });

  return stats;
}
