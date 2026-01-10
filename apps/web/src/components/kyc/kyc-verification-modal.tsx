/**
 * KYC Verification Modal
 * 
 * Clean, minimal design matching profile-view patterns
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, ArrowRight, Shield, Lock, Clock, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';

type KycStatus = 'intro' | 'loading' | 'verifying' | 'confirm-cancel' | 'in-review' | 'success' | 'failed' | 'duplicate';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function KycVerificationModal({ isOpen, onClose, onVerified }: KycVerificationModalProps) {
  const [status, setStatus] = useState<KycStatus>('intro');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStatus('intro');
        setVerificationUrl(null);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Single event listener for webhook postMessage
   * WEBHOOK ALREADY UPDATES DB - no need to call sync
   * 
   * Webhook sends these exact statuses:
   * - 'approved' → success
   * - 'rejected' → failed (with reason)
   * - 'pending' → in-review
   * - 'duplicate' → duplicate document
   */
  useEffect(() => {
    if (status !== 'verifying' && status !== 'confirm-cancel') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'kyc-complete') return;

      const { status: webhookStatus, reason } = event.data;

      // Invalidate cache for all outcomes
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      switch (webhookStatus) {
        case 'approved':
          setStatus('success');
          setTimeout(() => onVerified?.(), 1500);
          break;

        case 'duplicate':
          setStatus('duplicate');
          setError(reason || 'This document has already been used to verify another account.');
          break;

        case 'pending':
          setStatus('in-review');
          break;

        case 'rejected':
          setStatus('failed');
          setError(reason || 'Verification was declined. Please try again with a valid ID.');
          break;

        default:
          // Unknown status - stay on current screen
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [status, onVerified, queryClient]);

  const startVerification = async () => {
    try {
      setStatus('loading');
      setError(null);

      const res = await fetch('/api/kyc/didit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start verification');
      }

      if (data.verificationUrl) {
        // Cache invalidated by API after session creation
        setVerificationUrl(data.verificationUrl);
        setStatus('verifying');
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setStatus('failed');
    }
  };

  /**
   * Cancel current KYC session - only invalidates cache once at the end
   */
  const cancelSession = async () => {
    try {
      await fetch('/api/kyc/cancel', { method: 'POST' });
      // Single cache invalidation after cancel
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    } catch {
      // Silent fail - next session start will clean up anyway
    }
  };

  const cancelAndRetry = async () => {
    setStatus('loading');
    await cancelSession();
    setStatus('intro');
  };

  const confirmCancel = async () => {
    await cancelSession();
    onClose();
  };

  const handleClose = () => {
    if (status === 'verifying') {
      // Show custom confirmation instead of browser confirm
      setStatus('confirm-cancel');
    } else if (status === 'confirm-cancel') {
      // Already showing confirm, do nothing on backdrop click
      return;
    } else {
      // If we were loading or in any non-success state, also cancel
      if (status === 'loading' || verificationUrl) {
        cancelSession();
      }
      onClose();
    }
  };

  const resumeVerification = () => {
    setStatus('verifying');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full bg-background rounded-xl border border-border/40 shadow-lg overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        status === 'verifying' ? "max-w-2xl h-[80vh]" : "max-w-md"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <h2 className="text-[15px] font-bold tracking-tight">Identity Verification</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {/* Intro Screen */}
        {status === 'intro' && (
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-6">
              Get a verified badge on your profile. Quick, secure, and takes less than 2 minutes.
            </p>

            <div className="space-y-1 mb-6">
              <div className="flex items-center gap-3 py-3 border-b border-border/20">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Scan your ID</p>
                  <p className="text-xs text-muted-foreground">Emirates ID, Passport, or License</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-border/20">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Quick selfie</p>
                  <p className="text-xs text-muted-foreground">We'll match it to your ID photo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Instant verification</p>
                  <p className="text-xs text-muted-foreground">AI-powered by Didit</p>
                </div>
              </div>
            </div>

            <button
              onClick={startVerification}
              className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {/* Security badges */}
            <div className="mt-6 pt-5 border-t border-border/20">
              <div className="flex items-center justify-center gap-4 text-muted-foreground/60">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">AES-256-GCM</span>
                </div>
                <span className="text-xs">•</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs">End-to-end encrypted</span>
                </div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
                Your ID data is encrypted at rest using military-grade AES-256.
                <br />
                Images compressed & stored securely. Verification by Didit.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-16 px-5">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Preparing secure connection...</p>
          </div>
        )}

        {/* Duplicate Document State */}
        {status === 'duplicate' && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-[15px] font-bold tracking-tight mb-2">Document Already Registered</h3>
            <p className="text-sm text-muted-foreground mb-1">
              This ID document is already linked to another account.
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              Each document can only be used for one account. If you believe this is an error, please contact support.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Verification iframe */}
        {(status === 'verifying' || status === 'confirm-cancel') && verificationUrl && (
          <div className="relative h-[calc(80vh-57px)]">
            <iframe
              ref={iframeRef}
              src={verificationUrl}
              className={cn(
                "w-full h-full border-0 transition-opacity",
                status === 'confirm-cancel' && "opacity-30 pointer-events-none"
              )}
              allow="camera; microphone"
              title="Identity Verification"
            />
            
            {/* Cancel Confirmation Overlay */}
            {status === 'confirm-cancel' && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-background rounded-xl border border-border/40 shadow-lg p-5 max-w-sm w-full animate-in fade-in-0 zoom-in-95 duration-200">
                  <h3 className="text-[15px] font-bold tracking-tight mb-2">Cancel verification?</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Your progress will be lost and you'll need to start over.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={resumeVerification}
                      className="flex-1 h-10 border border-border/40 rounded-lg text-sm font-semibold hover:bg-muted/30 transition-colors"
                    >
                      Continue
                    </button>
                    <button
                      onClick={confirmCancel}
                      className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-[15px] font-bold tracking-tight mb-1">Verified</h3>
            <p className="text-sm text-muted-foreground">
              Your profile now has a verified badge
            </p>
          </div>
        )}

        {/* In Review State */}
        {status === 'in-review' && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-[15px] font-bold tracking-tight mb-1">Under Review</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your verification is being reviewed by our team
            </p>
            <p className="text-xs text-muted-foreground/70 mb-6">
              This usually takes a few minutes. We'll notify you once it's complete.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <X className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-[15px] font-bold tracking-tight mb-1">Verification Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {error || 'Please try again with a valid ID'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelAndRetry}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border/40 rounded-lg text-sm font-semibold hover:bg-muted/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
