/**
 * Danger Zone Section Component
 */

'use client';

import { useToast } from '@/hooks/use-toast';

export function DangerZoneSection() {
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-foreground">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Permanently delete your account and all data
        </p>
      </div>

      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Delete Account</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Once you delete your account, it will be marked for deletion and removed after 6 months. 
            Your data will be retained for security and legal purposes during this period.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="h-9 px-4 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
