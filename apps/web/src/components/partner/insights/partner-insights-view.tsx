/**
 * Partner Insights Overview - Revvup Design System
 * 
 * Modern dashboard layout following Revvup Design System.
 * Minimal, clean, consistent typography with visual charts.
 */

'use client';

import React from 'react';
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
  Calendar, 
  Clock,
  Info,
} from 'lucide-react';
import type { ExtendedUser } from '@/types/auth';
import type { HealthCheckResponse } from '@/lib/health';

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
    totalImpressions: number;
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
// Activity Dots (for inventory status visualization)
// ============================================================================

// Ghost pattern for activity dots - realistic looking placeholder
const GHOST_ACTIVITY_PATTERN = [
  true, true, false, true, false, true, true,
  false, true, true, true, false, false, true,
  true, false, true, false, true, true, false,
  true, true, true, false, true, false, true,
];

function _ActivityDots({ activeDays, days = 28 }: { activeDays?: boolean[]; days?: number }) {
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

function _InsightsSkeleton() {
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

interface PartnerInsightsViewProps {
  user: ExtendedUser;
  initialStats: PartnerStats;
  initialHealth: HealthCheckResponse | null;
}

// ============================================================================
// Main Component
// ============================================================================

export function PartnerInsightsView({
  user,
  initialStats,
  initialHealth,
}: PartnerInsightsViewProps) {
  const stats = initialStats;

  // Get current hour for greeting
  const currentHour = new Date().getHours();

  const sessionData = user as any;
  const partnerMembership = sessionData?.partnerMemberships?.find(
    (m: any) =>
      m.staffRole === 'owner' || m.staffRole === 'admin' || m.staffRole === 'manager'
  );
  const partnerName = partnerMembership?.partnerName;
  const firstName = sessionData?.firstName || 'there';

  const { inventory, sales, engagement, bookings, trends } = stats;

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
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {partnerName ? `${partnerName} overview` : 'Business overview'} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/55">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Last updated {new Date(stats.generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · Use alongside your own records
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <HealthStatus initialHealth={initialHealth} enableFetch={false} />
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
                tooltip="Total listing views across all your active inventory" 
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

          {/* Main Grid - Row 1: Views Summary + Revenue/Bookings */}
          <div className="grid grid-cols-12 gap-4">
            {/* Views Card */}
            <div className="col-span-12 lg:col-span-8 rounded-lg border border-border/20 bg-muted/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Total Views</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-purple-500 tabular-nums">
                      {formatNumber(engagement.totalViewsThisMonth)}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground/60">Impressions</p>
                    <p className="text-sm font-semibold text-foreground/90 tabular-nums">{formatNumber(engagement.totalImpressions ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60">Avg / Listing</p>
                    <p className="text-sm font-semibold text-foreground/90 tabular-nums">{Math.round(engagement.avgViewsPerListing)}</p>
                  </div>
                </div>
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

          {/* Business Snapshot - Full Width */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="mb-5">
              <span className="text-sm font-semibold text-muted-foreground/70">Business Snapshot</span>
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
                  <span className="text-xl font-bold tracking-tight text-foreground">{formatNumber(engagement.totalViewsThisMonth)}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground/70">Total views</p>
                <p className="text-xs text-muted-foreground/50">{formatNumber(engagement.totalImpressions ?? 0)} impressions tracked</p>
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
        </div>
    </>
  );
}
