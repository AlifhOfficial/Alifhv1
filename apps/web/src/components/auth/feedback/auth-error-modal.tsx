/**
 * Auth Error Modal
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
      className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-sm w-full rounded-xl border border-border/40 bg-sidebar p-6 shadow-lg transform transition-all duration-150 ease-out ${showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {errorInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {errorInfo.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {errorInfo.action ? (
            <>
              <button
                onClick={handleAction}
                className="flex-1 h-11 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                {errorInfo.actionLabel || "Try again"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-11 px-6 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors"
              >
                Dismiss
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
