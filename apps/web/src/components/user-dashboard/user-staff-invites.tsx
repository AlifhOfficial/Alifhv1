/**
 * User Staff Invites Component
 * Show pending staff invitations for user to accept/reject
 * Following profile-view minimal design system
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Mail, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';

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

export function UserStaffInvites() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch invites
  const { data: invitesData, isLoading } = useQuery({
    queryKey: ['user', 'staff-invites'],
    queryFn: async () => {
      const res = await fetch('/api/user/staff-invites');
      if (!res.ok) throw new Error('Failed to fetch invites');
      return res.json();
    },
  });

  const invites: StaffInvite[] = invitesData?.data || [];

  // Accept/reject mutation
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
        title: variables.action === 'accept' ? 'Invitation Accepted!' : 'Invitation Rejected',
        description: variables.action === 'accept' 
          ? 'You are now a staff member. Check your partner dashboard.'
          : 'The invitation has been declined.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Action Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const handleAction = (inviteId: string, action: 'accept' | 'reject') => {
    const message = action === 'accept'
      ? 'Accept this staff invitation?'
      : 'Reject this invitation?';
    
    if (confirm(message)) {
      actionMutation.mutate({ inviteId, action });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-500/10 text-purple-500',
      admin: 'bg-blue-500/10 text-blue-500',
      manager: 'bg-blue-500/10 text-blue-500',
      sales: 'bg-green-500/10 text-green-500',
      viewer: 'bg-gray-500/10 text-gray-500',
    };
    return colors[role] || colors.viewer;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center py-24 rounded-xl border border-border">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Pending Invitations</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any staff invitations at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Staff Invitations</h1>
        <p className="text-sm text-muted-foreground">
          You have {invites.length} pending invitation{invites.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Invites List */}
      <section className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-6">
              
              {/* Partner Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Partner Logo */}
                <BrandAvatar
                  logoUrl={invite.partnerLogo}
                  brandName={invite.partnerName}
                  size="md"
                />

                {/* Invite Details */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold truncate">{invite.partnerName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {invite.partnerEmail}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getRoleBadgeColor(invite.role)}`}>
                      {invite.role}
                    </span>
                    
                    {invite.title && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-medium">{invite.title}</span>
                      </>
                    )}
                    
                    {invite.department && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{invite.department}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Invited {new Date(invite.invitedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(invite.id, 'accept')}
                  disabled={actionMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleAction(invite.id, 'reject')}
                  disabled={actionMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
