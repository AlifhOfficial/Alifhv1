import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PartnerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole("admin");

  const [partner] = await db
    .select()
    .from(schema.partner)
    .where(eq(schema.partner.id, params.id))
    .limit(1);

  if (!partner) {
    notFound();
  }

  // Fetch staff members
  const staff = await db
    .select({
      id: schema.partnerStaff.id,
      userId: schema.partnerStaff.userId,
      role: schema.partnerStaff.role,
      title: schema.partnerStaff.title,
      status: schema.partnerStaff.status,
      isPrimaryContact: schema.partnerStaff.isPrimaryContact,
      leadsHandled: schema.partnerStaff.leadsHandled,
      dealsClosed: schema.partnerStaff.dealsClosed,
      user: {
        name: schema.user.name,
        email: schema.user.email,
      },
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.user, eq(schema.partnerStaff.userId, schema.user.id))
    .where(eq(schema.partnerStaff.partnerId, params.id));

  // Fetch reviews
  const reviews = await db
    .select({
      id: schema.partnerReview.id,
      rating: schema.partnerReview.rating,
      title: schema.partnerReview.title,
      review: schema.partnerReview.review,
      status: schema.partnerReview.status,
      createdAt: schema.partnerReview.createdAt,
      user: {
        name: schema.user.name,
      },
    })
    .from(schema.partnerReview)
    .leftJoin(schema.user, eq(schema.partnerReview.userId, schema.user.id))
    .where(eq(schema.partnerReview.partnerId, params.id))
    .limit(10);

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
      description={partner.companyNameLegal !== partner.brandName ? partner.companyNameLegal : undefined}
    >
      <div className="p-6 md:p-10 space-y-12">
        {/* Status & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
              partner.status === 'active' ? 'bg-green-100 text-green-800' :
              partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {partner.status}
            </span>
            {partner.isVerified && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                ✓ Verified
              </span>
            )}
            {partner.tier && (
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                partner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                partner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                partner.tier === 'black' ? 'bg-gray-900 text-white' :
                'bg-gray-100 text-gray-800'
              }`}>
                {partner.tier.toUpperCase()} TIER
              </span>
            )}
          </div>

          <Link
            href="/admin-dashboard/partners"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Partners
          </Link>
        </div>

        {/* Company Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Company Information</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Legal Name</label>
              <div className="text-sm text-foreground">{partner.companyNameLegal || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Brand Name</label>
              <div className="text-sm text-foreground">{partner.brandName || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Trade License</label>
              <div className="text-sm text-foreground">{partner.tradeLicense || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">License Expiry</label>
              <div className="text-sm text-foreground">
                {partner.tradeLicenseExpiry ? new Date(partner.tradeLicenseExpiry).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Email</label>
              <div className="text-sm text-foreground">{partner.email || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Phone</label>
              <div className="text-sm text-foreground">{partner.phone || 'N/A'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Website</label>
              <div className="text-sm text-foreground">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {partner.website}
                  </a>
                ) : (
                  'N/A'
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Emirate</label>
              <div className="text-sm text-foreground">{partner.emirate || 'N/A'}</div>
            </div>
          </div>

          {partner.description && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <div className="text-sm text-foreground">{partner.description}</div>
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Performance Metrics */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-foreground">Performance Metrics</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Platform Rating</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.platformRating ? `⭐ ${partner.platformRating.toFixed(1)}` : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.platformReviewCount ?? 0} reviews
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Inventory</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.totalInventory ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.activeListings ?? 0} active
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Sales</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.totalSales ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(partner.totalRevenue)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Response Rate</div>
              <div className="text-2xl font-semibold text-foreground">
                {formatPercentage(partner.responseRate)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.avgResponseTime ?? 0} min avg
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Lead Conversion</div>
              <div className="text-2xl font-semibold text-foreground">
                {formatPercentage(partner.leadConversionRate)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Customer Satisfaction</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.customerSatisfaction ?? 0}/100
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Monthly Revenue</div>
              <div className="text-2xl font-semibold text-foreground">
                {formatCurrency(partner.monthlyRevenue)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Monthly Leads</div>
              <div className="text-2xl font-semibold text-foreground">
                {partner.monthlyLeads ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {partner.monthlySales ?? 0} conversions
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Staff Members */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-foreground">Staff Members</h2>
            <div className="text-sm text-muted-foreground">
              {staff.length} member{staff.length !== 1 ? 's' : ''}
            </div>
          </div>

          {staff.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {member.user?.name || 'N/A'}
                        </span>
                        {member.isPrimaryContact && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Primary Contact
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {member.title || member.role} • {member.user?.email}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Leads Handled: </span>
                          <span className="text-foreground font-medium">{member.leadsHandled ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deals Closed: </span>
                          <span className="text-foreground font-medium">{member.dealsClosed ?? 0}</span>
                        </div>
                      </div>
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
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
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
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      review.status === 'published' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  {review.title && (
                    <div className="text-sm font-medium text-foreground mb-2">{review.title}</div>
                  )}
                  {review.review && (
                    <div className="text-sm text-muted-foreground">{review.review}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
