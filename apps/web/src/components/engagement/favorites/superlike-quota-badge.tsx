'use client';

import { Zap } from 'lucide-react';
import { type FavoritesStatusData } from '@/hooks/engagement';
import { cn } from '@/lib/utils';

type SuperlikeQuota = FavoritesStatusData['quota'];

interface SuperlikeQuotaBadgeProps {
  quota: SuperlikeQuota | null;
  className?: string;
}

export function SuperlikeQuotaBadge({ quota, className }: SuperlikeQuotaBadgeProps) {
  if (!quota) return null;

  const remaining = quota.remaining ?? 0;
  const total = (quota.maxSuperlikesPerMonth ?? 0) + (quota.premiumSuperlikesBonus ?? 0);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-1.5 text-footnote text-muted-foreground',
        remaining === 0 && 'border-warning/30 bg-warning-muted text-warning',
        className
      )}
    >
      <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span className="font-semibold tabular-nums">
        {remaining}<span className="opacity-60">/{total}</span>
      </span>
      {remaining === 0 && quota.periodEndDate && (
        <span className="text-caption2 opacity-70">
          · Resets {new Date(quota.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}
