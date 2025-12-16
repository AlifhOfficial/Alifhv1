/**
 * Danger Zone Section Component
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function DangerZoneSection() {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDeleteAccount = async () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmationText !== 'DELETE') {
      toast({
        title: 'Error',
        description: 'Please type "DELETE" to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Account marked for deletion',
          description: `Your account will be deleted after 6 months (${new Date(data.deletionDate).toLocaleDateString()}).`,
        });
        // Sign out after marking for deletion
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-foreground">Account Management</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and data
        </p>
      </div>

      {/* Account Deletion */}
      <div className="flex items-center justify-between py-4 border-b border-border/40">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground">
            Delete Account
          </label>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">
            Once you delete your account, it will be marked for deletion and removed after 6 months. 
            Your data will be retained for security and legal purposes during this period.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="ml-6 h-9 w-9 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
          title="Delete Account"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone. Your account will be marked for deletion and removed after 6 months.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmationText('');
                  }}
                  className="flex-1 h-9 px-4 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors border border-border/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={confirmationText !== 'DELETE'}
                  className="flex-1 h-9 px-4 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
