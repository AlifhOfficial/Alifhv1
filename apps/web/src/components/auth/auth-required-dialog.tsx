/**
 * Auth Required Dialog - Alifh Design System
 * Clean prompt for authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { LogIn, X, Heart, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

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
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      document.body.style.overflow = 'hidden';
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowContent(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowContent(false);
    setTimeout(() => onClose(), 200);
  };

  const handleSignIn = () => {
    const currentPath = window.location.pathname;
    router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    handleClose();
  };

  const FeatureIcon = feature === 'superlikes' ? Sparkles : Heart;
  const featureText = feature === 'superlikes' ? 'superlike' : 'favorite';
  const iconBg = feature === 'superlikes' ? 'bg-yellow-500/10' : 'bg-red-500/10';
  const iconColor = feature === 'superlikes' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className={cn(
          "max-w-xs w-full bg-card border border-border/40 rounded-xl shadow-xl p-6 relative",
          "transition-all duration-200",
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconBg)}>
            <FeatureIcon className={cn("h-6 w-6", iconColor)} strokeWidth={2} fill="currentColor" />
          </div>

          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Sign in to {featureText}
            </h2>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={handleClose}
              className={cn(
                "flex-1 h-10 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              Later
            </button>
            <button
              onClick={handleSignIn}
              className={cn(
                "flex-1 h-10 rounded-lg text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "flex items-center justify-center gap-2"
              )}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
