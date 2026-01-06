/**
 * Partner Insights Overview - Alifh Design System
 * 
 * Clean, minimal business overview with greeting, time, and system status.
 * Just data, clearly presented.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardDisplayArea } from '@/components/shared/layout/display-area';
import { TrendBadge } from './insight-components';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

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
// Time & Greeting Helpers
// ============================================================================

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric'
  });
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function InsightsSkeleton() {
  return (
    <div className="px-6 py-8 md:py-12 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* System Status Skeleton */}
      <Skeleton className="h-5 w-36" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Two Column Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Month Comparison Skeleton */}
      <div className="p-5 rounded-xl border border-border space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
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
// Main Component
// ============================================================================

export function PartnerInsightsView() {
  const { session } = useAuth();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/partner/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
          setSystemStatus('online');
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        setSystemStatus('offline');
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
    return (
      <DashboardDisplayArea title="Overview">
        <InsightsSkeleton />
      </DashboardDisplayArea>
    );
  }

  if (error || !stats) {
    return (
      <DashboardDisplayArea title="Overview">
        <div className="px-6 py-8 md:py-12 space-y-6">
          {/* Header even on error */}
          <div className="space-y-2">
            <h1 className="text-xl font-medium">
              {getGreeting(currentTime.getHours())}, {firstName}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDate(currentTime)}</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>

          {/* System Status - Offline */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-600 dark:text-red-400">System unavailable</span>
          </div>

          <div className="rounded-xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">{error || 'Unable to load data'}</p>
          </div>
        </div>
      </DashboardDisplayArea>
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
    <DashboardDisplayArea title="Overview">
      <div className="px-6 py-8 md:py-12 space-y-8">

        {/* Header - Greeting, Date, Time */}
        <div className="space-y-2">
          <h1 className="text-xl font-medium">
            {getGreeting(currentTime.getHours())}, {firstName}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(currentTime)}</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(currentTime)}</span>
            </div>
            {partnerName && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span>{partnerName}</span>
              </>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 text-sm">
          {systemStatus === 'online' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-muted-foreground">All systems operational</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-600 dark:text-red-400">System issues detected</span>
            </>
          )}
        </div>

        {/* Attention Banner */}
        {attentionItems.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Needs attention</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {attentionItems.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.href}
                    className="text-xs text-amber-700 dark:text-amber-300 hover:underline"
                  >
                    {item.count} {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1">Active listings</p>
            <p className="text-2xl font-semibold">{inventory.activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total value {formatCurrency(inventory.totalValue)}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1">Sold this month</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{sales.soldThisMonth}</p>
              <TrendBadge value={trends.salesDelta} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(sales.revenueThisMonth)} revenue
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1">Views this month</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{formatNumber(engagement.totalViewsThisMonth)}</p>
              <TrendBadge value={trends.viewsDelta} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {engagement.avgViewsPerListing} avg per car
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1">Avg days to sell</p>
            <p className="text-2xl font-semibold">{sales.avgDaysToSell ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.sellThroughRate}% sell-through rate
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Inventory Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Live</span>
                <span className="text-sm font-medium">{inventory.activeCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Reserved</span>
                <span className="text-sm font-medium">{inventory.reservedCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Drafts</span>
                <span className="text-sm font-medium">{inventory.draftCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Pending review</span>
                <span className="text-sm font-medium">{inventory.pendingApprovalCount}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Listed 30+ days</span>
                <span className="text-sm text-muted-foreground">{inventory.staleCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">This week</span>
                <span className="text-sm font-medium">{bookings.bookingsThisWeek}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Confirmed upcoming</span>
                <span className="text-sm font-medium">{bookings.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Completed this month</span>
                <span className="text-sm font-medium">{bookings.completedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">No-show rate</span>
                <span className="text-sm text-muted-foreground">{bookings.noShowRate}%</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Month Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This month vs last month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold">{trends.listingsAddedThisMonth}</span>
                  <TrendBadge value={trends.listingsAddedDelta} />
                </div>
                <p className="text-xs text-muted-foreground">New listings</p>
                <p className="text-xs text-muted-foreground">Was {trends.listingsAddedLastMonth}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold">{formatNumber(trends.viewsThisMonth)}</span>
                  <TrendBadge value={trends.viewsDelta} />
                </div>
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="text-xs text-muted-foreground">Was {formatNumber(trends.viewsLastMonth)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold">{trends.salesThisMonth}</span>
                  <TrendBadge value={trends.salesDelta} />
                </div>
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="text-xs text-muted-foreground">Was {trends.salesLastMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Interest */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-semibold">{engagement.totalFavorites ?? 0}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{formatNumber(engagement.totalViewsThisMonth)}</p>
                <p className="text-xs text-muted-foreground">Total views</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{engagement.avgViewsPerListing}</p>
                <p className="text-xs text-muted-foreground">Avg views per car</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">{bookings.completedThisMonth}</p>
                <p className="text-xs text-muted-foreground">Test drives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span>Updated {new Date(stats.generatedAt).toLocaleString()}</span>
          <div className="flex items-center gap-4">
            <Link 
              href="/knowledge/partners" 
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Learn more
            </Link>
            <Link 
              href="/partner-dashboard/analytics" 
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
            >
              Detailed analytics <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        
      </div>
    </DashboardDisplayArea>
  );
}
