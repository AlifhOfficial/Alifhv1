'use client';

import { useEffect, useState } from 'react';
import { LogIn, X, Heart, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  feature?: 'favorites' | 'superlikes';
}

export function AuthRequiredDialog({
  isOpen,
  onClose,
  message = 'Please sign in to continue',
  feature = 'favorites',
}: AuthRequiredDialogProps) {
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

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

  const handleSignIn = () => {
    const currentPath = window.location.pathname;
    router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    handleClose();
  };

  const FeatureIcon = feature === 'superlikes' ? Sparkles : Heart;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl transition-all duration-200',
          'mx-4',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FeatureIcon className="h-8 w-8 text-primary" strokeWidth={2} />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            Sign In Required
          </h3>

          {/* Message */}
          <p className="mb-6 text-sm text-muted-foreground">
            {message}
          </p>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSignIn}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
