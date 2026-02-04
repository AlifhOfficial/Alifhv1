/**
 * Partner Insights Overview - Revvup Design System
 * 
 * Modern dashboard layout following Revvup Design System.
 * Minimal, clean, consistent typography with visual charts.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TrendBadge } from './insight-components';
import { Skeleton } from '@/components/ui/skeleton';
import { HealthStatus } from '@/components/shared/health-status';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  Calendar,
  CheckCircle2, 
  Database,
  Heart,
  Info, 
  Package,
  Shield, 
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface PartnerStats {
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
  sales: {
    soldThisMonth: number;
    revenueThisMonth: number;
    avgDaysToSell: number | null;
    sellThroughRate: number;
    avgSoldPrice: number | null;
    totalSoldAllTime: number;
    revenueAllTime: number;
  };
  engagement: {
    totalViewsThisMonth: number;
    avgViewsPerListing: number;
    totalFavorites: number;
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
  generatedAt: string;
}

// ============================================================================
// Greeting Helper
// ============================================================================

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ============================================================================
// Mini Wave Chart
// ============================================================================

let waveChartCounter = 0;

// Ghost data pattern - smooth wave for placeholder state
const GHOST_WAVE_DATA = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: Math.sin(i * 0.4) * 20 + 50 + Math.cos(i * 0.25) * 10,
}));

function WaveChart({ className = 'text-blue-500', data }: { className?: string; data?: number[] }) {
  const [gradientId] = React.useState(() => `partnerWaveGradient-${++waveChartCounter}`);
  
  // Use provided data or show ghost floating pattern
  const chartData = data 
    ? data.map((y, i) => ({ x: i, y }))
    : GHOST_WAVE_DATA;
  
  const isGhost = !data;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={isGhost ? 0.15 : 0.3} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke="currentColor"
          strokeWidth={2}
          strokeOpacity={isGhost ? 0.3 : 1}
          fill={`url(#${gradientId})`}
          className={className}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Mini Bar Chart
// ============================================================================

// Ghost data pattern - varied bars for placeholder state
const GHOST_BAR_DATA = [35, 55, 40, 70, 45, 60, 50, 75, 42, 65, 48, 58];

function MiniBarChart({ className = 'text-blue-500', data }: { className?: string; data?: number[] }) {
  // Use provided data or show ghost floating pattern
  const chartData = data 
    ? data.map((y, i) => ({ x: i, y }))
    : GHOST_BAR_DATA.map((y, i) => ({ x: i, y }));
  
  const isGhost = !data;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar
          dataKey="y"
          radius={[2, 2, 0, 0]}
          fill="currentColor"
          fillOpacity={isGhost ? 0.2 : 0.5}
          className={className}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Activity Dots (for inventory status visualization)
// ============================================================================

// Ghost pattern for activity dots - realistic looking placeholder
const GHOST_ACTIVITY_PATTERN = [
  true, true, false, true, false, true, true,
  false, true, true, true, false, false, true,
  true, false, true, false, true, true, false,
  true, true, true, false, true, false, true,
];

function ActivityDots({ activeDays, days = 28 }: { activeDays?: boolean[]; days?: number }) {
  const dotsPerRow = 7;
  const rows = Math.ceil(days / dotsPerRow);
  const isGhost = !activeDays;
  
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-1">
          {Array.from({ length: dotsPerRow }).map((_, colIdx) => {
            const idx = rowIdx * dotsPerRow + colIdx;
            if (idx >= days) return null;
            // Use provided data or show ghost pattern
            const isActive = activeDays 
              ? activeDays[idx] ?? false 
              : GHOST_ACTIVITY_PATTERN[idx] ?? false;
            return (
              <div
                key={colIdx}
                className={`w-2 h-2 rounded-full ${
                  isActive 
                    ? isGhost ? 'bg-emerald-500/30' : 'bg-emerald-500'
                    : 'bg-muted/30'
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function InsightsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-5 w-40" />
          </div>
        </header>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border/40 rounded-xl divide-x divide-y md:divide-y-0 divide-border/40 bg-sidebar">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 sm:p-6 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton - Row 1 */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-10 w-32 mb-4" />
            <div className="mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
          </div>
        </div>

        {/* Main Grid Skeleton - Row 2 */}
        <div className="grid grid-cols-12 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>

        {/* Month Comparison Skeleton */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <Skeleton className="h-4 w-40 mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>

        {/* System Status Skeleton */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/10">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
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
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return value.toLocaleString();
}

// ============================================================================
// Stat Label with Tooltip
// ============================================================================

function StatLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium inline-flex items-center gap-1 cursor-help group">
            {label}
            <Info className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PartnerInsightsView() {
  const { session } = useAuth();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current hour for greeting
  const currentHour = new Date().getHours();

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
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Get user info - eslint-disable for session typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionData = session as any;
  const partnerMembership = sessionData?.partnerMemberships?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.staffRole === 'owner'
  );
  const partnerName = partnerMembership?.partnerName;
  const firstName = sessionData?.firstName || 'there';

  if (loading) {
    return <InsightsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          {/* Header even on error */}
          <header>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {getGreeting(currentHour)}, <span className="text-foreground/80">{firstName}</span>
              </h1>
              <p className="text-[15px] font-medium text-muted-foreground/70">
                Here's your business overview
              </p>
            </div>
          </header>

          <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center">
            <p className="text-sm text-muted-foreground">{error || 'Unable to load data'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { inventory, sales, engagement, bookings, trends } = stats;

  // Count items needing attention
  const attentionItems = [
    { count: inventory.pendingApprovalCount, label: 'pending approval', href: '/partner-dashboard/inventory?status=pending' },
    { count: inventory.needsRemoderationCount, label: 'need updates', href: '/partner-dashboard/inventory?status=remoderation' },
    { count: inventory.expiringCount, label: 'expiring soon', href: '/partner-dashboard/inventory?status=expiring' },
    { count: bookings.pendingBookings, label: 'booking requests', href: '/partner-dashboard/bookings?status=pending' },
  ].filter(item => item.count > 0);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">

          {/* Header */}
          <header>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
                  {getGreeting(currentHour)}, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {partnerName ? `${partnerName} overview` : 'Business overview'} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <HealthStatus />
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-border/20 rounded-lg divide-x divide-y md:divide-y-0 divide-border/20 bg-muted/5">
            <div className="p-5 sm:p-6 flex flex-col gap-2">
              <StatLabel 
                label="Active" 
                tooltip="Number of listings currently live and visible to buyers" 
              />
              <span className="text-2xl font-semibold text-blue-500">
                {inventory.activeCount}
              </span>
            </div>
            <div className="p-5 sm:p-6 flex flex-col gap-2">
              <StatLabel 
                label="Views" 
                tooltip="Total listing views this month across all your inventory" 
              />
              <span className="text-2xl font-semibold text-purple-500">
                {formatNumber(engagement.totalViewsThisMonth)}
              </span>
            </div>
            <div className="p-5 sm:p-6 flex flex-col gap-2">
              <StatLabel 
                label="Favorites" 
                tooltip="How many times users have saved your listings to favorites" 
              />
              <span className="text-2xl font-semibold text-amber-500">
                {formatNumber(engagement.totalFavorites ?? 0)}
              </span>
            </div>
            <div className="p-5 sm:p-6 flex flex-col gap-2">
              <StatLabel 
                label="Sold" 
                tooltip="Vehicles sold this month" 
              />
              <span className="text-2xl font-semibold text-green-500">
                {sales.soldThisMonth}
              </span>
            </div>
          </div>

          {/* Main Grid - Row 1: Views Trend + Revenue/Bookings */}
          <div className="grid grid-cols-12 gap-4">
            {/* Views Card */}
            <div className="col-span-12 lg:col-span-8 rounded-lg border border-border/20 bg-muted/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Views This Month</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-purple-500 tabular-nums">
                      {formatNumber(engagement.totalViewsThisMonth)}
                    </span>
                    <TrendBadge value={trends.viewsDelta} />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground/60">Last Month</p>
                    <p className="text-sm font-semibold text-foreground/90 tabular-nums">{formatNumber(trends.viewsLastMonth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60">Avg / Listing</p>
                    <p className="text-sm font-semibold text-foreground/90 tabular-nums">{Math.round(engagement.avgViewsPerListing)}</p>
                  </div>
                </div>
              </div>
              
              {/* Trend Chart */}
              <div className="h-24 w-full text-purple-500/30 -mb-2">
                <WaveChart className="text-purple-500/30" />
              </div>
            </div>

            {/* Right: Revenue + Bookings stacked */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              {/* Revenue Info */}
              <div className="rounded-lg border border-border/20 bg-muted/5 p-5 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Revenue</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This month</span>
                    <span className="text-sm font-semibold text-green-500">{formatCurrency(sales.revenueThisMonth)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total value</span>
                    <span className="text-sm font-semibold text-cyan-500">{formatCurrency(inventory.totalValue)}</span>
                  </div>
                </div>
              </div>

              {/* Bookings Widget */}
              <div 
                className="block rounded-lg border border-border/20 bg-muted/5 p-5 flex-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground/70">Bookings</span>
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-blue-500">{bookings.pendingBookings}</span>
                  <span className="text-sm text-muted-foreground/60 ml-1.5">pending</span>
                </div>
                <p className="text-xs text-muted-foreground/50 mt-1">{bookings.confirmedBookings} confirmed · {bookings.completedThisMonth} completed</p>
              </div>
            </div>
          </div>

          {/* Main Grid - Row 2: Quick Stats */}
          <div className="grid grid-cols-12 gap-4">
            {/* Inventory Summary */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-lg border border-border/20 bg-muted/5 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Inventory</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="text-sm font-semibold text-blue-500">{inventory.activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total value</span>
                  <span className="text-sm font-semibold text-cyan-500">{formatCurrency(inventory.totalValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg price</span>
                  <span className="text-sm font-semibold text-foreground/90">{formatCurrency(inventory.avgPrice)}</span>
                </div>
              </div>
            </div>

            {/* Sales Performance */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-lg border border-border/20 bg-muted/5 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Sales</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This month</span>
                  <span className="text-sm font-semibold text-green-500">{sales.soldThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-sm font-semibold text-emerald-500">{formatCurrency(sales.revenueThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg days to sell</span>
                  <span className="text-sm font-semibold text-amber-500">{sales.avgDaysToSell ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Engagement Widget */}
            <div 
              className="col-span-12 sm:col-span-6 lg:col-span-4 block rounded-lg border border-border/20 bg-muted/5 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Engagement</p>
              </div>
              <div>
                <span className="text-2xl font-semibold text-rose-500">{engagement.totalFavorites ?? 0}</span>
                <span className="text-sm text-muted-foreground ml-1.5">favorites</span>
              </div>
            </div>
          </div>

          {/* Month Comparison - Full Width */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="mb-5">
              <span className="text-sm font-semibold text-muted-foreground/70">This Month vs Last Month</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold tracking-tight text-foreground">{trends.listingsAddedThisMonth}</span>
                  <TrendBadge value={trends.listingsAddedDelta} />
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">New listings</p>
                <p className="text-xs text-muted-foreground/50">vs {trends.listingsAddedLastMonth} last month</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold tracking-tight text-foreground">{formatNumber(trends.viewsThisMonth)}</span>
                  <TrendBadge value={trends.viewsDelta} />
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">Views</p>
                <p className="text-xs text-muted-foreground/50">vs {formatNumber(trends.viewsLastMonth)} last month</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold tracking-tight text-foreground">{trends.salesThisMonth}</span>
                  <TrendBadge value={trends.salesDelta} />
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">Sales</p>
                <p className="text-xs text-muted-foreground/50">vs {trends.salesLastMonth} last month</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold tracking-tight text-foreground">{sales.sellThroughRate}%</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">Sell-through</p>
                <p className="text-xs text-muted-foreground/50">of listed inventory</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground/50">
              Last updated {new Date(stats.generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · Use alongside your own records
            </span>
          </div>

        </div>
    </>
  );
}
