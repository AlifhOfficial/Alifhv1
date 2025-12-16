'use client';

import { Sparkles } from 'lucide-react';
import { SuperlikeQuota } from '@/hooks/favorites/use-favorites';
import { cn } from '@/lib/utils';

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
    if (remaining === 0) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (remaining <= 2) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        getColor(),
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
      <span>
        {remaining} / {total}
      </span>
      {remaining === 0 && (
        <span className="text-[10px] opacity-70">
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
