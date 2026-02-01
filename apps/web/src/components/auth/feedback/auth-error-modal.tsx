/**
 * Auth Error Modal - Alifh Design System
 * 
 * Clean, minimal error modal with actionable next steps
 */

"use client";

import { useEffect, useState, useRef } from "react";
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
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 transform transition-all duration-150 ease-out ${showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Title */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {errorInfo.title}
          </h2>
          
          {/* Description */}
          <p className="text-[13px] text-muted-foreground mt-2 mb-6">
            {errorInfo.message}
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            {errorInfo.action && (
              <button
                onClick={handleAction}
                className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {errorInfo.actionLabel || "Try again"}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl text-[15px] font-semibold border border-border/50 bg-muted/20 text-foreground hover:bg-muted/40 transition-colors"
            >
              {errorInfo.action ? "Cancel" : "Close"}
            </button>
          </div>

          {/* Support hint */}
          <a 
            href="/contact" 
            className="mt-5 text-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
