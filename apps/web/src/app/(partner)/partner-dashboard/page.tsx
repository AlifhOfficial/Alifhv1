import { requireAuth } from "@/lib/auth/roles";
import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { QuickActions } from "./quick-actions";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Heart, 
  Eye, 
  Star, 
  ShieldCheck, 
  Zap, 
  Car, 
  FileText, 
  CreditCard, 
  RefreshCw, 
  Globe,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

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
    <DashboardDisplayArea>
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{partner.brandName || partner.companyNameLegal}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${partner.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {partner.status === 'active' ? 'Active Partner' : partner.status}
              </span>
              {partner.isVerified && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Verified
                </span>
              )}
              <span>•</span>
              <span>Member since {new Date(partner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          
          {partner.platformRating && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              {partner.platformRating.toFixed(1)} Rating
              <span className="text-amber-600/60 dark:text-amber-500/60 font-normal">({partner.platformReviewCount})</span>
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Quick Actions Section */}
        <QuickActions partner={partner} />

        <div className="border-t border-border/60" />

        {/* Key Metrics Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">Key performance indicators</p>
            </div>
            <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Inventory */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                </div>
                Total Inventory
              </div>
              <div className="text-xl font-medium">{partner.totalInventory ?? 0}</div>
              <div className="text-xs text-muted-foreground">
                {partner.activeListings ?? 0} active • {partner.soldListings ?? 0} sold
              </div>
            </div>

            {/* Revenue */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-emerald-500/10">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                Monthly Revenue
              </div>
              <div className="text-xl font-medium">{formatCurrency(partner.monthlyRevenue)}</div>
              <div className="text-xs text-muted-foreground">
                {partner.monthlySales ?? 0} sales this month
              </div>
            </div>

            {/* Leads */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-violet-500/10">
                  <Users className="w-3.5 h-3.5 text-violet-600" />
                </div>
                Total Leads
              </div>
              <div className="text-xl font-medium">{partner.monthlyLeads ?? 0}</div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(partner.leadConversionRate)} conversion
              </div>
            </div>

            {/* Response */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-pink-500/10">
                  <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
                </div>
                Response Rate
              </div>
              <div className="text-xl font-medium">{formatPercentage(partner.responseRate)}</div>
              <div className="text-xs text-muted-foreground">
                {partner.avgResponseTime ?? 0} min avg
              </div>
            </div>
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-sky-500/10">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                </div>
                Monthly Views
              </div>
              <div className="text-xl font-medium">{(partner.monthlyViews ?? 0).toLocaleString()}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-rose-500/10">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                </div>
                Satisfaction
              </div>
              <div className="text-xl font-medium">{partner.customerSatisfaction ?? 0}/100</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-amber-500/10">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                </div>
                Repeat Rate
              </div>
              <div className="text-xl font-medium">{formatPercentage(partner.repeatCustomerRate)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-indigo-500/10">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                Avg Deal
              </div>
              <div className="text-xl font-medium">{formatCurrency(partner.avgDealValue)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Team Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">Team Members</h2>
                <p className="text-sm text-muted-foreground mt-1">{partner.activeStaffCount ?? 0} active staff</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">No team members found</div>
              ) : (
                teamMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {member.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{member.title || member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">{member.dealsClosed ?? 0} deals</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{member.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">Recent Reviews</h2>
                <p className="text-sm text-muted-foreground mt-1">Latest customer feedback</p>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {recentReviews.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">No reviews yet</div>
              ) : (
                recentReviews.map((review) => (
                  <div key={review.id} className="py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{review.review || 'No comment'}</p>
                    <div className="text-[10px] text-muted-foreground/60">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {partner.features && Object.values(partner.features).some(v => v) && (
          <>
            <div className="border-t border-border/60" />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-foreground">Services</h2>
                  <p className="text-sm text-muted-foreground mt-1">Active customer services</p>
                </div>
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'homeDelivery', label: 'Home Delivery', icon: Car },
                  { key: 'testDriveAvailable', label: 'Test Drive', icon: CheckCircle2 },
                  { key: 'financing', label: 'Financing', icon: CreditCard },
                  { key: 'tradeIn', label: 'Trade-In', icon: RefreshCw },
                  { key: 'warranty', label: 'Warranty', icon: ShieldCheck },
                  { key: 'insurance', label: 'Insurance', icon: FileText },
                  { key: 'registration', label: 'Registration', icon: FileText },
                  { key: 'exportAssistance', label: 'Export Help', icon: Globe },
                ].map((service) => {
                  // @ts-ignore
                  if (!partner.features?.[service.key]) return null;
                  const Icon = service.icon;
                  return (
                    <div key={service.key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{service.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardDisplayArea>
  );
}
