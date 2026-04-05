/**
 * Generic Feedback Modal
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
    if (isSuccess) return "Done";
    if (isLoadingState) return loadingMessage;
    return "Information";
  };

  const getMessage = () => {
    if (error) return error;
    if (message) return message;
    if (isSuccess) return "Operation completed successfully.";
    if (isLoadingState) return "Please wait...";
    return "";
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
          {isLoadingState && (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mx-auto" />
          )}
          <h2 className="text-headline font-semibold tracking-tight text-foreground">
            {getTitle()}
          </h2>
          {getMessage() && (
            <p className="text-subhead text-muted-foreground">
              {getMessage()}
            </p>
          )}
        </div>

        {/* Action button */}
        {(isError || isSuccess) && onClose && (
          <button
            onClick={onClose}
            className="w-full h-11 px-6 bg-primary text-primary-foreground text-subhead font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isError ? "Try again" : "Got it"}
          </button>
        )}
      </div>
    </div>
  );
}