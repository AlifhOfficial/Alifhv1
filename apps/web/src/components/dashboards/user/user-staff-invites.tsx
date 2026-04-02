/**
 * User Staff Invites Component
 * Clean typography-first design, no icons
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import { StaffInviteActionModal } from './staff-invite-action-modal';

interface StaffInvite {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string | null;
  partnerEmail: string;
  role: 'owner' | 'admin' | 'sales' | 'viewer' | 'manager';
  title: string | null;
  department: string | null;
  invitedAt: Date;
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface UserStaffInvitesProps {
  initialInvites?: { data: StaffInvite[] };
}

export function UserStaffInvites({ initialInvites }: UserStaffInvitesProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<{ id: string; name: string; role: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<'accept' | 'reject' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: invitesData, isLoading } = useQuery({
    queryKey: ['user', 'staff-invites'],
    queryFn: async () => {
      const res = await fetch('/api/user/staff-invites');
      if (!res.ok) throw new Error('Failed to fetch invites');
      return res.json();
    },
    initialData: initialInvites,
    initialDataUpdatedAt: initialInvites ? Date.now() : undefined,
    staleTime: initialInvites ? 60_000 : 0,
  });

  const invites: StaffInvite[] = invitesData?.data || [];

  const actionMutation = useMutation({
    mutationFn: async ({ inviteId, action }: { inviteId: string; action: 'accept' | 'reject' }) => {
      const res = await fetch('/api/user/staff-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, action }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Action failed');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'staff-invites'] });
      toast({
        title: variables.action === 'accept' ? 'Invitation Accepted!' : 'Invitation Declined',
        description: variables.action === 'accept' 
          ? 'You are now a staff member. Check your partner dashboard.'
          : 'The invitation has been declined.',
      });
      setTimeout(() => {
        setModalOpen(false);
        setSelectedInvite(null);
        setPendingAction(null);
        setActionError(null);
      }, 1500);
    },
    onError: (error) => {
      setActionError((error as Error).message || 'Action failed');
    },
  });

  const handleOpenModal = (invite: StaffInvite, action: 'accept' | 'reject') => {
    setSelectedInvite({ id: invite.id, name: invite.partnerName, role: invite.role });
    setPendingAction(action);
    setActionError(null);
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedInvite || !pendingAction) return;
    actionMutation.mutate({ inviteId: selectedInvite.id, action: pendingAction });
  };

  const handleCloseModal = () => {
    if (!actionMutation.isPending) {
      setModalOpen(false);
      setSelectedInvite(null);
      setPendingAction(null);
      setActionError(null);
    }
  };

  // ============================================================================
  // Loading State
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted/40 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 h-32 animate-pulse" />
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Empty State
  // ============================================================================
  
  if (invites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Staff Invitations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage team invites</p>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground/60 mb-1">No pending invitations</p>
          <p className="text-xs text-muted-foreground/40">
            Team invites will appear here
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Staff Invitations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {invites.length} pending invitation{invites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Invites List */}
      <div className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="rounded-xl border border-border/40 bg-sidebar p-5"
          >
            <div className="flex items-start gap-4">
              {/* Partner Logo */}
              <BrandAvatar
                logoUrl={invite.partnerLogo}
                brandName={invite.partnerName}
                size="md"
              />

              {/* Invite Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {invite.partnerName}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {invite.partnerEmail}
                    </p>
                  </div>
                  
                  {/* Role Badge */}
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                    {formatRole(invite.role)}
                  </span>
                </div>

                {/* Meta info */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
                  {invite.title && (
                    <span className="font-medium text-foreground/80">{invite.title}</span>
                  )}
                  {invite.department && (
                    <span>{invite.department}</span>
                  )}
                  <span>
                    Invited {new Date(invite.invitedAt).toLocaleDateString('en-AE', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleOpenModal(invite, 'accept')}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOpenModal(invite, 'reject')}
                    className="px-5 py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      <StaffInviteActionModal
        open={modalOpen}
        onClose={handleCloseModal}
        action={pendingAction}
        partnerName={selectedInvite?.name || ''}
        role={selectedInvite?.role || ''}
        isLoading={actionMutation.isPending}
        error={actionError}
        onConfirm={handleConfirmAction}
      />

    </div>
  );
}
