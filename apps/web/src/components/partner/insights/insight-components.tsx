/**
 * Partner Insights Components - Revvup Design System
 * 
 * Clean, minimal KPI cards and stat displays for partner dashboard.
 * Following "Less is More" principle.
 */

'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { getAppThumbUrl } from '@/utils/storage';

// ============================================================================
// Types
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

interface AlertCardProps {
  label: string;
  count: number;
  href: string;
  variant?: 'warning' | 'info' | 'neutral';
  className?: string;
}

interface ListingPreviewProps {
  id: string;
  title: string;
  thumbnail: string | null;
  stat: string | number;
  statLabel: string;
}

interface TopListingsProps {
  title: string;
  listings: ListingPreviewProps[];
  emptyMessage?: string;
  className?: string;
}

interface ProgressStatProps {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  className?: string;
}

// ============================================================================
// Stat Card - Primary KPI display
// ============================================================================

export function StatCard({ label, value, subtext, trend, className }: StatCardProps) {
  const trendColor = trend 
    ? trend.value > 0 
      ? 'text-emerald-600' 
      : trend.value < 0 
        ? 'text-destructive' 
        : 'text-muted-foreground'
    : null;

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  return (
    <div className={cn(
      "p-4 rounded-xl border border-border bg-card space-y-2",
      className
    )}>
      <p className="text-caption1 text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-title2 font-semibold text-foreground tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && TrendIcon && (
          <span className={cn("flex items-center gap-0.5 text-caption1", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-caption1 text-muted-foreground">
          {subtext}
        </p>
      )}
      {trend?.label && (
        <p className="text-caption1 text-muted-foreground">
          {trend.label}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Alert Card - Action required items
// ============================================================================

export function AlertCard({ label, count, href, variant = 'neutral', className }: AlertCardProps) {
  if (count === 0) return null;

  const variantStyles = {
    warning: 'border-warning/20 bg-warning-muted border-warning/30 bg-warning-muted',
    info: 'border-primary/20 bg-primary-muted border-primary/30 bg-primary-muted',
    neutral: 'border-border bg-card',
  };

  const iconStyles = {
    warning: 'text-warning',
    info: 'text-primary',
    neutral: 'text-muted-foreground',
  };

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/50",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className={cn("w-4 h-4", iconStyles[variant])} />
        <span className="text-subhead text-foreground">{label}</span>
      </div>
      <span className="text-subhead font-semibold text-foreground tabular-nums">{count}</span>
    </Link>
  );
}

// ============================================================================
// Top Listings - Mini listing preview list
// ============================================================================

export function TopListings({ title, listings, emptyMessage = "No data", className }: TopListingsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-caption1 text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      {listings.length === 0 ? (
        <p className="text-subhead text-muted-foreground py-4">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="relative w-12 h-9 rounded overflow-hidden bg-muted flex-shrink-0">
                {getAppThumbUrl(listing.thumbnail) ? (
                  <img
                    src={getAppThumbUrl(listing.thumbnail)!}
                    alt={listing.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-subhead text-foreground truncate">
                  {listing.title}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-subhead font-semibold text-foreground tabular-nums">
                  {typeof listing.stat === 'number' ? listing.stat.toLocaleString() : listing.stat}
                </p>
                <p className="text-caption1 text-muted-foreground">{listing.statLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Cold Listings - Listings needing attention
// ============================================================================

export function ColdListings({ 
  listings, 
  className 
}: { 
  listings: Array<{
    id: string;
    title: string;
    thumbnail: string | null;
    viewCount: number;
    daysSincePublished: number;
  }>;
  className?: string;
}) {
  if (listings.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <p className="text-caption1 text-muted-foreground uppercase tracking-wide">
          Low Visibility
        </p>
      </div>
      <div className="space-y-2">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/partner-dashboard/inventory?edit=${listing.id}`}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="relative w-12 h-9 rounded overflow-hidden bg-muted flex-shrink-0">
              {getAppThumbUrl(listing.thumbnail) ? (
                <img
                  src={getAppThumbUrl(listing.thumbnail)!}
                  alt={listing.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 bg-muted/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-subhead text-foreground truncate">
                {listing.title}
              </p>
              <p className="text-caption1 text-muted-foreground">
                {listing.viewCount} views · {listing.daysSincePublished}d old
              </p>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-caption1 text-muted-foreground">
        Consider updating photos or adjusting price
      </p>
    </div>
  );
}

// ============================================================================
// Progress Stat - For rates and percentages
// ============================================================================

export function ProgressStat({ label, value, max = 100, suffix = '%', className }: ProgressStatProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-caption1 text-muted-foreground">{label}</p>
        <p className="text-subhead font-semibold text-foreground tabular-nums">
          {value}{suffix}
        </p>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

// ============================================================================
// Metric Row - Simple label/value pair
// ============================================================================

export function MetricRow({ 
  label, 
  value, 
  icon: Icon,
  className 
}: { 
  label: string; 
  value: string | number;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-subhead text-muted-foreground">{label}</span>
      </div>
      <span className="text-subhead font-semibold text-foreground tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// ============================================================================
// Section Header
// ============================================================================

export function SectionHeader({ 
  title, 
  action 
}: { 
  title: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-subhead font-semibold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

// ============================================================================
// Trend Badge - Compact trend indicator
// ============================================================================

export function TrendBadge({ 
  value, 
  label 
}: { 
  value: number; 
  label?: string;
}) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption1",
      isPositive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      value < 0 && "bg-destructive-muted text-destructive bg-destructive-muted text-destructive",
      isNeutral && "bg-muted text-muted-foreground"
    )}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      <span>{isPositive ? '+' : ''}{value}%</span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
}
