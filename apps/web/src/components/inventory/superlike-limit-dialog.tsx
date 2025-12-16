'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
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
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          You've Used All Your Superlikes
        </h2>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-muted-foreground">
          We understand you're excited about superlikes! They're limited to help sellers prioritize genuine interest. Your quota will reset on{' '}
          {resetDate
            ? new Date(resetDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })
            : 'the 1st of next month'}
          .
        </p>

        {/* Info box */}
        <div className="mb-6 rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            In the meantime, you can still add unlimited favorites to keep track of cars you're interested in.
          </p>
        </div>

        {/* Action */}
        <button
          onClick={handleClose}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
