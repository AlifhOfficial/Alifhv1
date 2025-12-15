import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { 
  TrendingUp, 
  Star, 
  Users, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Activity,
  BarChart3,
  ThumbsUp,
  Target,
  Timer
} from "lucide-react";

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

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  return (
    <DashboardDisplayArea>
      <div className="max-w-5xl mx-auto px-8 py-12 space-y-12">
        
        {/* Top Level KPI Cards - Minimalist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Total Revenue
            </div>
            <div className="text-2xl font-semibold tracking-tight">{formatCurrency(partner.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">All time earnings</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Platform Rating
            </div>
            <div className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              {partner.platformRating?.toFixed(1) ?? 'N/A'}
              <Star className="w-4 h-4 fill-foreground text-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">{partner.totalReviews ?? 0} reviews</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Active Listings
            </div>
            <div className="text-2xl font-semibold tracking-tight">{partner.activeListings ?? 0}</div>
            <div className="text-xs text-muted-foreground">{partner.soldListings ?? 0} sold</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Response Rate
            </div>
            <div className="text-2xl font-semibold tracking-tight">{formatPercentage(partner.responseRate)}</div>
            <div className="text-xs text-muted-foreground">Avg {partner.avgResponseTime ?? 0} min</div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Sales & Revenue Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Sales & Revenue</h2>
              <p className="text-sm text-muted-foreground mt-1">Financial performance metrics</p>
            </div>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Monthly Sales</span>
                <div className="p-2 rounded-md bg-orange-500/10">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{partner.monthlySales ?? 0}</div>
                <div className="text-sm text-muted-foreground mt-1">{formatCurrency(partner.monthlyRevenue)} revenue</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Avg Transaction</span>
                <div className="p-2 rounded-md bg-emerald-500/10">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{formatCurrency(partner.avgTransactionValue)}</div>
                <div className="text-sm text-muted-foreground mt-1">Per sale average</div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Commission Rate</span>
                <div className="p-2 rounded-md bg-indigo-500/10">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.commissionRate)}</div>
                <div className="text-sm text-muted-foreground mt-1">Platform fee</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Engagement & Traffic */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Engagement</h2>
              <p className="text-sm text-muted-foreground mt-1">Traffic and customer interest</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-sky-500/10">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                </div>
                Monthly Views
              </div>
              <div className="text-xl font-medium">{formatNumber(partner.monthlyViews)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-violet-500/10">
                  <Users className="w-3.5 h-3.5 text-violet-600" />
                </div>
                Profile Views
              </div>
              <div className="text-xl font-medium">{formatNumber(partner.profileViews)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-pink-500/10">
                  <MessageSquare className="w-3.5 h-3.5 text-pink-600" />
                </div>
                Inquiries
              </div>
              <div className="text-xl font-medium">{formatNumber(partner.inquiryCount)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-cyan-500/10">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                Listing Views
              </div>
              <div className="text-xl font-medium">{formatNumber(partner.listingViews)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Quality & Satisfaction */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Quality Metrics</h2>
              <p className="text-sm text-muted-foreground mt-1">Customer satisfaction ratings</p>
            </div>
            <ThumbsUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Communication', value: partner.communicationRating, color: 'bg-blue-500' },
              { label: 'Service Quality', value: partner.serviceRating, color: 'bg-emerald-500' },
              { label: 'Value for Money', value: partner.valueRating, color: 'bg-purple-500' },
            ].map((metric) => (
              <div key={metric.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-sm font-semibold">{metric.value?.toFixed(1) ?? '0.0'}</span>
                </div>
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${metric.color} transition-all duration-500`}
                    style={{ width: `${((metric.value ?? 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/40">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Satisfaction Score</div>
                <div className="text-2xl font-semibold">{partner.customerSatisfaction ?? 0}<span className="text-sm text-muted-foreground font-normal">/100</span></div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/40">
              <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Lead Conversion</div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.leadConversionRate)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/40">
              <div className="p-2 rounded-full bg-purple-500/10 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Repeat Customers</div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.repeatCustomerRate)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 my-12" />

        {/* Operational Metrics */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Operational</h2>
              <p className="text-sm text-muted-foreground mt-1">Efficiency and compliance</p>
            </div>
            <Timer className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-teal-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                </div>
                Completion Rate
              </div>
              <div className="text-lg font-medium">{formatPercentage(partner.completionRate)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                On-Time Delivery
              </div>
              <div className="text-lg font-medium">{formatPercentage(partner.onTimeDeliveryRate)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-rose-500/10">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                </div>
                Cancellation Rate
              </div>
              <div className="text-lg font-medium">{formatPercentage(partner.cancellationRate)}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-amber-500/10">
                  <Timer className="w-3.5 h-3.5 text-amber-600" />
                </div>
                Avg Deal Time
              </div>
              <div className="text-lg font-medium">{partner.avgDealCompletionTime ?? 0} days</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
