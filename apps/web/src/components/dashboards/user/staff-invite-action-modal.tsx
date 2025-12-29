/**
 * Staff Invite Action Modal
 * Confirmation modal for accepting/rejecting staff invitations
 * Following Alifh design system - modals for important feedback
 */
'use client';

import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/layout/dialog';

interface StaffInviteActionModalProps {
  open: boolean;
  onClose: () => void;
  action: 'accept' | 'reject' | null;
  partnerName: string;
  role: string;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function StaffInviteActionModal({
  open,
  onClose,
  action,
  partnerName,
  role,
  isLoading,
  error,
  onConfirm,
}: StaffInviteActionModalProps) {
  if (!action) return null;

  const isAccept = action === 'accept';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">
          {error ? 'Action Failed' : isAccept ? 'Accept Invitation' : 'Reject Invitation'}
        </DialogTitle>
        
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isAccept ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">
              {error ? 'Action Failed' : isAccept ? 'Accept Invitation?' : 'Reject Invitation?'}
            </h2>
            <p className="text-sm text-muted-foreground/70 max-w-sm">
              {error ? (
                error
              ) : isAccept ? (
                <>
                  You will join <span className="font-medium text-foreground">{partnerName}</span> as{' '}
                  <span className="font-medium text-foreground capitalize">{role}</span>
                </>
              ) : (
                <>
                  This invitation from <span className="font-medium text-foreground">{partnerName}</span> will be declined
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {!error && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-6 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                  isAccept
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isAccept ? 'Accepting...' : 'Rejecting...'}
                  </span>
                ) : (
                  isAccept ? 'Accept' : 'Reject'
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
