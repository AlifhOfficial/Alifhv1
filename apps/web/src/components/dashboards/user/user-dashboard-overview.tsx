/**
 * User Dashboard Overview
 * 
 * Modern dashboard layout following Alifh Design System.
 * Minimal, clean, consistent typography.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { DashboardPageWrapper } from '@/components/shared/layout/dashboard-page-wrapper';
import { 
  LayoutGrid, 
  TrendingUp, 
  Bookmark, 
  Mail,
  ChevronRight,
  Activity,
  ArrowRight,
  Info,
  CheckCircle2,
  Shield,
  Zap,
  Database,
  Sparkles,
} from 'lucide-react';
import { UserBanNotice } from '@/components/dashboards/user';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { useDashboardStats } from '@/hooks/profile';
import { useUnreadCount } from '@/hooks/messaging';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
} from 'recharts';
import { HealthStatus } from '@/components/shared/health-status';

// ============================================================================
// Stat Label with Tooltip
// ============================================================================

function StatLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm font-semibold text-muted-foreground/70 inline-flex items-center gap-1.5 cursor-help">
            {label}
            <Info className="w-3 h-3 opacity-50" />
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
// Format Number Helper
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

// ============================================================================
// Mini Wave Chart
// ============================================================================

let waveChartCounter = 0;

function WaveChart({ className = 'text-blue-500' }: { className?: string }) {
  const [gradientId] = React.useState(() => `waveGradient-${++waveChartCounter}`);
  const data = Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: Math.sin(i * 0.5) * 30 + 50 + Math.sin(i * 0.3) * 15,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke="currentColor"
          strokeWidth={2}
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

function MiniBarChart({ className = 'text-blue-500' }: { className?: string }) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    y: Math.random() * 60 + 20,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Bar
          dataKey="y"
          radius={[2, 2, 0, 0]}
          fill="currentColor"
          fillOpacity={0.5}
          className={className}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================================
// Activity Dots
// ============================================================================

function ActivityDots({ days = 28 }: { days?: number }) {
  const dotsPerRow = 7;
  const rows = Math.ceil(days / dotsPerRow);
  
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-1">
          {Array.from({ length: dotsPerRow }).map((_, colIdx) => {
            const idx = rowIdx * dotsPerRow + colIdx;
            if (idx >= days) return null;
            const active = Math.random() > 0.3;
            return (
              <div
                key={colIdx}
                className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-muted/30'}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function UserDashboardOverview() {
  const { session: user } = useAuth();
  const { stats, isLoading } = useDashboardStats();
  const { unreadCount } = useUnreadCount(user?.id);

  if (!user) return null;

  const firstName = (user as any)?.firstName || user?.name?.split(' ')[0] || 'there';
  const lastName = (user as any)?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (user?.name || 'User');
  const avatarUrl = (user as any)?.avatarUrl || null;
  const useGeneratedAvatar = (user as any)?.useGeneratedAvatar ?? true;

  const memberSince = stats?.memberSince ? new Date(stats.memberSince) : null;
  const memberDays = memberSince 
    ? Math.floor((Date.now() - memberSince.getTime()) / (24 * 60 * 60 * 1000))
    : 0;
  
  const growthRate = stats?.saveRate ?? 36;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardPageWrapper>

        {/* Header */}
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
                  {greeting}, {firstName}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted/50 text-muted-foreground">
                  Experimental
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Here's your activity overview · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted-foreground/60">
                Note: Beta testing — data may not reflect accurately
              </p>
            </div>
            
            {/* System Health - Top Right */}
            <div className="flex-shrink-0">
              <HealthStatus />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border/20 rounded-lg divide-x divide-y md:divide-y-0 divide-border/20 bg-muted/5">
          <div className="p-5 sm:p-6 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
              Active
            </span>
            <span className="text-2xl font-semibold text-blue-500">
              {isLoading ? '—' : (stats?.activeListings ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
              Views
            </span>
            <span className="text-2xl font-semibold text-purple-500">
              {isLoading ? '—' : formatNumber(stats?.totalViews ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
              Saved
            </span>
            <span className="text-2xl font-semibold text-amber-500">
              {isLoading ? '—' : formatNumber(stats?.totalSaves ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
              Sold
            </span>
            <span className="text-2xl font-semibold text-green-500">
              {isLoading ? '—' : formatNumber(stats?.soldCount ?? 0)}
            </span>
          </div>
        </div>

        {/* Main Grid - Row 1: Views Trend + Membership/Messages */}
        <div className="grid grid-cols-12 gap-4">
          {/* Views Trend Card */}
          <div className="col-span-12 lg:col-span-8 rounded-lg border border-border/20 bg-muted/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-2">Total Views</p>
                <span className="text-3xl font-semibold text-purple-500">
                  {isLoading ? '—' : formatNumber(stats?.totalViews ?? 0)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground/60 mb-1">Last 7 days</p>
                <div className="h-16 w-32 text-purple-500/20">
                  <WaveChart className="text-purple-500/20" />
                </div>
              </div>
            </div>
            
            {/* Trend Chart */}
            <div className="h-24 w-full text-purple-500/30 -mb-2">
              <WaveChart className="text-purple-500/30" />
            </div>
          </div>

          {/* Right: Membership + Messages stacked */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Member Info */}
            <div className="rounded-lg border border-border/20 bg-muted/5 p-5 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Membership</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member for</span>
                  <span className="text-sm font-semibold text-cyan-500">{memberDays} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Superlikes left</span>
                  <span className="text-sm font-semibold text-pink-500">{stats?.superlikesRemaining ?? 5}</span>
                </div>
              </div>
            </div>

            {/* Messages Widget */}
            <Link 
              href="/user-dashboard/messaging"
              className="group block rounded-lg border border-border/20 bg-muted/5 p-5 hover:border-border/40 transition-colors flex-1"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Messages</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-indigo-500">{unreadCount}</span>
                <span className="text-sm text-muted-foreground ml-1.5">unread</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Grid - Row 2: Quick Links */}
        <div className="grid grid-cols-12 gap-4">
          {/* Activity Summary */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-lg border border-border/20 bg-muted/5 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium mb-4">Activity</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total sold</span>
                <span className="text-sm font-semibold text-green-500">{formatNumber(stats?.soldCount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Save rate</span>
                <span className="text-sm font-semibold text-amber-500">{growthRate}%</span>
              </div>
            </div>
          </div>

          {/* Saved Items */}
          <Link 
            href="/user-dashboard/favorites"
            className="col-span-12 sm:col-span-6 lg:col-span-4 group block rounded-lg border border-border/20 bg-muted/5 p-5 hover:border-border/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Saved Items</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <span className="text-2xl font-semibold text-rose-500">{stats?.mySaves ?? 0}</span>
              <span className="text-sm text-muted-foreground ml-1.5">items</span>
            </div>
          </Link>

          {/* My Listings */}
          <Link 
            href="/user-dashboard/listings/my-listings"
            className="col-span-12 sm:col-span-6 lg:col-span-4 group block rounded-lg border border-border/20 bg-muted/5 p-5 hover:border-border/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">My Listings</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <span className="text-2xl font-semibold text-blue-500">{stats?.activeListings ?? 0}</span>
              <span className="text-sm text-muted-foreground ml-1.5">active</span>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            href="/user-dashboard/listings/new"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-border/20 bg-muted/5 hover:bg-muted/10 text-sm font-medium transition-colors"
          >
            Create Listing
          </Link>
          <Link
            href="/listings"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-border/20 bg-muted/5 hover:bg-muted/10 text-sm font-medium transition-colors"
          >
            Browse Listings
          </Link>
        </div>

    </DashboardPageWrapper>
  );
}
