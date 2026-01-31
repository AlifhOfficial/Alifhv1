/**
 * Auth Required Modal - Alifh Design System
 * 
 * Clean, minimal modal prompting users to sign in
 * to access protected features. Reusable globally.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  /** Feature name to display, e.g. "create listings", "save favourites" */
  feature?: string;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Redirect path after sign in (defaults to current page) */
  redirectTo?: string;
}

export function AuthRequiredModal({
  open,
  onClose,
  feature = "access this feature",
  title,
  description,
  redirectTo,
}: AuthRequiredModalProps) {
  const pathname = usePathname();
  const [showContent, setShowContent] = useState(false);
  const contentTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current);
      contentTimeoutRef.current = null;
    }
    if (!open) {
      setShowContent(false);
      return;
    }

    contentTimeoutRef.current = window.setTimeout(() => setShowContent(true), 50);

    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current);
      }
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Always use "/" as base URL for auth modals for consistency
  // The redirect param will bring user back to current page after auth
  const handleSignIn = () => {
    const callbackUrl = redirectTo || pathname || "/";
    onClose();
    setTimeout(() => {
      window.location.href = `/?auth=signin&redirect=${encodeURIComponent(callbackUrl)}`;
    }, 50);
  };

  const handleSignUp = () => {
    const callbackUrl = redirectTo || pathname || "/";
    onClose();
    setTimeout(() => {
      window.location.href = `/?auth=signup&redirect=${encodeURIComponent(callbackUrl)}`;
    }, 50);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6",
          "transform transition-all duration-150 ease-out",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Welcome Text */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title || "Welcome"}
          </h2>
          
          <p className="text-[13px] text-muted-foreground mt-2 mb-6">
            {description || `Sign in to ${feature}`}
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
            
            <button
              onClick={handleSignUp}
              className="w-full h-11 rounded-xl text-[15px] font-semibold border border-border/50 bg-muted/20 text-foreground hover:bg-muted/40 transition-colors"
            >
              Create account
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={onClose}
            className="mt-5 text-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
