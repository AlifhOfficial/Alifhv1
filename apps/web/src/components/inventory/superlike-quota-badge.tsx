'use client';

import { Sparkles } from 'lucide-react';
import { type FavoritesStatusData } from '@/hooks/favorites';
import { cn } from '@/utils';

type SuperlikeQuota = FavoritesStatusData['quota'];

interface SuperlikeQuotaBadgeProps {
  quota: SuperlikeQuota | null;
  className?: string;
}

export function SuperlikeQuotaBadge({ quota, className }: SuperlikeQuotaBadgeProps) {
  if (!quota) return null;

  const remaining = quota.remaining ?? 0;
  const total = (quota.maxSuperlikesPerMonth ?? 0) + (quota.premiumSuperlikesBonus ?? 0);
  const percentage = total > 0 ? (remaining / total) * 100 : 0;

  // Color based on remaining
  const getColor = () => {
    if (remaining === 0) return 'text-destructive bg-destructive/10 border-destructive/20';
    if (remaining <= 2) return 'text-muted-foreground bg-muted/20 border-border/40';
    return 'text-muted-foreground bg-muted/20 border-border/40';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
        getColor(),
        className
      )}
    >
      <Sparkles className="h-3 w-3" strokeWidth={2.5} />
      <span className="font-semibold">
        {remaining}<span className="opacity-60">/{total}</span>
      </span>
      {remaining === 0 && (
        <span className="text-[10px] opacity-70 ml-1">
          (Resets{' '}
          {quota.periodEndDate
            ? new Date(quota.periodEndDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : 'soon'}
          )
        </span>
      )}
    </div>
  );
}
