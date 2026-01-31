'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuperlikeLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resetDate?: string | Date | null;
}

export function SuperlikeLimitDialog({
  isOpen,
  onClose,
  resetDate,
}: SuperlikeLimitDialogProps) {
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

  const resetDateStr = resetDate
    ? new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'the 1st';

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
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-foreground">No superlikes left</h2>
            <p className="text-[13px] text-muted-foreground">Resets {resetDateStr}</p>
          </div>
        </div>

        {/* Info */}
        <p className="text-[13px] text-muted-foreground mb-5">
          You can still save unlimited favorites to track cars you like.
        </p>

        {/* Action */}
        <button
          onClick={onClose}
          className="w-full h-10 rounded-xl text-[14px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
