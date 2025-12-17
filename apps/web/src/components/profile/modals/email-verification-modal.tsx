/**
 * Email Verification Modal Component
 */

'use client';

import { useState, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailAddress: string;
  onVerified: () => void;
}

function EmailVerificationModalComponent({
  isOpen,
  onClose,
  emailAddress,
  onVerified,
}: EmailVerificationModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerification = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Verification email sent', description: 'Please check your inbox and click the verification link.' });
        onClose();
      } else {
        throw new Error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [emailAddress, onClose, toast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-medium text-foreground">Verify Email</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-muted rounded-md transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              We'll send a verification link to:
            </p>
            <p className="text-sm font-medium text-foreground px-3 py-2 bg-muted/30 rounded-md">
              {emailAddress}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click the link in the email to verify your email address. The link will expire in 24 hours.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/40">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-sm font-medium border border-border/40 text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendVerification}
            disabled={isLoading}
            className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const EmailVerificationModal = memo(EmailVerificationModalComponent);
