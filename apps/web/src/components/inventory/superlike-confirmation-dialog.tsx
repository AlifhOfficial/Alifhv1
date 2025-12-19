'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { SuperlikeQuota } from '@/hooks/favorites';

interface SuperlikeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quota: SuperlikeQuota | null;
  listingTitle?: string;
}

export function SuperlikeConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  quota,
  listingTitle,
}: SuperlikeConfirmationDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const remaining = quota?.remaining ?? 0;
  const total = (quota?.maxSuperlikesPerMonth ?? 0) + (quota?.premiumSuperlikesBonus ?? 0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all duration-200 mx-4 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <Sparkles className="h-8 w-8 text-yellow-500" strokeWidth={2.5} fill="currentColor" />
        </div>

        {/* Title */}
        <h2 className="mb-1 text-center text-lg font-semibold text-foreground">
          Superlike this listing?
        </h2>

        {/* Subtitle */}
        {listingTitle && (
          <p className="mb-5 text-center text-sm text-muted-foreground font-medium">
            {listingTitle}
          </p>
        )}

        {/* Learn more link */}
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            className="text-xs text-primary hover:underline font-medium"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add link to superlike documentation
            }}
          >
            Learn how superlikes work
          </button>
        </div>

        {/* Quota info */}
        <div className="mb-5 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Remaining</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {remaining}<span className="text-base text-muted-foreground font-normal"> / {total}</span>
            </span>
          </div>
          {quota?.periodEndDate && (
            <p className="text-xs text-muted-foreground text-right">
              Resets {new Date(quota.periodEndDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Warning if low */}
        {remaining <= 5 && remaining > 0 && (
          <div className="mb-5 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-500 text-center font-medium">
              Only {remaining} superlike{remaining === 1 ? '' : 's'} remaining this month
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Confirm
          </button>
        </div>

        {/* Info text */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Superlikes help sellers prioritize your interest
        </p>
      </div>
    </div>
  );
}
