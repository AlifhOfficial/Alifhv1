/**
 * Staff Delete Confirmation Modal
 * Modal for confirming staff member removal
 * Following Revvup design system
 */
'use client';

import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/layout/dialog';

interface StaffDeleteModalProps {
  open: boolean;
  onClose: () => void;
  memberName: string;
  memberEmail: string;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function StaffDeleteModal({
  open,
  onClose,
  memberName,
  memberEmail,
  isLoading,
  error,
  onConfirm,
}: StaffDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">
          {error ? 'Deletion Failed' : 'Remove Team Member'}
        </DialogTitle>
        
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Trash2 className="w-5 h-5 text-red-500" />
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-title3 font-semibold">
              {error ? 'Deletion Failed' : 'Remove Team Member?'}
            </h2>
            <p className="text-subhead text-muted-foreground/70 max-w-sm">
              {error ? (
                error
              ) : (
                <>
                  <span className="font-medium text-foreground">{memberName || memberEmail}</span> will be removed from your team and will lose access to the partner dashboard.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-full border border-border/40 hover:bg-secondary/50 text-subhead font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {!error && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-subhead font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Removing...
                  </span>
                ) : (
                  'Remove'
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
