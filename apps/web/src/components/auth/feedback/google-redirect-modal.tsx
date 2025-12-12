/**
 * Google Redirect Modal - Pure UI Component
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * 
 * Shows a loading state while redirecting to Google OAuth
 */

"use client";

import { useEffect } from "react";


interface GoogleRedirectModalProps {
  open: boolean;
  onClose?: () => void;
}

export function GoogleRedirectModal({ open, onClose }: GoogleRedirectModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="space-y-6">
          {/* Google Logo - Top Left (4x4 as per philosophy) */}
          <div className="w-4 h-4 animate-spin">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-foreground">
              Communicating with Google<span className="animate-pulse">...</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
