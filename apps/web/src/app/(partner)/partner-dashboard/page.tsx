import { requireAuth } from "@/lib/auth/roles";
import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { QuickActions } from "./quick-actions";

export default async function PartnerDashboard() {
  // Get authenticated user
  const user = await requireAuth();

  // Fetch partner membership with full partner details
  const membership = await db
    .select({
      staffId: schema.partnerStaff.id,
      role: schema.partnerStaff.role,
      partnerId: schema.partnerStaff.partnerId,
      partner: schema.partner,
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.partner, eq(schema.partnerStaff.partnerId, schema.partner.id))
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1)
    .execute();

  // Check if user has active partner membership
  if (membership.length === 0) {
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      redirect('/access-denied?reason=not-partner-member');
    }
  }

  const staffData = membership[0];
  const partner = staffData?.partner;

  if (!partner) {
    redirect('/access-denied?reason=no-partner-data');
  }

  // Fetch team members
  const teamMembers = await db
    .select({
      id: schema.partnerStaff.id,
      role: schema.partnerStaff.role,
      title: schema.partnerStaff.title,
      status: schema.partnerStaff.status,
      leadsHandled: schema.partnerStaff.leadsHandled,
      dealsClosed: schema.partnerStaff.dealsClosed,
      user: {
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.user, eq(schema.partnerStaff.userId, schema.user.id))
    .where(eq(schema.partnerStaff.partnerId, partner.id))
    .limit(10);

  // Fetch recent reviews
  const recentReviews = await db
    .select({
      id: schema.partnerReview.id,
      rating: schema.partnerReview.rating,
      title: schema.partnerReview.title,
      review: schema.partnerReview.review,
      createdAt: schema.partnerReview.createdAt,
      user: {
        name: schema.user.name,
      },
    })
    .from(schema.partnerReview)
    .leftJoin(schema.user, eq(schema.partnerReview.userId, schema.user.id))
    .where(eq(schema.partnerReview.partnerId, partner.id))
    .orderBy(desc(schema.partnerReview.createdAt))
    .limit(5);

  // Helper functions
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
      title={partner.brandName || partner.companyNameLegal}
      description="Welcome to your partner dashboard"
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Quick Actions Section */}
        <QuickActions partner={partner} />

        <div className="border-t border-border/60" />

        {/* Status Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              partner.status === 'active' ? 'bg-green-100 text-green-800' :
              partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {partner.status}
            </span>
            {partner.isVerified && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                ✓ Verified Dealer
              </span>
            )}
            {partner.tier && (
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                partner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                partner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                partner.tier === 'black' ? 'bg-gray-900 text-white' :
                'bg-gray-100 text-gray-800'
              }`}>
                {partner.tier.toUpperCase()}
              </span>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Member since {new Date(partner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Performance Overview</h2>
            <div className="flex items-center gap-2">
              {partner.platformRating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">⭐</span>
                  <span className="text-sm font-medium text-foreground">{partner.platformRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({partner.platformReviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Inventory */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Inventory</div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {partner.totalInventory ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {partner.activeListings ?? 0} active • {partner.soldListings ?? 0} sold
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">This Month</div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {partner.monthlySales ?? 0} sales
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(partner.monthlyRevenue)}
              </div>
            </div>

            {/* Leads & Conversion */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Leads</div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {partner.monthlyLeads ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(partner.leadConversionRate)} conversion
              </div>
            </div>

            {/* Response Rate */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Response</div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {formatPercentage(partner.responseRate)}
              </div>
              <div className="text-xs text-muted-foreground">
                {partner.avgResponseTime ?? 0} min avg
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Business Insights */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Business Insights</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-3">Total Revenue</div>
              <div className="text-3xl font-semibold text-foreground mb-2">
                {formatCurrency(partner.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg deal: {formatCurrency(partner.avgDealValue)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-3">Customer Satisfaction</div>
              <div className="text-3xl font-semibold text-foreground mb-2">
                {partner.customerSatisfaction ?? 0}/100
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPercentage(partner.repeatCustomerRate)} repeat rate
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-3">Monthly Views</div>
              <div className="text-3xl font-semibold text-foreground mb-2">
                {(partner.monthlyViews ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Listings exposure
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Team Overview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Team</h2>
            <div className="text-sm text-muted-foreground">
              {partner.activeStaffCount ?? 0} active members
            </div>
          </div>

          {teamMembers.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No team members found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teamMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {member.user?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.title || member.role}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Leads: </span>
                      <span className="text-foreground font-medium">{member.leadsHandled ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deals: </span>
                      <span className="text-foreground font-medium">{member.dealsClosed ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Recent Reviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Recent Reviews</h2>
            <div className="text-sm text-muted-foreground">
              {partner.platformReviewCount ?? 0} total
            </div>
          </div>

          {recentReviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {review.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-yellow-600">
                          {'⭐'.repeat(review.rating ?? 0)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <div className="text-sm font-medium text-foreground mb-2">
                      {review.title}
                    </div>
                  )}

                  {review.review && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {review.review}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features & Services */}
        {partner.features && Object.values(partner.features).some(v => v) && (
          <>
            <div className="border-t border-border/60" />
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-foreground">Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {partner.features.homeDelivery && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    🚚 Home Delivery
                  </span>
                )}
                {partner.features.testDriveAvailable && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    🚗 Test Drive
                  </span>
                )}
                {partner.features.financing && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    💳 Financing
                  </span>
                )}
                {partner.features.tradeIn && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    🔄 Trade-In
                  </span>
                )}
                {partner.features.warranty && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    ✓ Warranty
                  </span>
                )}
                {partner.features.insurance && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    🛡️ Insurance
                  </span>
                )}
                {partner.features.registration && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    📋 Registration
                  </span>
                )}
                {partner.features.exportAssistance && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full">
                    ✈️ Export Assistance
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardDisplayArea>
  );
}
