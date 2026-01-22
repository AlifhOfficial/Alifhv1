/**
 * Staff Invite Action Modal
 * Simple confirmation for accepting/rejecting staff invitations
 */
'use client';

import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

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
  if (!open || !action) return null;

  const isAccept = action === 'accept';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="max-w-xs w-full bg-card border border-border/40 rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : error ? (
              <XCircle className="w-6 h-6 text-destructive" />
            ) : isAccept ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          
          {/* Content */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {error ? 'Failed' : isLoading ? (isAccept ? 'Joining...' : 'Declining...') : (isAccept ? 'Join team?' : 'Decline invite?')}
            </h2>
            
            <p className="text-sm text-muted-foreground">
              {error ? error : isLoading ? 'Please wait' : (
                isAccept 
                  ? `Join ${partnerName} as ${role}`
                  : `Decline invite from ${partnerName}`
              )}
            </p>
          </div>

          {/* Actions */}
          {!isLoading && (
            <div className="flex gap-2 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                {error ? 'Close' : 'Cancel'}
              </button>
              {!error && (
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isAccept
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isAccept ? 'Join' : 'Decline'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
