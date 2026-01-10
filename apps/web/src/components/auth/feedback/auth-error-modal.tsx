/**
 * Auth Error Modal - Alifh Design System
 * 
 * Displays auth errors with actionable next steps
 */

"use client";

import { useEffect, useState } from "react";
import { XCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { AuthErrorInfo, AuthErrorAction } from "@/lib/auth/errors";

interface AuthErrorModalProps {
  open: boolean;
  onClose: () => void;
  errorInfo: AuthErrorInfo;
  onAction?: (action: AuthErrorAction) => void;
}

export function AuthErrorModal({
  open,
  onClose,
  errorInfo,
  onAction,
}: AuthErrorModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [open]);

  if (!open) return null;

  const handleAction = () => {
    if (errorInfo.action && onAction) {
      onAction(errorInfo.action);
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-6 relative",
          "transform transition-all duration-200",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-4">
          {/* Error Icon */}
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {errorInfo.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {errorInfo.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            {errorInfo.action && (
              <button
                onClick={handleAction}
                className={cn(
                  "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {errorInfo.actionLabel || "Try again"}
              </button>
            )}
            
            <button
              onClick={onClose}
              className={cn(
                "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              {errorInfo.action ? "Cancel" : "Close"}
            </button>
          </div>

          {/* Support hint */}
          <p className="text-xs text-muted-foreground/60 text-center pt-1">
            Need help?{" "}
            <a 
              href="/contact" 
              className="font-medium text-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
