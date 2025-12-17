/**
 * Phone Verification Modal - Alifh Design System
 * Two-step verification: Send OTP → Verify OTP
 */

'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerified: () => void;
}

function PhoneVerificationModalComponent({
  isOpen,
  onClose,
  phoneNumber,
  onVerified,
}: PhoneVerificationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendOTP = useCallback(async () => {
    if (!phoneNumber) {
      toast({ title: 'Phone number required', description: 'Please add a phone number to your profile first.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/profile/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send verification code');

      toast({ title: 'Code sent', description: 'Check your phone for the verification code.' });
      setStep('verify');
      setCountdown(60);
    } catch (error) {
      toast({
        title: 'Failed to send code',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, toast]);

  const handleVerifyOTP = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: 'Invalid code', description: 'Please enter a 6-digit verification code.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/profile/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid verification code');

      toast({ title: 'Phone verified', description: 'Your phone number has been verified successfully.' });
      onVerified();
      onClose();
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [otp, onVerified, onClose, toast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Verify Phone Number
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 'send' ? 'Send verification code' : 'Enter the code sent to your phone'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {step === 'send' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="h-10 px-3 bg-muted/50 border border-border rounded-lg flex items-center text-sm text-foreground">
                  {phoneNumber || 'No phone number set'}
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a 6-digit verification code to this number
                </p>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber}
                className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-12 px-4 bg-background border border-border rounded-lg text-center text-2xl font-mono tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Phone Number'
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  {countdown > 0 ? (
                    <span>Resend code in {countdown}s</span>
                  ) : (
                    <>
                      <span>Didn't receive the code?</span>
                      <button
                        onClick={() => { setOtp(''); setStep('send'); handleSendOTP(); }}
                        disabled={loading}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Resend
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const PhoneVerificationModal = memo(PhoneVerificationModalComponent);
