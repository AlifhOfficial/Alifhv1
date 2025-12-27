/**
 * Staff Management Component
 * Full team management - invite, remove, edit roles
 * Following profile-view minimal design system
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, User, UserMinus, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { StaffDeleteModal } from './staff-delete-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

interface TeamMember {
  id: string;
  displayName: string | null;
  email: string;
  userEmail: string;
  userAvatar: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
  leftAt?: string | null;
  leftReason?: string | null;
  workEmail: string | null;
  workPhone: string | null;
}

export function PartnerStaffManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({ email: '', role: 'staff' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch all team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['staff', 'team'],
    queryFn: async () => {
      const res = await fetch('/api/partner/staff');
      if (!res.ok) throw new Error('Failed to fetch team');
      return res.json();
    },
  });

  const team: TeamMember[] = teamData?.data || [];
  const activeTeam = team.filter(m => m.status === 'active');
  const formerTeam = team.filter(m => m.status === 'left');
  const pendingInvites = teamData?.invites || [];

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: typeof inviteFormData) => {
      const res = await fetch('/api/partner/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send invite');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'overview'] });
      toast({ title: 'Invite sent successfully' });
      setInviteFormData({ email: '', role: 'staff' });
      setShowInviteForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to send invite',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch('/api/partner/staff/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'remove', staffId: memberId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'overview'] });
      toast({ title: 'Member removed successfully' });
      setTimeout(() => {
        setDeleteModal({ open: false, member: null });
        setDeleteError(null);
      }, 1500);
    },
    onError: (error) => {
      setDeleteError((error as Error).message || 'Failed to remove member');
    },
  });

  // Cancel invite mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch('/api/partner/staff/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'cancel-invite', staffId: inviteId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel invite');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'overview'] });
      toast({ title: 'Invite cancelled' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to cancel invite',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const handleInvite = () => {
    if (!inviteFormData.email) {
      toast({ title: 'Email required', variant: 'destructive' });
      return;
    }
    inviteMutation.mutate(inviteFormData);
  };

  const handleOpenDeleteModal = (member: TeamMember) => {
    setDeleteModal({ open: true, member });
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteModal.member) return;
    removeMutation.mutate(deleteModal.member.id);
  };

  const handleCloseDeleteModal = () => {
    if (!removeMutation.isPending) {
      setDeleteModal({ open: false, member: null });
      setDeleteError(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-secondary/50 rounded-xl w-64" />
          <div className="h-96 bg-secondary/50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      
      {/* Header */}
      <section className="flex items-start justify-between gap-8">
        <div className="flex items-start gap-3">
          <Link
            href="/partner-dashboard/staff"
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors mt-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your staff members and their access levels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['staff', 'team'] })}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors flex-shrink-0"
          >
            {showInviteForm ? 'Cancel' : 'Invite Member'}
          </button>
        </div>
      </section>

      {/* Invite Form */}
      {showInviteForm && (
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Invite New Team Member</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send an invitation to join your dealership team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email Address
              </label>
              <input
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                placeholder="colleague@company.ae"
                className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0 placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Role
              </label>
              <Select value={inviteFormData.role} onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}>
                <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent capitalize">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteFormData.email}
              className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              onClick={() => {
                setShowInviteForm(false);
                setInviteFormData({ email: '', role: 'staff' });
              }}
              className="px-5 py-2 rounded-full border border-border/40 hover:bg-secondary/50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Pending Invites</h3>
            <span className="text-sm text-foreground font-medium">{pendingInvites.length}</span>
          </div>

          <div className="space-y-4">
            {pendingInvites.map((invite: any) => (
              <div 
                key={invite.id} 
                className="rounded-xl border border-border/40 p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <UserAvatar
                    name={invite.email}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited as {invite.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(invite.expiresAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Cancel this invitation?')) {
                        cancelInviteMutation.mutate(invite.id);
                      }
                    }}
                    disabled={cancelInviteMutation.isPending}
                    className="px-3 py-1 text-xs text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team List */}
      <section className="space-y-8">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Team Members</h3>
          <span className="text-sm text-foreground font-medium">{activeTeam.length}</span>
        </div>

        {activeTeam.length === 0 ? (
          <div className="text-center py-24 rounded-xl border border-border">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-6">No team members yet</p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
            >
              Invite First Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTeam.map((member) => (
              <div 
                key={member.id} 
                className="rounded-xl border border-border/40 p-6 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Member Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <UserAvatar
                      src={member.userAvatar}
                      name={member.displayName || member.userEmail || member.email}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-medium truncate">
                          {member.displayName || 'No display name'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{member.userEmail || member.email}</p>
                      </div>
                      
                      {member.workEmail && member.workEmail !== member.userEmail && (
                        <p className="text-xs text-muted-foreground">Work: {member.workEmail}</p>
                      )}

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-muted border border-border/40 text-xs text-muted-foreground capitalize">
                          {member.role}
                        </span>
                        
                        {member.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleOpenDeleteModal(member)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Former Staff */}
      {formerTeam.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight text-muted-foreground">Former Team Members</h3>
            <span className="text-sm text-muted-foreground font-medium">{formerTeam.length}</span>
          </div>

          <div className="space-y-4">
            {formerTeam.map((member) => (
              <div 
                key={member.id} 
                className="rounded-xl border border-border/50 bg-muted/20 p-6"
              >
                <div className="flex items-start gap-4">
                  <UserAvatar
                    src={member.userAvatar}
                    name={member.displayName || member.userEmail || member.email}
                    size="lg"
                    className="flex-shrink-0 opacity-60"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="font-medium truncate text-muted-foreground">
                        {member.displayName || 'No display name'}
                      </p>
                      <p className="text-sm text-muted-foreground/70 truncate">{member.userEmail || member.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-muted border border-border/40 text-xs text-muted-foreground capitalize">
                        Was: {member.role}
                      </span>
                      
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserMinus className="w-3 h-3" />
                        Left
                      </span>

                      {member.leftAt && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70">
                          <Clock className="w-3 h-3" />
                          {new Date(member.leftAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {member.leftReason && (
                      <p className="text-xs text-muted-foreground/70 italic">
                        Reason: "{member.leftReason}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Role Descriptions */}
      <section className="space-y-8">
        <div className="border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Understanding Roles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/40 p-6 space-y-2 bg-card">
            <h4 className="font-medium">Owner</h4>
            <p className="text-sm text-muted-foreground">
              As an owner you get to know all stats and understand about your business. Full access to everything including business settings and team management.
            </p>
          </div>

          <div className="rounded-xl border border-border/40 p-6 space-y-2 bg-card">
            <h4 className="font-medium">Staff</h4>
            <p className="text-sm text-muted-foreground">
              As a staff member, they can do all the operations for you including managing listings, responding to inquiries, and handling day-to-day tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <StaffDeleteModal
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        memberName={deleteModal.member?.displayName || ''}
        memberEmail={deleteModal.member?.email || deleteModal.member?.userEmail || ''}
        isLoading={removeMutation.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
