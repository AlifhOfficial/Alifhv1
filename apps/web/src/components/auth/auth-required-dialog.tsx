/**
 * Auth Required Dialog - Alifh Design Philosophy
 * 
 * Premium, minimal authentication prompt
 * Sophisticated animations and micro-interactions
 * Reflects luxury vehicle marketplace aesthetic
 */

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
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      document.body.style.overflow = 'hidden';
      // Slight delay for entrance animation
      const timeout = setTimeout(() => setShowContent(true), 150);
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
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSignIn = () => {
    const currentPath = window.location.pathname;
    router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    handleClose();
  };

  const FeatureIcon = feature === 'superlikes' ? Sparkles : Heart;
  const featureText = feature === 'superlikes' ? 'superlike' : 'favorite';
  const iconColor = feature === 'superlikes' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className={`max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 hover:rotate-90"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Icon - filled with color */}
          <FeatureIcon className={`h-8 w-8 ${iconColor}`} strokeWidth={2} fill="currentColor" />

          {/* Content */}
          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Sign in to {featureText}
            </h2>
            
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div 
            className={`flex w-full gap-3 transition-all duration-500 delay-100 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-border/50 bg-background/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 hover:border-border"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSignIn}
              className="flex-1 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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
