/**
 * Generic Feedback Modal - Alifh Design System
 * 
 * Clean, minimal feedback modal for success/error/loading states
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

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
}: FeedbackModalProps) {
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

  const isError = !!error;
  const isSuccess = success && !isError;
  const isLoadingState = isLoading && !isError && !isSuccess;

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
      className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-[340px] w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 transform transition-all duration-150 ease-out ${showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Loading spinner only for loading state */}
          {isLoadingState && (
            <div className="mb-4">
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {getTitle()}
          </h2>
          
          {/* Description */}
          {getMessage() && (
            <p className="text-[13px] text-muted-foreground mt-2 mb-6">
              {getMessage()}
            </p>
          )}

          {/* Action button for error/success */}
          {(isError || isSuccess) && onClose && (
            <div className="w-full space-y-3 mt-4">
              <button
                onClick={onClose}
                className="w-full h-11 rounded-xl text-[15px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isError ? "Try again" : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}