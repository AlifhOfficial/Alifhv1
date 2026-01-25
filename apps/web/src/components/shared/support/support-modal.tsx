/**
 * Support Modal - Alifh Design System
 * 
 * Clean, minimal support contact modal
 */

"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, X, Mail, Clock } from "lucide-react";
import { cn } from "@/utils/cn";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
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
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-primary" />
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Contact Support
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We're here to help with any questions
            </p>
          </div>

          {/* Contact Options */}
          <div className="w-full space-y-3 pt-2">
            {/* Email */}
            <a
              href="mailto:support@alifh.ae"
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg",
                "bg-muted/30 hover:bg-muted/50 transition-colors"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Email us</p>
                <p className="text-xs text-muted-foreground">support@alifh.ae</p>
              </div>
            </a>

            {/* Response Time */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Response time</p>
                <p className="text-xs text-muted-foreground">Usually within 24-48 hours</p>
              </div>
            </div>
          </div>

          {/* Urgent Note */}
          <p className="text-xs text-muted-foreground/80 text-center px-2">
            For urgent matters, include <span className="font-semibold text-foreground">"URGENT"</span> in the subject
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={cn(
              "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
              "bg-muted/30 text-foreground hover:bg-muted/50"
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
