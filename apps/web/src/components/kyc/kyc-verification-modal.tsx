/**
 * KYC Verification Modal
 * 
 * Clean, minimal design matching signin-modal patterns
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
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

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'kyc-complete') return;

      const { status: webhookStatus, reason } = event.data;

      // Await refetch to ensure fresh data before updating UI
      await queryClient.refetchQueries({ queryKey: ['user-profile'] });

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
        // Append skip parameters to bypass intro screen
        const url = new URL(data.verificationUrl);
        url.searchParams.set('skip_intro', 'true');
        url.searchParams.set('skip_welcome', 'true');
        url.searchParams.set('auto_start', 'true');
        
        setVerificationUrl(url.toString());
        setStatus('verifying');
        queryClient.refetchQueries({ queryKey: ['user-profile'] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setStatus('failed');
    }
  };

  /**
   * Cancel current KYC session - invalidate and refetch profile
   */
  const cancelSession = async () => {
    try {
      await fetch('/api/kyc/cancel', { method: 'POST' });
      // Invalidate first to clear any cached data
      queryClient.removeQueries({ queryKey: ['user-profile'] });
      // Then refetch fresh data
      await queryClient.refetchQueries({ queryKey: ['user-profile'] });
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
    <div 
      className="fixed inset-0 z-[9999] bg-background/40 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Modal */}
      <div 
        className={cn(
          "bg-card border border-border/40 rounded-xl shadow-xl overflow-hidden",
          "transform transition-all duration-200",
          status === 'verifying' || status === 'confirm-cancel' 
            ? "max-w-3xl w-full h-[85vh]" 
            : "max-w-lg w-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Intro Screen */}
        {status === 'intro' && (
          <div className="flex flex-col bg-card">
            {/* Header */}
            <div className="p-6 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-title3 font-semibold tracking-tight text-foreground">Identity Verification</h2>
              <p className="text-subhead text-muted-foreground mt-0.5">
                Get verified in less than 2 minutes
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-5">
              {/* Steps */}
              <div className="rounded-xl border border-border/40 bg-sidebar p-5">
                <div className="py-3 border-b border-border/20">
                  <p className="text-subhead font-semibold text-foreground">Scan your ID</p>
                  <p className="text-caption1 text-muted-foreground/70 mt-0.5">Emirates ID, Passport, or License</p>
                </div>
                <div className="py-3 border-b border-border/20">
                  <p className="text-subhead font-semibold text-foreground">Quick selfie</p>
                  <p className="text-caption1 text-muted-foreground/70 mt-0.5">We'll match it to your ID photo</p>
                </div>
                <div className="py-3">
                  <p className="text-subhead font-semibold text-foreground">Instant verification</p>
                  <p className="text-caption1 text-muted-foreground/70 mt-0.5">AI-powered by Didit</p>
                </div>
              </div>

              <button
                onClick={startVerification}
                className={cn(
                  "w-full h-10 px-4 rounded-lg text-subhead font-semibold transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "flex items-center justify-center gap-2"
                )}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 p-6">
              <p className="text-caption1 text-muted-foreground/70 text-center">
                Your data is encrypted end-to-end with AES-256
              </p>
            </div>
          </div>
        )}

        {/* Loading State - Compact */}
        {status === 'loading' && (
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  Preparing
                </h2>
                <p className="text-subhead text-muted-foreground">
                  Setting up secure connection...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Document State - Compact */}
        {status === 'duplicate' && (
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  Document Already Used
                </h2>
                <p className="text-subhead text-muted-foreground">
                  {error || 'This ID is linked to another account'}
                </p>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "w-full h-9 px-4 rounded-lg text-subhead font-semibold transition-colors",
                  "bg-muted/30 text-foreground hover:bg-muted/50"
                )}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Verification iframe - Full height */}
        {(status === 'verifying' || status === 'confirm-cancel') && verificationUrl && (
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <h2 className="text-subhead font-semibold tracking-tight">Identity Verification</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 relative">
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
                  <div className="bg-card rounded-xl border border-border/40 shadow-xl p-6 max-w-xs w-full">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-center space-y-1">
                        <h2 className="text-callout font-semibold tracking-tight text-foreground">
                          Cancel verification?
                        </h2>
                        <p className="text-subhead text-muted-foreground">
                          Your progress will be lost
                        </p>
                      </div>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={resumeVerification}
                          className={cn(
                            "flex-1 h-9 px-4 rounded-lg text-subhead font-semibold transition-colors",
                            "bg-muted/30 text-foreground hover:bg-muted/50"
                          )}
                        >
                          Continue
                        </button>
                        <button
                          onClick={confirmCancel}
                          className={cn(
                            "flex-1 h-9 px-4 rounded-lg text-subhead font-semibold transition-colors",
                            "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          )}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success State - Compact */}
        {status === 'success' && (
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  Verified
                </h2>
                <p className="text-subhead text-muted-foreground">
                  Your profile now has a verified badge
                </p>
              </div>
            </div>
          </div>
        )}

        {/* In Review State - Compact */}
        {status === 'in-review' && (
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  Under Review
                </h2>
                <p className="text-subhead text-muted-foreground">
                  We'll notify you once it's complete
                </p>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "w-full h-9 px-4 rounded-lg text-subhead font-semibold transition-colors",
                  "bg-muted/30 text-foreground hover:bg-muted/50"
                )}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* Failed State - Compact */}
        {status === 'failed' && (
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-callout font-semibold tracking-tight text-foreground">
                  Verification Failed
                </h2>
                <p className="text-subhead text-muted-foreground">
                  {error || 'Please try again with a valid ID'}
                </p>
              </div>
              <button
                onClick={cancelAndRetry}
                className={cn(
                  "w-full h-9 px-4 rounded-lg text-subhead font-semibold transition-colors",
                  "bg-muted/30 text-foreground hover:bg-muted/50"
                )}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
