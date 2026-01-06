/**
 * Advanced Stats View - Partner Analytics Dashboard
 * 
 * Clean, minimal analytics with simple list-based visualizations.
 * Following "Less is More" principle with neutral colors.
 */

'use client';

import { useEffect, useState } from 'react';
import { DashboardDisplayArea } from '@/components/shared/layout/display-area';
import { TrendBadge, ProgressStat, TopListings, ColdListings } from './insight-components';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Heart, 
  Fuel,
  Car,
  Banknote,
  TrendingUp,
  Eye,
  Package,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface AdvancedStats {
  sales: {
    soldThisMonth: number;
    revenueThisMonth: number;
    avgDaysToSell: number | null;
    sellThroughRate: number;
    avgSoldPrice: number | null;
    totalSoldAllTime: number;
    revenueAllTime: number;
    fastestSale: number | null;
    slowestActiveListing: {
      id: string;
      title: string;
      daysSincePublished: number;
      thumbnail: string | null;
    } | null;
  };
  engagement: {
    totalViewsThisMonth: number;
    avgViewsPerListing: number;
    totalImpressions: number;
    totalFavorites: number;
    totalSuperlikes: number;
    viewToFavoriteRate: number;
    listingsWithVideo: number;
    avgQiScore: number | null;
    topViewedListings: Array<{
      id: string;
      title: string;
      viewCount: number;
      thumbnail: string | null;
    }>;
    coldListings: Array<{
      id: string;
      title: string;
      viewCount: number;
      daysSincePublished: number;
      thumbnail: string | null;
    }>;
  };
  bookings: {
    pendingBookings: number;
    confirmedBookings: number;
    completedThisMonth: number;
    noShowRate: number;
    bookingsThisWeek: number;
    cancellationRate: number;
  };
  trends: {
    listingsAddedThisMonth: number;
    listingsAddedLastMonth: number;
    listingsAddedDelta: number;
    viewsThisMonth: number;
    viewsLastMonth: number;
    viewsDelta: number;
    salesThisMonth: number;
    salesLastMonth: number;
    salesDelta: number;
    soldThisWeek: number;
    soldLastWeek: number;
    weekOverWeekSalesDelta: number;
  };
  composition: {
    byCondition: { condition: string; count: number }[];
    byBodyType: { bodyType: string; count: number }[];
    byMake: { make: string; count: number }[];
    byFuelType: { fuelType: string; count: number }[];
    priceRangeDistribution: { range: string; count: number; min: number; max: number }[];
    avgMileage: number | null;
    avgYear: number | null;
  };
  inventory: {
    activeCount: number;
    totalValue: number;
    avgPrice: number;
    staleCount: number;
    expiringCount: number;
    pendingApprovalCount: number;
    needsRemoderationCount: number;
    draftCount: number;
    reservedCount: number;
  };
  generatedAt: string;
}

// ============================================================================
// ============================================================================
// Solid Color Palette - macOS-like muted colors
// ============================================================================

const BAR_COLORS = [
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-violet-400',
  'bg-cyan-400',
];

// ============================================================================
// Loading Skeleton
// ============================================================================

function AdvancedStatsSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border/40 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Section Header Component
// ============================================================================

interface SectionHeaderProps {
  title: string;
  description?: string;
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-1 mb-5">
      <p className="text-sm font-medium text-foreground">
        {title}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ============================================================================
// Stat Card Component - Clean minimal design
// ============================================================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  iconColor?: string;
}

function StatCard({ icon: Icon, label, value, subtext, trend, iconColor = 'text-sidebar-foreground/70' }: StatCardProps) {
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <p className="text-sm text-sidebar-foreground/70">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-sidebar-foreground tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      {subtext && (
        <p className="text-sm text-sidebar-foreground/60">{subtext}</p>
      )}
    </div>
  );
}

// ============================================================================
// Simple List Chart Component - Replaces donut charts
// ============================================================================

interface SimpleListChartProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
}

