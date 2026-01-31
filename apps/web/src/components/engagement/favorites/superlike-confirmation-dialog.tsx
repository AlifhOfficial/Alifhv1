'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type FavoritesStatusData } from '@/hooks/engagement';

type SuperlikeQuota = FavoritesStatusData['quota'];

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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setShowContent(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const remaining = quota?.remaining ?? 0;
  const total = (quota?.maxSuperlikesPerMonth ?? 0) + (quota?.premiumSuperlikesBonus ?? 0);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "max-w-sm w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6",
          "transform transition-all duration-150 ease-out",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" />
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-foreground">Superlike this listing?</h2>
            {listingTitle && (
              <p className="text-[13px] text-muted-foreground truncate">{listingTitle}</p>
            )}
          </div>
          <span className="text-[13px] font-semibold text-muted-foreground tabular-nums flex-shrink-0">
            {remaining}/{total} left
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-[14px] font-semibold border border-border/50 bg-muted/20 text-foreground hover:bg-muted/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 h-10 rounded-xl text-[14px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
