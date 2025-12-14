import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { desc, count, sql } from "drizzle-orm";
import Link from "next/link";

export default async function PartnersPage() {
  const user = await requireRole("admin");

  // Fetch partners with staff count
  const partners = await db
    .select({
      id: schema.partner.id,
      brandName: schema.partner.brandName,
      companyNameLegal: schema.partner.companyNameLegal,
      email: schema.partner.email,
      phone: schema.partner.phone,
      status: schema.partner.status,
      tier: schema.partner.tier,
      isVerified: schema.partner.isVerified,
      emirate: schema.partner.emirate,
      platformRating: schema.partner.platformRating,
      platformReviewCount: schema.partner.platformReviewCount,
      activeListings: schema.partner.activeListings,
      totalSales: schema.partner.totalSales,
      monthlyRevenue: schema.partner.monthlyRevenue,
      activeStaffCount: schema.partner.activeStaffCount,
      createdAt: schema.partner.createdAt,
    })
    .from(schema.partner)
    .orderBy(desc(schema.partner.createdAt))
    .limit(50);

  const formatCurrency = (cents: number | null) => {
    if (!cents) return 'AED 0';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <DashboardDisplayArea
      title="Partners"
      description="Manage dealer partners and their accounts"
    >
      <div className="p-6 md:p-10">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {partners.filter(p => p.status === 'active').length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Active Partners</div>
              <div className="text-2xl font-semibold text-foreground">
                {partners.filter(p => p.status === 'active').length}
              </div>
            </div>
          )}
          
          {partners.filter(p => p.isVerified).length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Verified Partners</div>
              <div className="text-2xl font-semibold text-foreground">
                {partners.filter(p => p.isVerified).length}
              </div>
            </div>
          )}
          
          {partners.reduce((sum, p) => sum + (p.activeListings ?? 0), 0) > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Listings</div>
              <div className="text-2xl font-semibold text-foreground">
                {partners.reduce((sum, p) => sum + (p.activeListings ?? 0), 0)}
              </div>
            </div>
          )}
          
          {partners.reduce((sum, p) => sum + (p.totalSales ?? 0), 0) > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Sales</div>
              <div className="text-2xl font-semibold text-foreground">
                {partners.reduce((sum, p) => sum + (p.totalSales ?? 0), 0)}
              </div>
            </div>
          )}
        </div>

        {/* Partners List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">All Partners</h2>
            <div className="text-sm text-muted-foreground">{partners.length} partners</div>
          </div>

          {partners.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">No partners found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  href={`/admin-dashboard/partners/${partner.id}`}
                  className="block bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-foreground">
                          {partner.brandName || partner.companyNameLegal}
                        </h3>
                        {partner.isVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          partner.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {partner.status}
                        </span>
                        {partner.tier && (
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            partner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            partner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            partner.tier === 'black' ? 'bg-gray-900 text-white' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {partner.tier}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Emirate</div>
                          <div className="text-sm text-foreground mt-1">{partner.emirate || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                          <div className="text-sm text-foreground mt-1">
                            {partner.platformRating ? 
                              `⭐ ${partner.platformRating.toFixed(1)} (${partner.platformReviewCount})` : 
                              'No reviews'
                            }
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Active Listings</div>
                          <div className="text-sm text-foreground mt-1">{partner.activeListings ?? 0}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Staff</div>
                          <div className="text-sm text-foreground mt-1">{partner.activeStaffCount ?? 0}</div>
                        </div>
                      </div>

                      {(partner.totalSales || partner.monthlyRevenue) && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/60">
                          {partner.totalSales && partner.totalSales > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground">Total Sales</div>
                              <div className="text-sm text-foreground mt-1">{partner.totalSales}</div>
                            </div>
                          )}
                          
                          {partner.monthlyRevenue && partner.monthlyRevenue > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                              <div className="text-sm text-foreground mt-1">
                                {formatCurrency(partner.monthlyRevenue)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground ml-4">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