function SimpleListChart({ data, title, icon: Icon }: SimpleListChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-sidebar-foreground/70" />
        <p className="text-sm font-medium text-sidebar-foreground">{title}</p>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground/80">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-sidebar-foreground tabular-nums">{item.value}</span>
                <span className="text-xs text-sidebar-foreground/50 tabular-nums">
                  {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Horizontal Bar Chart Component - Simplified
// ============================================================================

interface HorizontalBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
}

function HorizontalBarChartCard({ data, title, icon: Icon }: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-sidebar-foreground/70" />
        <p className="text-sm font-medium text-sidebar-foreground">{title}</p>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground/80 truncate max-w-[160px]">
                {item.name}
              </span>
              <span className="text-sm font-medium text-sidebar-foreground tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Vertical Bar Chart Component - Simplified to horizontal list
// ============================================================================

interface VerticalBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
}

function VerticalBarChartCard({ data, title, icon: Icon }: VerticalBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-sidebar-foreground/70" />
        <p className="text-sm font-medium text-sidebar-foreground">{title}</p>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground/80 truncate max-w-[140px]">
                {item.name}
              </span>
              <span className="text-sm font-medium text-sidebar-foreground tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Trend Comparison Component - Clean card design
// ============================================================================

interface TrendComparisonProps {
  title: string;
  metrics: Array<{
    label: string;
    current: number;
    previous: number;
    delta: number;
    format?: 'number' | 'currency';
  }>;
}

function TrendComparison({ title, metrics }: TrendComparisonProps) {
  return (
    <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-sidebar-foreground/70" />
        <p className="text-sm font-medium text-sidebar-foreground">{title}</p>
      </div>
      <div className="space-y-0 divide-y divide-sidebar-border">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <p className="text-sm text-sidebar-foreground/70">{metric.label}</p>
              <p className="text-xl font-semibold text-sidebar-foreground">
                {metric.format === 'currency' 
                  ? formatCurrency(metric.current)
                  : metric.current.toLocaleString()
                }
              </p>
            </div>
            <div className="text-right space-y-1">
              <TrendBadge value={metric.delta} />
              <p className="text-sm text-sidebar-foreground/60">
                vs {metric.format === 'currency' 
                  ? formatCurrency(metric.previous)
                  : metric.previous.toLocaleString()
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Booking Funnel Component - Clean card design
// ============================================================================

interface BookingFunnelProps {
  pending: number;
  confirmed: number;
  completed: number;
  noShowRate: number;
  cancellationRate: number;
}

function BookingFunnel({ pending, confirmed, completed, noShowRate, cancellationRate }: BookingFunnelProps) {
  return (
    <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-4 h-4 text-sidebar-foreground/70" />
        <p className="text-sm font-medium text-sidebar-foreground">Bookings</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center space-y-1">
          <p className="text-2xl font-semibold text-amber-500 tabular-nums">
            {pending}
          </p>
          <p className="text-sm text-sidebar-foreground/70">Pending</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-2xl font-semibold text-blue-500 tabular-nums">
            {confirmed}
          </p>
          <p className="text-sm text-sidebar-foreground/70">Confirmed</p>
        </div>
        <div className="text-center space-y-1">
          <p className="text-2xl font-semibold text-emerald-500 tabular-nums">
            {completed}
          </p>
          <p className="text-sm text-sidebar-foreground/70">Completed</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-sidebar-foreground/70">Cancellation</span>
            <span className="text-sm font-medium tabular-nums text-amber-500">
              {cancellationRate}%
            </span>
          </div>
          <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${Math.min(cancellationRate, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-sidebar-foreground/70">No-Show</span>
            <span className="text-sm font-medium tabular-nums text-rose-500">
              {noShowRate}%
            </span>
          </div>
          <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-rose-400"
              style={{ width: `${Math.min(noShowRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Alert Banner Component - Subtle design
// ============================================================================

interface AlertBannerProps {
  listing: {
    id: string;
    title: string;
    daysSincePublished: number;
  };
}

function AlertBanner({ listing }: AlertBannerProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{listing.title}</p>
        <p className="text-xs text-muted-foreground">
          {listing.daysSincePublished} days — consider updating
        </p>
      </div>
      <a 
        href={`/partner-dashboard/inventory?edit=${listing.id}`}
        className="text-xs font-medium text-foreground hover:text-foreground/70 transition-colors whitespace-nowrap"
      >
        Review →
      </a>
    </div>
  );
}

// ============================================================================
// Format Helpers
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `AED ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `AED ${Math.round(value / 1000)}K`;
  }
  return `AED ${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return value.toLocaleString();
}

// ============================================================================
// Main Component
// ============================================================================

export function AdvancedStatsView() {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/partner/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardDisplayArea title="Analytics">
        <AdvancedStatsSkeleton />
      </DashboardDisplayArea>
    );
  }

  if (error || !stats) {
    return (
      <DashboardDisplayArea title="Analytics">
        <div className="px-4 sm:px-6 py-12">
          <div className="rounded-xl border border-border/40 bg-card/50 p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Unable to load analytics</p>
            <p className="text-xs text-muted-foreground">{error || 'Please try again later'}</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  const { sales, engagement, bookings, trends, composition, inventory } = stats;

  // Prepare chart data
  const conditionData = composition.byCondition.map(c => ({
    name: c.condition,
    value: c.count,
  }));

  const fuelData = composition.byFuelType.map(f => ({
    name: f.fuelType,
    value: f.count,
  }));

  const bodyTypeData = composition.byBodyType.slice(0, 6).map(b => ({
    name: b.bodyType,
    value: b.count,
  }));

  const makeData = composition.byMake.slice(0, 6).map(m => ({
    name: m.make,
    value: m.count,
  }));

  const priceData = composition.priceRangeDistribution.map(p => ({
    name: p.range,
    value: p.count,
  }));

  return (
    <DashboardDisplayArea 
      title="Analytics"
      description="Detailed performance metrics and insights"
    >
      <div className="px-4 sm:px-6 py-8 md:py-10 space-y-10">
        
        {/* Slowest Listing Alert */}
        {sales.slowestActiveListing && sales.slowestActiveListing.daysSincePublished > 30 && (
          <AlertBanner listing={sales.slowestActiveListing} />
        )}

        {/* Key Metrics Grid */}
        <section>
          <SectionHeader title="Key Performance" />
          <div className="bg-sidebar border border-sidebar-border rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-sidebar-border">
            <StatCard
              icon={Package}
              label="Active Listings"
              value={inventory.activeCount}
              subtext={`${formatCurrency(inventory.totalValue)} total value`}
              iconColor="text-blue-500"
            />
            <StatCard
              icon={Banknote}
              label="Revenue All Time"
              value={formatCurrency(sales.revenueAllTime)}
              subtext={`${sales.totalSoldAllTime} vehicles sold`}
              iconColor="text-emerald-500"
            />
            <StatCard
              icon={Eye}
              label="Views This Month"
              value={formatNumber(engagement.totalViewsThisMonth)}
              trend={trends.viewsDelta}
              iconColor="text-violet-500"
            />
            <StatCard
              icon={Heart}
              label="Total Favorites"
              value={engagement.totalFavorites}
              subtext={`${engagement.viewToFavoriteRate}% conversion rate`}
              iconColor="text-rose-500"
            />
            </div>
          </div>
        </section>

        {/* Trends Section */}
        <section>
          <SectionHeader title="Monthly Trends" />
          <div className="grid md:grid-cols-2 gap-6">
            <TrendComparison
              title="Month over Month"
              metrics={[
                {
                  label: 'Sales',
                  current: trends.salesThisMonth,
                  previous: trends.salesLastMonth,
                  delta: trends.salesDelta,
                },
                {
                  label: 'Listings Added',
                  current: trends.listingsAddedThisMonth,
                  previous: trends.listingsAddedLastMonth,
                  delta: trends.listingsAddedDelta,
                },
                {
                  label: 'Views',
                  current: trends.viewsThisMonth,
                  previous: trends.viewsLastMonth,
                  delta: trends.viewsDelta,
                },
              ]}
            />
            
            <BookingFunnel
              pending={bookings.pendingBookings}
              confirmed={bookings.confirmedBookings}
              completed={bookings.completedThisMonth}
              noShowRate={bookings.noShowRate}
              cancellationRate={bookings.cancellationRate}
            />
          </div>
        </section>

        {/* Sales Performance Details */}
        <section>
          <SectionHeader title="Sales Performance" />
          <div className="bg-sidebar border border-sidebar-border rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-sidebar-border">
              <div className="p-5 space-y-2">
                <p className="text-sm text-sidebar-foreground/70">Sold This Month</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-emerald-500 tabular-nums">
                    {sales.soldThisMonth}
                  </p>
                  <TrendBadge value={trends.weekOverWeekSalesDelta} />
                </div>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm text-sidebar-foreground/70">Revenue This Month</p>
                <p className="text-2xl font-semibold text-emerald-500 tabular-nums">
                  {formatCurrency(sales.revenueThisMonth)}
                </p>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm text-sidebar-foreground/70">Avg Days to Sell</p>
                <p className="text-2xl font-semibold text-sidebar-foreground tabular-nums">
                  {sales.avgDaysToSell ? `${sales.avgDaysToSell}` : '—'}
                </p>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-sm text-sidebar-foreground/70">Sell-Through Rate</p>
                <p className="text-2xl font-semibold text-sidebar-foreground tabular-nums">
                  {sales.sellThroughRate}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Composition */}
        <section>
          <SectionHeader title="Inventory Composition" />
          <div className="grid md:grid-cols-2 gap-4">
            <SimpleListChart
              data={conditionData}
              title="By Condition"
              icon={Car}
            />
            <SimpleListChart
              data={fuelData}
              title="By Fuel Type"
              icon={Fuel}
            />
            <HorizontalBarChartCard
              data={makeData}
              title="Top Makes"
              icon={Car}
            />
            <HorizontalBarChartCard
              data={bodyTypeData}
              title="Body Types"
              icon={BarChart3}
            />
          </div>
        </section>

        {/* Price Distribution */}
        <section>
          <SectionHeader title="Price Distribution" />
          <VerticalBarChartCard
            data={priceData}
            title="By Price Range"
            icon={Banknote}
          />
        </section>

        {/* Engagement Section */}
        <section>
          <SectionHeader title="Engagement" />
          <div className="grid md:grid-cols-2 gap-4">
            {/* Engagement Metrics */}
            <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-medium text-sidebar-foreground">Metrics</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-semibold text-violet-500 tabular-nums">
                    {formatNumber(engagement.totalImpressions)}
                  </p>
                  <p className="text-sm text-sidebar-foreground/70">Impressions</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-semibold text-blue-500 tabular-nums">
                    {engagement.avgViewsPerListing}
                  </p>
                  <p className="text-sm text-sidebar-foreground/70">Avg Views</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-semibold text-rose-500 tabular-nums">
                    {engagement.totalSuperlikes}
                  </p>
                  <p className="text-sm text-sidebar-foreground/70">Superlikes</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-semibold text-cyan-500 tabular-nums">
                    {engagement.listingsWithVideo}
                  </p>
                  <p className="text-sm text-sidebar-foreground/70">With Video</p>
                </div>
              </div>
              
              {engagement.avgQiScore !== null && (
                <div className="mt-4 pt-4 border-t border-sidebar-border">
                  <ProgressStat
                    label="Quality Score"
                    value={engagement.avgQiScore}
                    max={100}
                    suffix="/100"
                  />
                </div>
              )}
            </div>

            {/* Top Performing Listings */}
            <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-sidebar-foreground/70" />
                <p className="text-sm font-medium text-sidebar-foreground">Top Performing</p>
              </div>
              <TopListings
                title=""
                listings={engagement.topViewedListings.slice(0, 5).map(l => ({
                  id: l.id,
                  title: l.title,
                  thumbnail: l.thumbnail,
                  stat: l.viewCount,
                  statLabel: 'views',
                }))}
                emptyMessage="No viewed listings yet"
              />
            </div>
          </div>
        </section>

        {/* Low Visibility Section */}
        {engagement.coldListings.length > 0 && (
          <section>
            <SectionHeader title="Needs Attention" />
            <div className="bg-sidebar border border-sidebar-border rounded-xl p-5">
              <ColdListings listings={engagement.coldListings.slice(0, 4)} />
            </div>
          </section>
        )}

        {/* Inventory Summary */}
        <section>
          <SectionHeader title="Inventory Summary" />
          <div className="bg-sidebar border border-sidebar-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-sidebar-border">
              <div className="p-5 space-y-2">
                <small className="text-sidebar-foreground/60">Avg Model Year</small>
                <h2 className="text-2xl font-semibold text-sidebar-foreground tabular-nums">
                  {composition.avgYear ?? '—'}
                </h2>
              </div>
              <div className="p-5 space-y-2">
                <small className="text-sidebar-foreground/60">Avg Mileage</small>
                <h2 className="text-2xl font-semibold text-sidebar-foreground tabular-nums">
                  {composition.avgMileage 
                    ? `${Math.round(composition.avgMileage / 1000)}K km` 
                    : '—'}
                </h2>
              </div>
              <div className="p-5 space-y-2">
                <small className="text-sidebar-foreground/60">Avg List Price</small>
                <h2 className="text-2xl font-semibold text-blue-500 tabular-nums">
                  {formatCurrency(inventory.avgPrice)}
                </h2>
              </div>
              <div className="p-5 space-y-2">
                <small className="text-sidebar-foreground/60">Avg Sold Price</small>
                <h2 className="text-2xl font-semibold text-emerald-500 tabular-nums">
                  {sales.avgSoldPrice ? formatCurrency(sales.avgSoldPrice) : '—'}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Status */}
        {(inventory.staleCount > 0 || inventory.expiringCount > 0 || inventory.pendingApprovalCount > 0 || inventory.draftCount > 0 || inventory.reservedCount > 0) && (
          <section>
            <SectionHeader title="Status" />
            <div className="flex flex-wrap gap-2">
              {inventory.staleCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-sidebar border border-sidebar-border text-amber-500">
                  {inventory.staleCount} stale
                </span>
              )}
              {inventory.expiringCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-sidebar border border-sidebar-border text-rose-500">
                  {inventory.expiringCount} expiring
                </span>
              )}
              {inventory.pendingApprovalCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-sidebar border border-sidebar-border text-blue-500">
                  {inventory.pendingApprovalCount} pending
                </span>
              )}
              {inventory.draftCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-sidebar border border-sidebar-border text-sidebar-foreground/70">
                  {inventory.draftCount} drafts
                </span>
              )}
              {inventory.reservedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-sidebar border border-sidebar-border text-violet-500">
                  {inventory.reservedCount} reserved
                </span>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-border/20">
          <p className="text-[11px] text-muted-foreground/50">
            Updated {new Date(stats.generatedAt).toLocaleString()}
          </p>
          <a 
            href="/knowledge/partners" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Learn more →
          </a>
        </footer>

      </div>
    </DashboardDisplayArea>
  );
}
