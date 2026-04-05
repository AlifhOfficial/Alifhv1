/**
 * Admin Partner Operations Component
 * Full CRUD operations for partner management
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CheckCircle,
  Award,
  Tag,
  Star,
  Loader2,
  Trash2,
  Shield,
  XCircle,
} from 'lucide-react';

interface PartnerOperationsProps {
  partner: any; // Partner data
  onOperationComplete?: () => void;
}

export function AdminPartnerOperations({
  partner,
  onOperationComplete,
}: PartnerOperationsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const performOperation = async (operation: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/partners/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ...data }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Operation failed');
      }

      // Invalidate partner queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'partner'] });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      
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

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      alert('Please enter a suspension reason');
      return;
    }

    await performOperation('suspend', {
      partnerId: partner.id,
      reason: suspendReason,
    });
    setShowSuspendModal(false);
    setSuspendReason('');
  };

  const isSuspended = partner.status === 'suspended';
  const isCancelled = partner.status === 'cancelled';
  const isVerified = partner.isVerified;

  return (
    <div className="space-y-8">
      
      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Suspend/Activate */}
        {isSuspended ? (
          <button
            onClick={() => performOperation('activate', { partnerId: partner.id })}
            disabled={loading || isCancelled}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-subhead font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Activate
          </button>
        ) : (
          <button
            onClick={() => setShowSuspendModal(true)}
            disabled={loading || isCancelled}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white text-subhead font-medium transition-colors disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            Suspend
          </button>
        )}

        {/* Verify/Unverify */}
        {isVerified ? (
          <button
            onClick={() => performOperation('unverify', { partnerId: partner.id })}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            Unverify
          </button>
        ) : (
          <button
            onClick={() => performOperation('verify', { partnerId: partner.id })}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-subhead font-medium transition-colors disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            Verify Partner
          </button>
        )}

        {/* Cancel Partner */}
        {!isCancelled && (
          <button
            onClick={() => {
              if (confirm('Cancel this partner permanently? This cannot be undone.')) {
                performOperation('cancel', { partnerId: partner.id });
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-subhead font-medium transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Cancel Partner
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Update Tier */}
        <button
          onClick={() => {
            const tier = prompt('Enter tier (flow/black):') as any;
            if (tier && ['flow', 'black'].includes(tier)) {
              performOperation('updateTier', { partnerId: partner.id, tier });
            }
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Update Tier
        </button>

        {/* Add Tag */}
        <button
          onClick={() => {
            const tag = prompt('Enter tag to add:');
            if (tag) performOperation('addTag', { partnerId: partner.id, tag });
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Tag className="w-4 h-4" />
          Add Tag
        </button>

        {/* Remove Tag */}
        <button
          onClick={() => {
            const tag = prompt('Enter tag to remove:');
            if (tag) performOperation('removeTag', { partnerId: partner.id, tag });
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Tag className="w-4 h-4" />
          Remove Tag
        </button>

        {/* Add Badge */}
        <button
          onClick={() => {
            const badge = prompt('Enter badge to add (e.g., verified, premium):');
            if (badge) performOperation('addBadge', { partnerId: partner.id, badge });
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          Add Badge
        </button>

        {/* Remove Badge */}
        <button
          onClick={() => {
            const badge = prompt('Enter badge to remove:');
            if (badge) performOperation('removeBadge', { partnerId: partner.id, badge });
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          Remove Badge
        </button>

        {/* Delete Partner (Super Admin only) */}
        <button
          onClick={() => {
            const confirmed = confirm(`⚠️ DANGER: Delete partner "${partner.companyNameLegal}"?\n\nThis will permanently delete:\n- Partner account\n- All partner data\n- Cannot be undone\n\nType the company name to confirm.`);
            if (confirmed) {
              const nameConfirm = prompt('Type company name to confirm deletion:');
              if (nameConfirm === partner.companyNameLegal) {
                performOperation('deletePartner', { partnerId: partner.id });
              } else {
                alert('Company name does not match. Deletion cancelled.');
              }
            }
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-red-500/50 text-subhead font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Partner
        </button>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-headline font-semibold tracking-tight">Suspend Partner</h3>
            </div>
            
            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="text-caption1 text-muted-foreground">Partner</label>
                <p className="text-subhead font-medium mt-1">{partner.companyNameLegal}</p>
              </div>

              <div className="space-y-3">
                <label className="text-subhead font-medium">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  className="w-full px-0 py-2 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors resize-none placeholder:text-muted-foreground/30"
                  placeholder="Enter suspension reason..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                }}
                className="flex-1 px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-subhead font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={loading || !suspendReason.trim()}
                className="flex-1 px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white text-subhead font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
