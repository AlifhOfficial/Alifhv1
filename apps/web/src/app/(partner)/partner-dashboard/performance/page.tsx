import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function PartnerPerformancePage() {
  const user = await requireAuth();

  // Fetch partner data
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
    })
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  if (membership.length === 0) {
    redirect('/partner-dashboard');
  }

  const partnerId = membership[0].partnerId;

  // Fetch partner details
  const [partner] = await db
    .select()
    .from(schema.partner)
    .where(eq(schema.partner.id, partnerId))
    .limit(1);

  if (!partner) {
    redirect('/partner-dashboard');
  }

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'AED 0';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatPercentage = (value: number | null) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  return (
    <DashboardDisplayArea
      title="Performance Analytics"
      description="Track your dealership's key performance indicators"
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Overview Metrics */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Overview</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Platform Rating</div>
              <div className="text-2xl font-semibold text-foreground">
                ⭐ {partner.platformRating?.toFixed(1) ?? 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.totalReviews ?? 0} reviews
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
              <div className="text-2xl font-semibold text-foreground">
                {formatCurrency(partner.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                All time earnings
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Active Listings</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.activeListings ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.soldListings ?? 0} sold
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Response Rate</div>
              <div className="text-2xl font-semibold text-foreground">
                {formatPercentage(partner.responseRate)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {partner.avgResponseTime ?? 0} min
              </div>
            </div>
          </div>
        </div>

        {/* Sales & Revenue */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Sales & Revenue</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">This Month</div>
              <div className="text-xl font-semibold text-foreground mb-1">
                {partner.monthlySales ?? 0} sales
              </div>
              <div className="text-sm text-foreground">
                {formatCurrency(partner.monthlyRevenue)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Avg Transaction</div>
              <div className="text-xl font-semibold text-foreground">
                {formatCurrency(partner.avgTransactionValue)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Commission Rate</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.commissionRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Customer Metrics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Satisfaction Score</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.customerSatisfaction ?? 0}/100
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on customer feedback
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Lead Conversion</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.leadConversionRate)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Leads to sales
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Repeat Customers</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.repeatCustomerRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Engagement</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Monthly Views</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.monthlyViews?.toLocaleString() ?? 0}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Profile Views</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.profileViews?.toLocaleString() ?? 0}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Inquiries</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.inquiryCount ?? 0}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Listing Views</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.listingViews?.toLocaleString() ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Quality Metrics</h2>
          <div className="space-y-4">
            {/* Communication Quality */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Communication Quality</div>
                  <div className="text-xs text-muted-foreground">
                    {partner.communicationRating?.toFixed(1) ?? 0}/5.0
                  </div>
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {partner.communicationRating ? `⭐ ${partner.communicationRating.toFixed(1)}` : 'N/A'}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${((partner.communicationRating ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Service Quality */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Service Quality</div>
                  <div className="text-xs text-muted-foreground">
                    {partner.serviceRating?.toFixed(1) ?? 0}/5.0
                  </div>
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {partner.serviceRating ? `⭐ ${partner.serviceRating.toFixed(1)}` : 'N/A'}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${((partner.serviceRating ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Value Rating */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Value for Money</div>
                  <div className="text-xs text-muted-foreground">
                    {partner.valueRating?.toFixed(1) ?? 0}/5.0
                  </div>
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {partner.valueRating ? `⭐ ${partner.valueRating.toFixed(1)}` : 'N/A'}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${((partner.valueRating ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-6">Additional Metrics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Completion Rate</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.completionRate)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Successfully completed deals
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">On-Time Delivery</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.onTimeDeliveryRate)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Cancellation Rate</div>
              <div className="text-xl font-semibold text-foreground">
                {formatPercentage(partner.cancellationRate)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Avg Deal Time</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.avgDealCompletionTime ?? 0} days
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Compliance Score</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.complianceScore ?? 0}/100
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Quality Score</div>
              <div className="text-xl font-semibold text-foreground">
                {partner.qualityScore ?? 0}/100
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
