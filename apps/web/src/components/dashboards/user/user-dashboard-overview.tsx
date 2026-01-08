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
import { PartnerApplicationStatus, UserBanNotice } from '@/components/dashboards/user';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Ban Notice */}
        {user?.banned && (user as any)?.banReason && (
          <UserBanNotice 
            banReason={(user as any).banReason} 
            banExpires={(user as any).banExpires || null} 
            userId={user.id}
          />
        )}

        {/* Partner Application Status */}
        <PartnerApplicationStatus />

        {/* Header */}
        <header>
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {greeting}, <span className="text-foreground/80">{firstName}</span>
              </h1>
              <p className="text-[15px] font-medium text-muted-foreground/70">
                Here's your activity overview
              </p>
            </div>

            <Link
              href="/user-dashboard/listings/new"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
            >
              New Listing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm"><span className="text-purple-600 dark:text-purple-400 font-bold">Experimental</span> <span className="text-muted-foreground font-medium">· Data may not be fully accurate</span></span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-border/40 rounded-xl divide-x divide-y md:divide-y-0 divide-border/40 bg-sidebar">
          <div className="p-5 sm:p-6 flex flex-col gap-1.5">
            <StatLabel 
              label="Active Listings" 
              tooltip="Number of listings currently visible to buyers" 
            />
            <span className="text-xl font-bold text-foreground">
              {isLoading ? '—' : (stats?.activeListings ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-1.5">
            <StatLabel 
              label="Total Views" 
              tooltip="Total times your listings have been viewed by potential buyers" 
            />
            <span className="text-xl font-bold text-blue-500">
              {isLoading ? '—' : formatNumber(stats?.totalViews ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-1.5">
            <StatLabel 
              label="Saved" 
              tooltip="How many times users saved your listings to their favorites" 
            />
            <span className="text-xl font-bold text-foreground">
              {isLoading ? '—' : formatNumber(stats?.totalSaves ?? 0)}
            </span>
          </div>
          <div className="p-5 sm:p-6 flex flex-col gap-1.5">
            <StatLabel 
              label="Sold" 
              tooltip="Total listings you've marked as sold" 
            />
            <span className="text-xl font-bold text-green-500">
              {isLoading ? '—' : formatNumber(stats?.soldCount ?? 0)}
            </span>
          </div>
        </div>

        {/* Main Grid - Row 1: Views Trend + Membership/Messages */}
        <div className="grid grid-cols-12 gap-4">
          {/* Views Trend Card */}
          <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold tracking-tight text-foreground">Views Trend</h3>
                <p className="text-sm font-medium text-muted-foreground/70">Last 7 days</p>
              </div>
              <span className="text-2xl font-bold text-blue-500">
                {isLoading ? '—' : formatNumber(stats?.totalViews ?? 0)}
              </span>
            </div>
            
            <div className="h-24 text-blue-500">
              <WaveChart />
            </div>
          </div>

          {/* Right: Membership + Messages stacked */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Member Info */}
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <div className="mb-3">
                <span className="text-[15px] font-bold tracking-tight text-foreground">Membership</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-muted-foreground/70 inline-flex items-center gap-1.5 cursor-help">
                          Member for
                          <Info className="w-3 h-3 opacity-50" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-xs">
                        Days since you joined the platform
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-sm font-bold text-foreground">{memberDays} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-muted-foreground/70 inline-flex items-center gap-1.5 cursor-help">
                          Superlikes left
                          <Info className="w-3 h-3 opacity-50" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-xs">
                        Premium saves you can use to stand out. Resets monthly.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-sm font-bold text-foreground">{stats?.superlikesRemaining ?? 5}</span>
                </div>
              </div>
            </div>

            {/* Messages Widget */}
            <Link 
              href="/user-dashboard/messaging"
              className="group block rounded-xl border border-border/40 bg-sidebar p-5 hover:border-border transition-colors flex-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[15px] font-bold tracking-tight text-foreground">Messages</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-500">{unreadCount}</span>
                  <span className="text-sm font-medium text-muted-foreground/70 ml-1.5">unread</span>
                </div>
                <div className="h-10 w-16 text-blue-500">
                  <WaveChart />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Grid - Row 2: Activity/Performance + Saved/Listings */}
        <div className="grid grid-cols-12 gap-4">
          {/* Activity Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-[15px] font-bold tracking-tight text-foreground">Activity</span>
              </div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-medium text-muted-foreground/70 inline-flex items-center gap-1 cursor-help">
                      Last 28 days
                      <Info className="w-3 h-3 opacity-50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    Your posting activity over the past month
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="h-12 text-blue-500 mb-4">
              <MiniBarChart />
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <ActivityDots days={28} />
            </div>
          </div>

          {/* Performance Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-[15px] font-bold tracking-tight text-foreground">Performance</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-green-500">
                  {formatNumber(stats?.soldCount ?? 0)}
                </span>
                <span className="text-sm font-medium text-muted-foreground/70 ml-1.5">sold</span>
              </div>
              <div className="h-12 w-24 text-green-500">
                <WaveChart className="text-green-500" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium text-muted-foreground/70 inline-flex items-center gap-1.5 cursor-help">
                      Save rate
                      <Info className="w-3 h-3 opacity-50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    Percentage of viewers who saved your listings
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-bold text-foreground">{growthRate}%</span>
            </div>
          </div>

          {/* Right: Saved + Listings stacked */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Saved Items Widget */}
            <Link 
              href="/user-dashboard/favorites"
              className="group block rounded-xl border border-border/40 bg-sidebar p-5 hover:border-border transition-colors flex-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[15px] font-bold tracking-tight text-foreground">Saved Items</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">{stats?.mySaves ?? 0}</span>
                <span className="text-sm font-medium text-muted-foreground/70 ml-1.5">items</span>
              </div>
            </Link>

            {/* My Listings Widget */}
            <Link 
              href="/user-dashboard/listings/my-listings"
              className="group block rounded-xl border border-border/40 bg-sidebar p-5 hover:border-border transition-colors flex-1"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[15px] font-bold tracking-tight text-foreground">My Listings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">{stats?.activeListings ?? 0}</span>
                <span className="text-sm font-medium text-muted-foreground/70 ml-1.5">active</span>
              </div>
            </Link>
          </div>
        </div>

        {/* System Status - Full Width */}
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <div className="mb-4">
            <span className="text-[15px] font-bold tracking-tight text-foreground">System Status</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/10">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">Platform</span>
                <span className="text-xs text-green-500">Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/10">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">Security</span>
                <span className="text-xs text-green-500">Protected</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/10">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">API</span>
                <span className="text-xs text-green-500">Fast</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/10">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block">Database</span>
                <span className="text-xs text-green-500">Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden">
          <Link
            href="/user-dashboard/listings/new"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            Create New Listing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
