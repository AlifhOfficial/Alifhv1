/**
 * Auth Required Modal - Alifh Design System
 * 
 * Clean, minimal modal prompting users to sign in
 * to access protected features. Reusable globally.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/utils/cn";

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
  const router = useRouter();
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

    contentTimeoutRef.current = window.setTimeout(() => setShowContent(true), 100);

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

  const handleSignIn = () => {
    const callbackUrl = redirectTo || pathname || "/";
    // Use query params to trigger auth modal (handled by navbar)
    router.push(`${pathname}?auth=signin&redirect=${encodeURIComponent(callbackUrl)}`);
    onClose();
  };

  const handleSignUp = () => {
    const callbackUrl = redirectTo || pathname || "/";
    // Use query params to trigger auth modal (handled by navbar)
    router.push(`${pathname}?auth=signup&redirect=${encodeURIComponent(callbackUrl)}`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6",
          "transform transition-all duration-200",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {title || "Sign in required"}
            </h2>
            
            <p className="text-sm text-muted-foreground">
              {description || `Sign in to ${feature}`}
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2 pt-2">
            <button
              onClick={handleSignIn}
              className={cn(
                "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-[#0066FF] text-white hover:bg-[#0066FF]/90"
              )}
            >
              Sign in
            </button>
            
            <button
              onClick={handleSignUp}
              className={cn(
                "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              Create account
            </button>
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
