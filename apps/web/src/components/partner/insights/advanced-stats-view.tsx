/**
 * Advanced Stats View - Partner Analytics Dashboard
 * 
 * Modern dashboard layout following Alifh Design System.
 * Minimal, clean, consistent typography with visual charts.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TrendBadge, ProgressStat, TopListings, ColdListings } from './insight-components';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Heart, 
  Fuel,
  CircleDot,
  Banknote,
  TrendingUp,
  Activity,
  Package,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
    noShowCount: number;
    bookingsThisWeek: number;
    cancellationRate: number;
    cancelledCount: number;
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
// Color Palette - Calm, sophisticated colors
// ============================================================================

const BAR_COLORS = [
  'bg-slate-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-400',
  'bg-orange-400',
];

// Donut chart colors - calm, muted palette
const DONUT_COLORS = [
  '#64748b', // slate-500
  '#0ea5e9', // sky-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#f472b6', // pink-400
  '#fb923c', // orange-400
];

// Composition-specific palettes for better distinction
const COMPOSITION_PALETTES = {
  condition: ['#10b981', '#3b82f6', '#8b5cf6'], // emerald, blue, violet - new/used/certified
  fuel: ['#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899'], // sky, teal, amber, pink - petrol/diesel/hybrid/electric
  make: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'], // indigo to violet gradient
  body: ['#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d', '#ca8a04'], // cyan to lime gradient
};

const BOOKING_COLORS = {
  completed: '#10b981',  // emerald
  cancelled: '#f59e0b',  // amber
  noShow: '#f43f5e',     // rose
};

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
  const [gradientId] = React.useState(() => `advancedWaveGradient-${++waveChartCounter}`);
  
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

const GHOST_BAR_DATA = [35, 55, 40, 70, 45, 60, 50, 75, 42, 65, 48, 58];

function MiniBarChart({ className = 'text-blue-500', data }: { className?: string; data?: number[] }) {
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
// Mini Donut Chart
// ============================================================================

interface DonutData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

function MiniDonutChart({ data, size = 80, innerRadius = 24 }: { data: DonutData[]; size?: number; innerRadius?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // If no data, show ghost donut
  if (total === 0) {
    const ghostData = [{ name: 'empty', value: 1, color: '#e5e7eb' }];
    return (
      <div style={{ width: size, height: size }} className="opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ghostData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={size / 2 - 4}
              strokeWidth={0}
            >
              {ghostData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={size / 2 - 4}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Composition Donut Card
// ============================================================================

interface CompositionDonutProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
  colorPalette?: string[];
}

function CompositionDonutCard({ data, title, icon: Icon, colorPalette = DONUT_COLORS }: CompositionDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // Prepare donut data with colors
  const donutData = data.map((d, i) => ({
    name: d.name,
    value: d.value,
    color: colorPalette[i % colorPalette.length],
  }));

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-[15px] font-bold tracking-tight">{title}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        {/* Donut Chart */}
        <div className="relative">
          <MiniDonutChart data={donutData} size={90} innerRadius={28} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.slice(0, 4).map((item, i) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: colorPalette[i % colorPalette.length] }}
                />
                <span className="text-sm text-foreground/80 capitalize flex-1 truncate">{item.name}</span>
                <span className="text-sm font-bold tabular-nums">{item.value}</span>
                <span className="text-xs text-muted-foreground/50 tabular-nums w-8">{percentage}%</span>
              </div>
            );
          })}
          {data.length > 4 && (
            <span className="text-xs text-muted-foreground/50">+{data.length - 4} more</span>
          )}
        </div>
      </div>
    </div>
  );
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
// Loading Skeleton
// ============================================================================

function AdvancedStatsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-6 w-32" />
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

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>

        {/* Inventory + Sales Row Skeleton */}
        <div className="grid grid-cols-12 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>

        {/* Monthly Trends Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-12 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="col-span-12 md:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Composition Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
                <Skeleton className="h-4 w-28" />
                <div className="flex items-center gap-5">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Engagement Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Footer Skeleton */}
        <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-border/20">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </footer>
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
    <div className="mb-4">
      <span className="text-[15px] font-bold tracking-tight text-foreground">{title}</span>
      {description && (
        <p className="text-sm font-medium text-muted-foreground/70 mt-1">{description}</p>
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

function StatCard({ icon: Icon, label, value, subtext, trend, iconColor = 'text-muted-foreground' }: StatCardProps) {
  return (
    <div className="p-5 sm:p-6 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className="text-sm font-semibold text-muted-foreground/70">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      {subtext && (
        <span className="text-xs text-muted-foreground/60">{subtext}</span>
      )}
    </div>
  );
}

// ============================================================================
// Simple List Chart Component
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
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">{title}</span>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground tabular-nums">{item.value}</span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div 
                className={cn("h-2 rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
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
// Horizontal Bar Chart Component
// ============================================================================

interface HorizontalBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
}

function HorizontalBarChartCard({ data, title, icon: Icon }: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">{title}</span>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/80 truncate max-w-[160px]">
                {item.name}
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={cn("h-2 rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
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
// Vertical Bar Chart Component
// ============================================================================

interface VerticalBarChartProps {
  data: { name: string; value: number }[];
  title: string;
  icon: React.ElementType;
}

function VerticalBarChartCard({ data, title, icon: Icon }: VerticalBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">{title}</span>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/80 truncate max-w-[140px]">
                {item.name}
              </span>
              <span className="text-sm font-medium text-foreground tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={cn("h-2 rounded-full", BAR_COLORS[i % BAR_COLORS.length])}
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
// Price Distribution Visual Bar Chart
// ============================================================================

interface PriceDistributionChartProps {
  data: { name: string; value: number }[];
}

function PriceDistributionChart({ data }: PriceDistributionChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  // Prepare chart data with colors
  const chartData = data.map((d, i) => ({
    name: d.name,
    value: d.value,
    fill: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-emerald-500" />
          <span className="text-[15px] font-bold tracking-tight">Price Distribution</span>
        </div>
        <span className="text-xs text-muted-foreground/60">{total} listings</span>
      </div>
      
      {/* Visual Bar Chart */}
      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with values */}
      <div className="grid grid-cols-5 gap-2 pt-4 border-t border-border/40">
        {data.map((item, i) => (
          <div key={i} className="text-center space-y-1">
            <div 
              className="w-3 h-3 rounded-full mx-auto"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <p className="text-lg font-bold tabular-nums">{item.value}</p>
            <p className="text-[10px] text-muted-foreground/70 leading-tight">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Trend Comparison Component
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
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">{title}</span>
      </div>
      <div className="space-y-0 divide-y divide-border/40">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground/70">{metric.label}</span>
              <p className="text-xl font-bold text-foreground">
                {metric.format === 'currency' 
                  ? formatCurrency(metric.current)
                  : metric.current.toLocaleString()
                }
              </p>
            </div>
            <div className="text-right space-y-1">
              <TrendBadge value={metric.delta} />
              <span className="text-sm text-muted-foreground/60">
                vs {metric.format === 'currency' 
                  ? formatCurrency(metric.previous)
                  : metric.previous.toLocaleString()
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Booking Funnel Component
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
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">Bookings</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center space-y-1">
          <span className="text-2xl font-bold text-amber-500 tabular-nums">
            {pending}
          </span>
          <span className="text-sm font-medium text-muted-foreground/70 block">Pending</span>
        </div>
        <div className="text-center space-y-1">
          <span className="text-2xl font-bold text-blue-500 tabular-nums">
            {confirmed}
          </span>
          <span className="text-sm font-medium text-muted-foreground/70 block">Confirmed</span>
        </div>
        <div className="text-center space-y-1">
          <span className="text-2xl font-bold text-emerald-500 tabular-nums">
            {completed}
          </span>
          <span className="text-sm font-medium text-muted-foreground/70 block">Completed</span>
        </div>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-border/40">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground/70">Cancellation</span>
            <span className="text-sm font-bold tabular-nums text-amber-500">
              {cancellationRate}%
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-2 rounded-full bg-amber-500"
              style={{ width: `${Math.min(cancellationRate, 100)}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground/70">No-Show</span>
            <span className="text-sm font-bold tabular-nums text-rose-500">
              {noShowRate}%
            </span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-2 rounded-full bg-rose-500"
              style={{ width: `${Math.min(noShowRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Alert Banner Component
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
    <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 truncate">{listing.title}</p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {listing.daysSincePublished} days — consider updating
        </p>
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
  const [visibleTopListings, setVisibleTopListings] = useState(4);

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
    return <AdvancedStatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
          <header>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
              <p className="text-[15px] font-medium text-muted-foreground/70">
                Detailed performance metrics
              </p>
            </div>
          </header>

          <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Unable to load analytics</p>
            <p className="text-xs text-muted-foreground">{error || 'Please try again later'}</p>
          </div>
        </div>
      </div>
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
    <div className="space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Analytics</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Detailed performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm"><span className="text-purple-600 dark:text-purple-400 font-bold">Experimental</span> <span className="text-muted-foreground font-medium">· Data may not be fully accurate</span></span>
          </div>
        </div>
        
        {/* Slowest Listing Alert */}
        {sales.slowestActiveListing && sales.slowestActiveListing.daysSincePublished > 30 && (
          <AlertBanner listing={sales.slowestActiveListing} />
        )}

        {/* Key Stats with Charts - 12 Column Grid */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Views Trend - Large Card */}
          <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground/70">Views This Month</h3>
              </div>
              <TrendBadge value={trends.viewsDelta} />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-500 tabular-nums">
                {formatNumber(engagement.totalViewsThisMonth)}
              </span>
              <span className="text-sm text-muted-foreground/60">views</span>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground/60">Last Month</p>
                <p className="text-lg font-bold tabular-nums">{formatNumber(trends.viewsLastMonth)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60">Impressions</p>
                <p className="text-lg font-bold tabular-nums">{formatNumber(engagement.totalImpressions)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60">Avg per Listing</p>
                <p className="text-lg font-bold tabular-nums">{engagement.avgViewsPerListing}</p>
              </div>
            </div>
          </div>

          {/* Right Stack - Revenue + Favorites */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Revenue Card */}
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-muted-foreground/70">Total Revenue</span>
              </div>
              <span className="text-2xl font-bold text-emerald-500">
                {formatCurrency(sales.revenueAllTime)}
              </span>
              <p className="text-xs text-muted-foreground/60 mt-1">{sales.totalSoldAllTime} vehicles sold all time</p>
            </div>

            {/* Favorites Card */}
            <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-muted-foreground/70">Favorites</span>
              </div>
              <span className="text-2xl font-bold text-rose-500">
                {engagement.totalFavorites}
              </span>
              <p className="text-xs text-muted-foreground/60 mt-1">{engagement.viewToFavoriteRate}% of views convert to favorites</p>
            </div>
          </div>
        </div>

        {/* Inventory + Sales Row */}
        <div className="grid grid-cols-12 gap-4">
          {/* Active Inventory Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-muted-foreground/70">Active Inventory</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Listings</span>
                <span className="text-lg font-bold">{inventory.activeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Total Value</span>
                <span className="text-lg font-bold text-blue-500">{formatCurrency(inventory.totalValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Avg Price</span>
                <span className="text-sm font-bold">{formatCurrency(inventory.avgPrice)}</span>
              </div>
            </div>
          </div>

          {/* Sales Performance Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-muted-foreground/70">Sales This Month</span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-emerald-500">{sales.soldThisMonth}</span>
              <span className="text-sm text-muted-foreground/70 ml-1.5">sold</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Revenue</span>
                <span className="text-sm font-bold text-emerald-500">{formatCurrency(sales.revenueThisMonth)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Avg Days to Sell</span>
                <span className="text-sm font-bold">{sales.avgDaysToSell ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground/70">Fastest Sale</span>
                <span className="text-sm font-bold">{sales.fastestSale ?? '—'} days</span>
              </div>
            </div>
          </div>

          {/* Bookings Card with Donut */}
          <div className="col-span-12 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="text-[15px] font-bold tracking-tight">Bookings</span>
            </div>
            <div className="flex items-center gap-5">
              <MiniDonutChart 
                data={[
                  { name: 'Completed', value: bookings.completedThisMonth, color: BOOKING_COLORS.completed },
                  { name: 'Cancelled', value: bookings.cancelledCount, color: BOOKING_COLORS.cancelled },
                  { name: 'No Show', value: bookings.noShowCount, color: BOOKING_COLORS.noShow },
                ]}
                size={90}
                innerRadius={28}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-foreground/80">Completed</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{bookings.completedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm text-foreground/80">Cancelled</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{bookings.cancelledCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-sm text-foreground/80">No Show</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{bookings.noShowCount}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/70">Pending</span>
                <span className="text-sm font-bold text-blue-500">{bookings.pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/70">Confirmed</span>
                <span className="text-sm font-bold text-sky-500">{bookings.confirmedBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <section className="space-y-4">
          <SectionHeader title="Monthly Trends" />
          <div className="grid grid-cols-12 gap-4">
            {/* Trend Comparison Card */}
            <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-muted-foreground/70">Month over Month</span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground/60">Sales</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{trends.salesThisMonth}</span>
                    <TrendBadge value={trends.salesDelta} />
                  </div>
                  <span className="text-xs text-muted-foreground/50">vs {trends.salesLastMonth} last month</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground/60">Listings Added</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{trends.listingsAddedThisMonth}</span>
                    <TrendBadge value={trends.listingsAddedDelta} />
                  </div>
                  <span className="text-xs text-muted-foreground/50">vs {trends.listingsAddedLastMonth} last month</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground/60">Views</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatNumber(trends.viewsThisMonth)}</span>
                    <TrendBadge value={trends.viewsDelta} />
                  </div>
                  <span className="text-xs text-muted-foreground/50">vs {formatNumber(trends.viewsLastMonth)} last month</span>
                </div>
              </div>
            </div>

            {/* Sell-Through & Speed */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
                <span className="text-xs text-muted-foreground/60">Sell-Through Rate</span>
                <p className="text-3xl font-bold text-emerald-500 mt-2">{sales.sellThroughRate}%</p>
                <p className="text-xs text-muted-foreground/50 mt-1">of listings sold this month</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-sidebar p-5 flex-1">
                <span className="text-xs text-muted-foreground/60">Avg Days to Sell</span>
                <p className="text-3xl font-bold mt-2">{sales.avgDaysToSell ?? '—'}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">from published to sold</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Composition with Donut Charts */}
        <section className="space-y-4">
          <SectionHeader title="Inventory Composition" />
          <div className="grid md:grid-cols-2 gap-4">
            <CompositionDonutCard
              data={conditionData}
              title="By Condition"
              icon={CircleDot}
              colorPalette={COMPOSITION_PALETTES.condition}
            />
            <CompositionDonutCard
              data={fuelData}
              title="By Fuel Type"
              icon={Fuel}
              colorPalette={COMPOSITION_PALETTES.fuel}
            />
            <CompositionDonutCard
              data={makeData}
              title="Top Makes"
              icon={Layers}
              colorPalette={COMPOSITION_PALETTES.make}
            />
            <CompositionDonutCard
              data={bodyTypeData}
              title="Body Types"
              icon={BarChart3}
              colorPalette={COMPOSITION_PALETTES.body}
            />
          </div>
        </section>

        {/* Price Distribution with Visual Bar Chart */}
        <section className="space-y-4">
          <PriceDistributionChart data={priceData} />
        </section>

        {/* Engagement Section */}
        <section className="space-y-4">
          <SectionHeader title="Engagement" />
          <div className="grid grid-cols-12 gap-4">
            {/* Engagement Metrics */}
            <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-muted-foreground/70">Engagement Metrics</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-violet-500 tabular-nums">
                    {formatNumber(engagement.totalImpressions)}
                  </p>
                  <p className="text-xs text-muted-foreground/60">Impressions</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-blue-500 tabular-nums">
                    {engagement.avgViewsPerListing}
                  </p>
                  <p className="text-xs text-muted-foreground/60">Avg Views</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-rose-500 tabular-nums">
                    {engagement.totalSuperlikes}
                  </p>
                  <p className="text-xs text-muted-foreground/60">Superlikes</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-pink-500 tabular-nums">
                    {engagement.totalFavorites}
                  </p>
                  <p className="text-xs text-muted-foreground/60">Favorites</p>
                </div>
              </div>
              {engagement.avgQiScore !== null && (
                <div className="mt-5 pt-4 border-t border-border/40">
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
            <div className="col-span-12 lg:col-span-4 rounded-xl border border-border/40 bg-sidebar p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-[15px] font-bold tracking-tight">Top Performing</span>
              </div>
              <TopListings
                title=""
                listings={engagement.topViewedListings.slice(0, visibleTopListings).map(l => ({
                  id: l.id,
                  title: l.title,
                  thumbnail: l.thumbnail,
                  stat: l.viewCount,
                  statLabel: 'views',
                }))}
                emptyMessage="No viewed listings yet"
              />
              {engagement.topViewedListings.length > visibleTopListings && (
                <button
                  onClick={() => setVisibleTopListings(prev => prev + 4)}
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 rounded-lg hover:bg-accent/50"
                >
                  Load more ({engagement.topViewedListings.length - visibleTopListings} remaining)
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Low Visibility Section */}
        {engagement.coldListings.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Needs Attention" />
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <ColdListings listings={engagement.coldListings.slice(0, 4)} />
            </div>
          </section>
        )}

        {/* Inventory Summary with Mini Charts */}
        <section className="space-y-4">
          <SectionHeader title="Inventory Summary" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <span className="text-xs text-muted-foreground/60">Avg Model Year</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold tabular-nums">{composition.avgYear ?? '—'}</span>
                <div className="h-6 w-10 text-blue-500 opacity-40">
                  <MiniBarChart className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <span className="text-xs text-muted-foreground/60">Avg Mileage</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold tabular-nums">
                  {composition.avgMileage ? `${Math.round(composition.avgMileage / 1000)}K km` : '—'}
                </span>
                <div className="h-6 w-10 text-amber-500 opacity-40">
                  <WaveChart className="text-amber-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <span className="text-xs text-muted-foreground/60">Avg List Price</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold text-blue-500 tabular-nums">
                  {formatCurrency(inventory.avgPrice)}
                </span>
                <div className="h-6 w-10 text-blue-500 opacity-40">
                  <WaveChart className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-sidebar p-5">
              <span className="text-xs text-muted-foreground/60">Avg Sold Price</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold text-emerald-500 tabular-nums">
                  {sales.avgSoldPrice ? formatCurrency(sales.avgSoldPrice) : '—'}
                </span>
                <div className="h-6 w-10 text-emerald-500 opacity-40">
                  <MiniBarChart className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Status */}
        {(inventory.staleCount > 0 || inventory.expiringCount > 0 || inventory.pendingApprovalCount > 0 || inventory.draftCount > 0 || inventory.reservedCount > 0) && (
          <section className="space-y-4">
            <SectionHeader title="Status" />
            <div className="flex flex-wrap gap-2">
              {inventory.staleCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sidebar border border-border/40 text-amber-500">
                  {inventory.staleCount} stale
                </span>
              )}
              {inventory.expiringCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sidebar border border-border/40 text-rose-500">
                  {inventory.expiringCount} expiring
                </span>
              )}
              {inventory.pendingApprovalCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sidebar border border-border/40 text-blue-500">
                  {inventory.pendingApprovalCount} pending
                </span>
              )}
              {inventory.draftCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sidebar border border-border/40 text-muted-foreground/70">
                  {inventory.draftCount} drafts
                </span>
              )}
              {inventory.reservedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sidebar border border-border/40 text-violet-500">
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
        </footer>

    </div>
  );
}
