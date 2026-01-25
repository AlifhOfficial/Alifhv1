/**
 * Generic Feedback Modal - Alifh Design System
 * 
 * Reusable feedback modal for success/error/loading states
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

interface FeedbackModalProps {
  open: boolean;
  onClose?: () => void;
  success?: boolean;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  message?: string;
  loadingMessage?: string;
  type?: 'success' | 'error' | 'info';
}

export function FeedbackModal({
  open,
  onClose,
  success = false,
  isLoading = false,
  error = null,
  title,
  message,
  loadingMessage = "Processing",
  type = 'info',
}: FeedbackModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [open]);

  if (!open) return null;

  const isError = !!error;
  const isSuccess = success && !isError;
  const isLoadingState = isLoading && !isError && !isSuccess;

  const getIcon = () => {
    if (isError) {
      return <XCircle className="w-6 h-6 text-destructive" />;
    }
    if (isSuccess) {
      return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    }
    if (isLoadingState) {
      return <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
    return <Info className="w-6 h-6 text-primary" />;
  };

  const getIconBg = () => {
    if (isError) return "bg-destructive/10";
    if (isSuccess) return "bg-green-500/10";
    if (isLoadingState) return "bg-muted/30";
    return "bg-primary/10";
  };

  const getTitle = () => {
    if (title) return title;
    if (isError) return "Something went wrong";
    if (isSuccess) return "Success";
    if (isLoadingState) return loadingMessage;
    return "Information";
  };

  const getMessage = () => {
    if (error) return error;
    if (message) return message;
    if (isSuccess) return "Operation completed successfully";
    if (isLoadingState) return "Please wait...";
    return "";
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          "max-w-xs w-full bg-card border border-border/40 rounded-xl shadow-xl p-6",
          "transform transition-all duration-200",
          showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", getIconBg())}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {getTitle()}
            </h2>
            
            {getMessage() && (
              <p className="text-sm text-muted-foreground">
                {getMessage()}
              </p>
            )}
          </div>

          {/* Action button for error/success */}
          {(isError || isSuccess) && onClose && (
            <button
              onClick={onClose}
              className={cn(
                "w-full h-9 px-4 rounded-lg text-sm font-semibold transition-colors",
                "bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              {isError ? "Try again" : "Done"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}