'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LifeBuoy, X, Mail } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-card border border-border p-8 shadow-2xl transition-all duration-200 mx-4 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Contact Support</h2>
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-md">
              Our support team is available to assist with any questions or issues.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email</p>
            <a
              href="mailto:support@alifh.ae"
              className="flex items-center gap-2 text-sm sm:text-[15px] font-medium text-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              support@alifh.ae
            </a>
          </div>

          {/* Response Time */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Response Time</p>
            <p className="text-sm sm:text-[15px] font-medium text-foreground">24-48 hours</p>
          </div>

          {/* Urgent Matters */}
          <div className="rounded-xl border border-border/40 p-4 bg-muted/30">
            <p className="text-sm sm:text-[15px] font-medium text-foreground leading-relaxed">
              <span className="font-bold text-red-500">For urgent matters:</span> Include "URGENT" in the subject line
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-semibold tracking-tight transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
