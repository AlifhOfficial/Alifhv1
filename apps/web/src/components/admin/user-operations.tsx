/**
 * Admin User Operations Component
 * Simple, direct operations without hooks
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { AdminUserData } from '@/hooks/admin';
import {
  Ban,
  CheckCircle,
  Shield,
  Tag,
  Award,
  Mail,
  Phone,
  Loader2,
  Trash2,
} from 'lucide-react';

interface UserOperationsProps {
  user: AdminUserData;
  onOperationComplete?: () => void;
}

export function AdminUserOperations({
  user,
  onOperationComplete,
}: UserOperationsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banExpiry, setBanExpiry] = useState('');

  const performOperation = async (operation: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Operation failed');
      }

      // Invalidate all admin user queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
      
      // Also invalidate user-profile in case admin is viewing their own profile
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      // Also refresh the page for server components
      router.refresh();
      
      alert('Operation successful! Data updated.');
      
      // Small delay to let cache invalidation trigger
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onOperationComplete?.();
    } catch (error) {
      alert('Operation failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      alert('Please enter a ban reason');
      return;
    }

    await performOperation('ban', {
      userId: user.id,
      reason: banReason,
      expiresAt: banExpiry || null,
    });
    setShowBanModal(false);
    setBanReason('');
    setBanExpiry('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">User Operations</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Ban/Unban */}
        {user.banned ? (
          <button
            onClick={() => performOperation('unban', { userId: user.id })}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Unban User
          </button>
        ) : (
          <button
            onClick={() => setShowBanModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Ban User
          </button>
        )}

        {/* Verify Email */}
        <button
          onClick={() => performOperation('verifyEmail', { userId: user.id })}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Verify Email
        </button>

        {/* Verify Phone */}
        <button
          onClick={() => performOperation('verifyPhone', { userId: user.id })}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Verify Phone
        </button>

        {/* Add Badge */}
        <button
          onClick={() => {
            const badge = prompt('Enter badge to add (e.g., verified-seller, trusted):');
            if (badge) performOperation('addBadge', { userId: user.id, badge });
          }}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          Add Badge
        </button>

        {/* Remove Badge */}
        <button
          onClick={() => {
            const badge = prompt('Enter badge to remove:');
            if (badge) performOperation('removeBadge', { userId: user.id, badge });
          }}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          Remove Badge
        </button>

        {/* Change Role (Super Admin only) */}
        <button
          onClick={() => {
            const role = prompt('Enter new role (user/admin/super_admin):') as any;
            if (role && ['user', 'admin', 'super_admin'].includes(role)) {
              performOperation('updateRole', { userId: user.id, role });
            }
          }}
          disabled={loading}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Change Role
        </button>

        {/* Delete User (Super Admin only) */}
        <button
          onClick={() => {
            const confirmed = confirm(`⚠️ DANGER: Delete user "${user.name}"?\n\nThis will permanently delete:\n- User account\n- All user data\n- Cannot be undone\n\nType the user's email to confirm.`);
            if (confirmed) {
              const emailConfirm = prompt('Type user email to confirm deletion:');
              if (emailConfirm === user.email) {
                performOperation('deleteUser', { userId: user.id });
              } else {
                alert('Email does not match. Deletion cancelled.');
              }
            }
          }}
          disabled={loading}
          className="px-4 py-2 border border-destructive rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete User
        </button>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-2xl flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-4">Ban User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">User</label>
                <p className="text-sm text-muted-foreground">{user.name} ({user.email})</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Enter ban reason..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={banExpiry}
                  onChange={(e) => setBanExpiry(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for permanent ban
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                  setBanExpiry('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={loading || !banReason.trim()}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
