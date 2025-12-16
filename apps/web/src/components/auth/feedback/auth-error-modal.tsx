/**
 * Auth Error Modal - Alifh Design System
 * 
 * Displays Better Auth errors in your branded modal UI/UX
 * Provides clear error messages and actionable next steps
 */

"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X, ArrowRight, Mail, RefreshCcw } from "lucide-react";
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
      setTimeout(() => setShowContent(true), 150);
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

  const getActionIcon = () => {
    switch (errorInfo.action) {
      case "SIGN_IN":
      case "SIGN_UP":
        return <ArrowRight className="w-4 h-4" />;
      case "RETRY":
        return <RefreshCcw className="w-4 h-4" />;
      case "CONTACT_SUPPORT":
        return <Mail className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-md w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div 
              className={`relative bg-red-500/10 rounded-full p-4 transition-all duration-500 ${
                showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}
            >
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          {/* Content */}
          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {errorInfo.title}
            </h2>
            
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {errorInfo.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className={`w-full space-y-3 transition-all duration-500 delay-100 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {errorInfo.action && (
              <button
                onClick={handleAction}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{errorInfo.actionLabel || "Continue"}</span>
                {getActionIcon()}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-muted/50 hover:bg-muted text-foreground font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Close
            </button>
          </div>

          {/* Support hint */}
          <p className="text-xs text-muted-foreground/60 text-center">
            If this problem persists, please{" "}
            <a 
              href="/contact" 
              className="text-foreground hover:underline font-medium"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
