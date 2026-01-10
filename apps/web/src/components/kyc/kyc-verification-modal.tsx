/**
 * KYC Verification Modal
 * 
 * Clean, minimal design matching profile-view patterns
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, ArrowRight, Shield, Lock, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';

type KycStatus = 'intro' | 'loading' | 'verifying' | 'in-review' | 'success' | 'failed';

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

  // Listen for completion message from callback page in iframe
  useEffect(() => {
    if (status !== 'verifying') return;

    const handleMessage = (event: MessageEvent) => {
      console.log('[KYC Modal] Received message:', event.data, 'from origin:', event.origin);
      
      // Accept messages from our own origin OR from any origin if it's a kyc-complete message
      // (The webhook HTML is served from our origin in the iframe)
      if (event.data?.type === 'kyc-complete') {
        console.log('[KYC Modal] KYC complete message received, status:', event.data.status);
        if (event.data.status === 'approved') {
          // Sync data from Didit API before marking as success
          syncKycData().then(() => {
            setStatus('success');
            setTimeout(() => {
              console.log('[KYC Modal] Calling onVerified callback');
              onVerified?.();
            }, 1500);
          });
        } else if (event.data.status === 'rejected') {
          setStatus('failed');
          setError('Verification was declined. Please try again with a valid ID.');
          // Invalidate profile cache so rejected status shows
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        } else if (event.data.status === 'pending') {
          // "In Review" - manual review required
          setStatus('in-review');
          // Invalidate profile cache so in-review status shows
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [status, onVerified]);

  // Sync KYC data from Didit API (since webhooks can't reach localhost)
  const syncKycData = async () => {
    try {
      console.log('[KYC Modal] Syncing KYC data from Didit...');
      const res = await fetch('/api/kyc/sync', { method: 'POST' });
      const data = await res.json();
      console.log('[KYC Modal] Sync result:', data);
      
      // Invalidate user profile cache so verified badge shows instantly
      if (data.success) {
        console.log('[KYC Modal] Invalidating profile cache...');
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
      
      return data;
    } catch (err) {
      console.error('[KYC Modal] Failed to sync KYC data:', err);
      // Continue anyway - the GET callback already updated status
    }
  };

  // Backup: check iframe URL changes
  useEffect(() => {
    if (status !== 'verifying' || !iframeRef.current) return;

    const checkIframe = setInterval(() => {
      try {
        const iframeUrl = iframeRef.current?.contentWindow?.location.href;
        if (iframeUrl?.includes('/api/kyc/webhook')) {
          fetchStatus();
          clearInterval(checkIframe);
        }
      } catch {
        // Cross-origin - expected
      }
    }, 500);

    return () => clearInterval(checkIframe);
  }, [status]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/kyc/didit/session');
      const data = await res.json();
      
      if (data.status === 'approved') {
        await syncKycData(); // Sync data before success
        setStatus('success');
        setTimeout(() => onVerified?.(), 1500);
      } else if (data.status === 'rejected') {
        setStatus('failed');
        setError('Verification was declined.');
        // Invalidate profile cache so rejected status shows
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

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
        // Invalidate profile cache so "pending" status shows immediately
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        setVerificationUrl(data.verificationUrl);
        setStatus('verifying');
      }
    } catch (err) {
      console.error('Failed to start verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setStatus('failed');
    }
  };

  const cancelAndRetry = async () => {
    try {
      setStatus('loading');
      await fetch('/api/kyc/cancel', { method: 'POST' });
      setStatus('intro');
    } catch (err) {
      console.error('Failed to restart:', err);
      setError('Failed to restart verification');
      setStatus('failed');
    }
  };

  const handleClose = () => {
    if (status === 'verifying') {
      if (window.confirm('Cancel verification?')) {
        onClose();
      }
    } else {
      onClose();
    }
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
                  <span className="text-xs">256-bit encryption</span>
                </div>
                <span className="text-xs">•</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs">GDPR compliant</span>
                </div>
              </div>
              <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
                Your data is securely processed and never stored on our servers.
                <br />
                Verification powered by Didit's certified identity platform.
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

        {/* Verification iframe */}
        {status === 'verifying' && verificationUrl && (
          <div className="h-[calc(80vh-57px)]">
            <iframe
              ref={iframeRef}
              src={verificationUrl}
              className="w-full h-full border-0"
              allow="camera; microphone"
              title="Identity Verification"
            />
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
