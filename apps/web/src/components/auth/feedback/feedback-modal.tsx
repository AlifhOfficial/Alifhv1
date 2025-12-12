/**
 * Generic Feedback Modal - Alifh Design Philosophy
 * 
 * Reusable feedback modal for success/error states
 * Can be used for any operation with custom messages
 * Sophisticated animations and micro-interactions
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 150);
    } else {
      setShowContent(false);
      setShowSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (success && open) {
      setTimeout(() => setShowSuccess(true), 300);
    }
  }, [success, open]);

  if (!open) return null;

  // Determine the state-based content
  const isError = !!error;
  const isSuccess = success && !isError;
  const isLoadingState = isLoading && !isError && !isSuccess;

  // Dynamic content based on state
  const getIcon = () => {
    if (isError) {
      return <X className="w-8 h-8 text-red-500" />;
    }
    if (isSuccess || showSuccess) {
      return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
    }
    if (isLoadingState) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative z-10" />
        </div>
      );
    }
    // Default info state
    return <AlertCircle className="w-8 h-8 text-blue-500" />;
  };

  const getTitle = () => {
    if (title) return title;
    if (isError) return "Operation Failed";
    if (isSuccess || showSuccess) return "Success";
    if (isLoadingState) return loadingMessage;
    return "Information";
  };

  const getMessage = () => {
    if (error) return error;
    if (message) return message;
    if (isSuccess || showSuccess) return "Operation completed successfully";
    if (isLoadingState) return "Please wait while we process your request";
    return "Operation in progress";
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="relative">
            <div className="animate-in zoom-in duration-500">
              {getIcon()}
            </div>
          </div>
          
          {/* Content */}
          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {getTitle()}
            </h2>
            
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {getMessage()}
              {isLoadingState && (
                <span className="inline-flex ml-1">
                  <span className="animate-bounce opacity-60" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}>.</span>
                  <span className="animate-bounce opacity-60" style={{ animationDelay: '200ms', animationDuration: '1.2s' }}>.</span>
                  <span className="animate-bounce opacity-60" style={{ animationDelay: '400ms', animationDuration: '1.2s' }}>.</span>
                </span>
              )}
            </p>
            
            {/* Progress indicator for loading state */}
            {isLoadingState && (
              <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}