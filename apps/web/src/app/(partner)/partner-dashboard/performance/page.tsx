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
  DollarSign,
  ShoppingBag,
  Activity,
  BarChart3,
  ThumbsUp,
  Target,
  Timer,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  RevenueBreakdownChart,
  RatingRadialChart,
  EngagementBarChart,
  QualityMetricsBarChart,
  OperationalRadialChart
} from "@/components/dashboard-components/performance-charts";

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

  // Prepare chart data
  const ratingData = [
    { name: 'Rating', value: (partner.platformRating ?? 0) * 20, fill: '#f59e0b' }
  ];

  const qualityMetricsData = [
    { name: 'Communication', value: partner.communicationRating ?? 0, max: 5, fill: '#3b82f6' },
    { name: 'Service', value: partner.serviceRating ?? 0, max: 5, fill: '#10b981' },
    { name: 'Value', value: partner.valueRating ?? 0, max: 5, fill: '#a855f7' },
  ];

  const operationalData = [
    { name: 'Completion', value: partner.completionRate ?? 0, fill: '#14b8a6' },
    { name: 'On-Time', value: partner.onTimeDeliveryRate ?? 0, fill: '#3b82f6' },
    { name: 'Response', value: partner.responseRate ?? 0, fill: '#a855f7' },
  ];

  const engagementData = [
    { name: 'Views', value: partner.monthlyViews ?? 0, color: '#0ea5e9' },
    { name: 'Profile', value: partner.profileViews ?? 0, color: '#8b5cf6' },
    { name: 'Inquiries', value: partner.inquiryCount ?? 0, color: '#ec4899' },
    { name: 'Listings', value: partner.listingViews ?? 0, color: '#06b6d4' },
  ];

  const revenueBreakdown = [
    { name: 'Monthly', value: (partner.monthlyRevenue ?? 0) / 100, fill: '#f97316' },
    { name: 'Remaining', value: Math.max(0, ((partner.totalRevenue ?? 0) - (partner.monthlyRevenue ?? 0)) / 100), fill: '#e5e7eb' },
  ];

  return (
    <DashboardDisplayArea>
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Performance Overview</h1>
          <p className="text-muted-foreground">Track your key metrics and business insights</p>
        </div>

        {/* Top Level KPI Cards with Trend Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group p-6 rounded-xl border border-border/40 bg-gradient-to-br from-emerald-500/5 to-transparent hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(partner.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </div>
          </div>

          <div className="group p-6 rounded-xl border border-border/40 bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +0.2
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Platform Rating</p>
              <p className="text-2xl font-semibold tracking-tight">{partner.platformRating?.toFixed(1) ?? 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{partner.totalReviews ?? 0} reviews</p>
            </div>
          </div>

          <div className="group p-6 rounded-xl border border-border/40 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +5
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-semibold tracking-tight">{partner.activeListings ?? 0}</p>
              <p className="text-xs text-muted-foreground">{partner.soldListings ?? 0} sold</p>
            </div>
          </div>

          <div className="group p-6 rounded-xl border border-border/40 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-purple-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +3%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-semibold tracking-tight">{formatPercentage(partner.responseRate)}</p>
              <p className="text-xs text-muted-foreground">Avg {partner.avgResponseTime ?? 0} min</p>
            </div>
          </div>
        </div>

        {/* Sales & Revenue Section with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown Chart */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-border/40 bg-card/50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Sales & Revenue</h2>
                <p className="text-sm text-muted-foreground mt-1">Financial performance metrics</p>
              </div>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Monthly Sales
                </div>
                <div className="text-2xl font-semibold">{partner.monthlySales ?? 0}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(partner.monthlyRevenue)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Avg Transaction
                </div>
                <div className="text-2xl font-semibold">{formatCurrency(partner.avgTransactionValue)}</div>
                <div className="text-xs text-muted-foreground">Per sale</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  Commission
                </div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.commissionRate)}</div>
                <div className="text-xs text-muted-foreground">Platform fee</div>
              </div>
            </div>

            <RevenueBreakdownChart data={revenueBreakdown} />
          </div>

          {/* Rating Radial Chart */}
          <div className="p-6 rounded-xl border border-border/40 bg-gradient-to-br from-amber-500/5 to-transparent space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Overall Rating</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-semibold">{partner.platformRating?.toFixed(1) ?? '0.0'}</span>
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            <RatingRadialChart data={ratingData} />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">{partner.totalReviews ?? 0} total reviews</p>
            </div>
          </div>
        </div>

        {/* Engagement & Traffic with Bar Chart */}
        <div className="p-6 rounded-xl border border-border/40 bg-card/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Engagement & Traffic</h2>
              <p className="text-sm text-muted-foreground mt-1">Customer interest and visibility</p>
            </div>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {engagementData.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }} />
                  {metric.name}
                </div>
                <div className="text-2xl font-semibold">{formatNumber(metric.value)}</div>
              </div>
            ))}
          </div>

          <EngagementBarChart data={engagementData} />
        </div>

        {/* Quality Metrics with Visual Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quality Ratings */}
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Quality Ratings</h2>
                <p className="text-sm text-muted-foreground mt-1">Customer satisfaction breakdown</p>
              </div>
              <ThumbsUp className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-6">
              {qualityMetricsData.map((metric) => (
                <div key={metric.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm font-semibold tabular-nums">{metric.value.toFixed(1)}/5</span>
                  </div>
                  <div className="relative h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${(metric.value / metric.max) * 100}%`,
                        backgroundColor: metric.fill
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <QualityMetricsBarChart data={qualityMetricsData} />
          </div>

          {/* Performance Scores */}
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Performance Scores</h2>
                <p className="text-sm text-muted-foreground mt-1">Business efficiency metrics</p>
              </div>
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Satisfaction Score</p>
                    <p className="text-xs text-muted-foreground">Customer happiness</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">{partner.customerSatisfaction ?? 0}</p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lead Conversion</p>
                    <p className="text-xs text-muted-foreground">Inquiry to sale</p>
                  </div>
                </div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.leadConversionRate)}</div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Repeat Customers</p>
                    <p className="text-xs text-muted-foreground">Returning buyers</p>
                  </div>
                </div>
                <div className="text-2xl font-semibold">{formatPercentage(partner.repeatCustomerRate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Metrics with Radial Chart */}
        <div className="p-6 rounded-xl border border-border/40 bg-card/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Operational Efficiency</h2>
              <p className="text-sm text-muted-foreground mt-1">Service delivery and compliance</p>
            </div>
            <Timer className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {operationalData.map((metric, index) => (
                <div key={metric.name} className="p-4 rounded-lg border border-border/40 bg-card/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{metric.name} Rate</span>
                    <span className="text-xl font-semibold">{formatPercentage(metric.value)}</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${metric.value}%`,
                        backgroundColor: metric.fill
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center">
              <OperationalRadialChart data={operationalData} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-rose-500/10">
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cancellation</p>
                <p className="text-lg font-semibold">{formatPercentage(partner.cancellationRate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <Timer className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Deal Time</p>
                <p className="text-lg font-semibold">{partner.avgDealCompletionTime ?? 0} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
