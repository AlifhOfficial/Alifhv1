/**
 * Staff Management Component
 * Full team management - invite, remove, edit roles
 * Following profile-view minimal design system
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, User, UserMinus, Clock } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
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
  const [inviteFormData, setInviteFormData] = useState({ email: '', role: 'sales' });

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
      queryClient.invalidateQueries({ queryKey: ['staff', 'pending-invites'] });
      toast({ title: 'Invite sent successfully' });
      setInviteFormData({ email: '', role: 'sales' });
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
      toast({ title: 'Member removed' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove member',
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

  const handleRemove = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeMutation.mutate(memberId);
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
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your staff members and their access levels
          </p>
        </div>

        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors flex-shrink-0"
        >
          {showInviteForm ? 'Cancel' : 'Invite Member'}
        </button>
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
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteFormData.email}
              className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              onClick={() => {
                setShowInviteForm(false);
                setInviteFormData({ email: '', role: 'sales' });
              }}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors"
            >
              Cancel
            </button>
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
              className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
            >
              Invite First Member
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTeam.map((member) => (
              <div 
                key={member.id} 
                className="rounded-xl border border-border p-6 hover:bg-secondary/10 transition-colors"
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
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium capitalize">
                          {member.role}
                        </span>
                        
                        {member.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-green-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removeMutation.isPending}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group disabled:opacity-50"
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
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium capitalize">
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
          <h3 className="text-lg font-medium tracking-tight">Role Permissions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-6 space-y-2">
            <h4 className="font-medium">Sales</h4>
            <p className="text-sm text-muted-foreground">
              Can manage listings, respond to inquiries, and view analytics. No access to settings or team management.
            </p>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-2">
            <h4 className="font-medium">Manager</h4>
            <p className="text-sm text-muted-foreground">
              Full access to listings and team operations. Can invite/remove sales staff. Cannot modify business profile.
            </p>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-2">
            <h4 className="font-medium">Admin</h4>
            <p className="text-sm text-muted-foreground">
              Complete control over dealership account, including business profile, billing, and all team operations.
            </p>
          </div>

          <div className="rounded-xl border border-border p-6 space-y-2">
            <h4 className="font-medium">Viewer</h4>
            <p className="text-sm text-muted-foreground">
              Read-only access to listings and analytics. Cannot modify anything or respond to inquiries.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
