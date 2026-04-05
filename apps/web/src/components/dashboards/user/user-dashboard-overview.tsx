/**
 * User Dashboard Overview
 * 
 * Modern dashboard layout following Revvup Design System.
 * Minimal, clean, consistent typography.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import type { DashboardStats } from '@/hooks/profile';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HealthStatus } from '@/components/shared/health-status';
import type { ExtendedUser } from '@/types/auth';
import type { HealthCheckResponse } from '@/lib/health';

// ============================================================================
// Stat Label with Tooltip
// ============================================================================

function StatLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium inline-flex items-center gap-1 cursor-help group">
            {label}
            <Info className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-caption1">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// Format Number Helper
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

// ============================================================================
// Main Component
// ============================================================================

interface UserDashboardOverviewProps {
  user: ExtendedUser;
  initialStats: DashboardStats;
  initialHealth: HealthCheckResponse;
}

export function UserDashboardOverview({ user, initialStats: stats, initialHealth }: UserDashboardOverviewProps) {
  const firstName = (user as any)?.firstName || user?.name?.split(' ')[0] || 'there';

  const memberSince = stats?.memberSince ? new Date(stats.memberSince) : null;
  const memberDays = memberSince
    ? Math.floor((Date.now() - memberSince.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  const saveRate = stats?.saveRate ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-5">

      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-title3 sm:text-title2 font-semibold tracking-tight text-foreground/90">
              {greeting}, {firstName}
            </h1>
            <p className="text-caption1 sm:text-subhead text-muted-foreground mt-1">
              Here's your activity overview · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex-shrink-0 self-start">
            <HealthStatus initialHealth={initialHealth} enableFetch={false} />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-border/20 rounded-lg divide-x divide-y md:divide-y-0 divide-border/20 bg-muted/5">
        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
          <StatLabel label="Active" tooltip="Approximate count of your live listings visible to buyers" />
          <span className="text-title3 sm:text-title2 font-semibold text-primary">{stats.activeListings ?? 0}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
          <StatLabel label="Views" tooltip="Estimated total views across all your listings" />
          <span className="text-title3 sm:text-title2 font-semibold text-purple-500">{formatNumber(stats.totalViews ?? 0)}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
          <StatLabel label="Saved" tooltip="Approximate number of times your listings were saved" />
          <span className="text-title3 sm:text-title2 font-semibold text-warning">{formatNumber(stats.totalSaves ?? 0)}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
          <StatLabel label="Sold" tooltip="Listings you've marked as sold" />
          <span className="text-title3 sm:text-title2 font-semibold text-success">{formatNumber(stats.soldCount ?? 0)}</span>
        </div>
      </div>

      {/* Engagement + Membership — grows to fill remaining space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Engagement */}
        <div className="lg:col-span-8 rounded-lg border border-border/20 bg-muted/5 p-4 sm:p-5 flex flex-col">
          <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Engagement</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
            <div className="flex flex-col justify-center">
              <p className="text-caption1 text-muted-foreground/60 mb-1">Total views</p>
              <p className="text-headline sm:text-title3 font-semibold text-purple-500">{formatNumber(stats.totalViews ?? 0)}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-caption1 text-muted-foreground/60 mb-1">Avg per listing</p>
              <p className="text-headline sm:text-title3 font-semibold text-foreground/90">{stats.avgViewsPerListing ?? 0}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-caption1 text-muted-foreground/60 mb-1">Total saves</p>
              <p className="text-headline sm:text-title3 font-semibold text-warning">{formatNumber(stats.totalSaves ?? 0)}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-caption1 text-muted-foreground/60 mb-1">Save rate</p>
              <p className="text-headline sm:text-title3 font-semibold text-foreground/90">{saveRate}%</p>
            </div>
          </div>

          {/* Chart section */}
          <div className="mt-4 pt-4 border-t border-border/10 flex-1 flex flex-col sm:flex-row gap-4 min-h-0">
            {/* Views vs Saves bar chart */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-medium mb-2">Views vs Saves</p>
              <div className="flex-1 min-h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Views', value: stats.totalViews ?? 0 },
                      { name: 'Saves', value: stats.totalSaves ?? 0 },
                    ]}
                    barCategoryGap="35%"
                    margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.6)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <ChartTooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border) / 0.3)',
                        borderRadius: 6,
                        fontSize: 11,
                        padding: '4px 10px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--muted) / 0.15)' }}
                      formatter={(value: number) => [formatNumber(value), '']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
                      <Cell fill="#a855f7" fillOpacity={0.85} />
                      <Cell fill="#f59e0b" fillOpacity={0.85} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Save rate radial gauge */}
            <div className="flex flex-col items-center justify-center sm:w-[120px] gap-1">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-medium">Save Rate</p>
              <div className="relative w-[96px] h-[96px]">
                <RadialBarChart
                  width={96}
                  height={96}
                  cx={48}
                  cy={48}
                  innerRadius={30}
                  outerRadius={44}
                  startAngle={90}
                  endAngle={-270}
                  data={[{ value: Math.min(saveRate, 100) }]}
                  barSize={10}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={5}
                    background={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    fill="#6366f1"
                  />
                </RadialBarChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-subhead font-semibold text-foreground/90">{saveRate}%</span>
                  <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership */}
        <div className="lg:col-span-4 rounded-lg border border-border/20 bg-muted/5 p-4 sm:p-5 flex flex-col">
          <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Membership</p>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            <div className="flex items-center justify-between">
              <span className="text-caption1 sm:text-subhead text-muted-foreground">Member for</span>
              <span className="text-caption1 sm:text-subhead font-semibold text-cyan-500">{memberDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption1 sm:text-subhead text-muted-foreground">Superlikes left</span>
              <span className="text-caption1 sm:text-subhead font-semibold text-pink-500">{stats?.superlikesRemaining ?? 5}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption1 sm:text-subhead text-muted-foreground">Total sold</span>
              <span className="text-caption1 sm:text-subhead font-semibold text-success">{formatNumber(stats?.soldCount ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/user-dashboard/listings/my-listings"
          className="group flex flex-col gap-2 rounded-lg border border-border/20 bg-muted/5 p-4 hover:border-border/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium">My Listings</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-title3 font-semibold text-primary">{stats?.activeListings ?? 0}<span className="text-caption1 text-muted-foreground font-normal ml-1">active</span></span>
        </Link>
        <Link
          href="/user-dashboard/favorites"
          className="group flex flex-col gap-2 rounded-lg border border-border/20 bg-muted/5 p-4 hover:border-border/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium">Saved Items</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-title3 font-semibold text-favorite">{stats?.mySaves ?? 0}<span className="text-caption1 text-muted-foreground font-normal ml-1">items</span></span>
        </Link>
        <Link
          href="/user-dashboard/messaging"
          className="group flex flex-col gap-2 rounded-lg border border-border/20 bg-muted/5 p-4 hover:border-border/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium">Messages</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-subhead text-muted-foreground">Open inbox</span>
        </Link>
        <Link
          href="/user-dashboard/listings/new"
          className="group flex flex-col gap-2 rounded-lg border border-border/20 bg-muted/5 p-4 hover:border-border/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-caption1 uppercase tracking-wider text-muted-foreground/60 font-medium">Create</p>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-subhead text-muted-foreground">New listing</span>
        </Link>
      </div>

      {/* Footer Note */}
      <p className="text-caption1 text-muted-foreground/60 text-center">
        Stats are approximate and may take time to update
      </p>

    </div>
  );
}
