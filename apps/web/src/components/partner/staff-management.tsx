/**
 * Staff Management Component
 * Full team management - invite, remove, edit roles
 * Minimal macOS-style design
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Trash2, Mail, User, UserMinus, Clock, RefreshCw, Search, X, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { StaffDeleteModal } from './staff-delete-modal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: string;
  userName: string | null;
  displayName: string | null;
  email: string;
  userEmail: string;
  userAvatar: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
  leftAt?: string | null;
  leftReason?: string | null;
  workPhone: string | null;
}

// Role badge config
const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  owner: { color: 'text-purple-600', bg: 'bg-purple-500/10' },
  manager: { color: 'text-blue-600', bg: 'bg-blue-500/10' },
  staff: { color: 'text-foreground', bg: 'bg-secondary' },
};

export function PartnerStaffManagement({ initialTeamData }: { initialTeamData: any }) {
  const { toast } = useToast();
  const router = useRouter();
  
  // UI State
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showFormerStaff, setShowFormerStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteFormData, setInviteFormData] = useState({ 
    email: '', 
    role: 'staff',
    title: '',
    department: ''
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const teamData = initialTeamData;
  const isLoading = false;
  const isRefetching = false;

  const team: TeamMember[] = teamData?.data || [];
  const activeTeam = team.filter(m => m.status === 'active');
  const formerTeam = team.filter(m => m.status === 'left');
  const pendingInvites = teamData?.invites || [];

  // Filter by search
  const filteredActiveTeam = useMemo(() => {
    if (!searchQuery.trim()) return activeTeam;
    const query = searchQuery.toLowerCase();
    return activeTeam.filter(m => 
      (m.userName || '').toLowerCase().includes(query) ||
      (m.userEmail || m.email || '').toLowerCase().includes(query)
    );
  }, [activeTeam, searchQuery]);

  const filteredFormerTeam = useMemo(() => {
    if (!searchQuery.trim()) return formerTeam;
    const query = searchQuery.toLowerCase();
    return formerTeam.filter(m => 
      (m.userName || '').toLowerCase().includes(query) ||
      (m.userEmail || m.email || '').toLowerCase().includes(query)
    );
  }, [formerTeam, searchQuery]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
  }, []);

  const hasActiveFilters = searchQuery.trim() !== '';

  // Get role badge
  const getRoleBadge = (role: string) => {
    return ROLE_CONFIG[role] || ROLE_CONFIG.staff;
  };

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
      toast({ title: 'Invite sent successfully' });
      setInviteFormData({ email: '', role: 'staff', title: '', department: '' });
      setShowInviteForm(false);
      router.refresh();
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
      toast({ title: 'Member removed successfully' });
      setTimeout(() => {
        setDeleteModal({ open: false, member: null });
        setDeleteError(null);
        router.refresh();
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
      toast({ title: 'Invite cancelled' });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Failed to cancel invite',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ staffId, role }: { staffId: string; role: string }) => {
      const res = await fetch('/api/partner/staff/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'update', staffId, role }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update role');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Role updated' });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update role',
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
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Back */}
        <Skeleton className="h-4 w-12 mb-6" />
        
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-start justify-between mb-8">
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          </div>
        </header>

        {/* Staff List Skeletons */}
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 -mx-4 rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Back */}
      <Link 
        href="/partner-dashboard/staff"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Staff
      </Link>

      {/* Header */}
      <header className="mb-16">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage staff members and access levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              disabled={isRefetching}
              className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefetching && "animate-spin")} />
            </button>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-10">
          <div>
            <span className="text-xs text-muted-foreground">Active</span>
            <p className="text-xl font-semibold tracking-tight mt-1 text-green-500">{activeTeam.length}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Pending</span>
            <p className="text-xl font-semibold tracking-tight mt-1 text-yellow-500">{pendingInvites.length}</p>
          </div>
          {formerTeam.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Former</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-muted-foreground">{formerTeam.length}</p>
            </div>
          )}
        </div>
      </header>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="mb-12 p-6 rounded-xl bg-secondary/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium tracking-tight">Invite New Member</h3>
            <button
              onClick={() => setShowInviteForm(false)}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                placeholder="colleague@company.ae"
                className="w-full h-10 px-3 rounded-xl bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Role</label>
              <Select value={inviteFormData.role} onValueChange={(value) => setInviteFormData({ ...inviteFormData, role: value })}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-0">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Title (optional)</label>
              <input
                type="text"
                value={inviteFormData.title}
                onChange={(e) => setInviteFormData({ ...inviteFormData, title: e.target.value })}
                placeholder="Sales Manager"
                className="w-full h-10 px-3 rounded-xl bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Department (optional)</label>
              <input
                type="text"
                value={inviteFormData.department}
                onChange={(e) => setInviteFormData({ ...inviteFormData, department: e.target.value })}
                placeholder="Sales"
                className="w-full h-10 px-3 rounded-xl bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteFormData.email}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </button>
            <button
              onClick={() => {
                setShowInviteForm(false);
                setInviteFormData({ email: '', role: 'staff', title: '', department: '' });
              }}
              className="px-4 py-2 rounded-full text-sm hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-yellow-500" />
            <p className="text-xs text-muted-foreground">
              {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-1">
            {pendingInvites.map((invite: any) => (
              <div 
                key={invite.id} 
                className="flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-yellow-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tracking-tight truncate">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited as <span className="capitalize">{invite.role}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(invite.expiresAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button
                    onClick={() => cancelInviteMutation.mutate(invite.id)}
                    disabled={cancelInviteMutation.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team List */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground">
          {filteredActiveTeam.length} active member{filteredActiveTeam.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredActiveTeam.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          {searchQuery ? (
            <>
              <Search className="w-10 h-10 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium tracking-tight">No results</h3>
              <p className="text-sm text-muted-foreground mt-1">Try a different search</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-foreground hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <User className="w-10 h-10 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium tracking-tight">No team members yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Start by inviting your first member</p>
              <button
                onClick={() => setShowInviteForm(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredActiveTeam.map((member) => {
            return (
              <div 
                key={member.id} 
                className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <UserAvatar
                  src={member.userAvatar}
                  name={member.userName || member.userEmail || member.email}
                  size="md"
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tracking-tight truncate">
                    {member.userName || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.userEmail || member.email}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={member.role}
                    onValueChange={(newRole) => updateRoleMutation.mutate({ staffId: member.id, role: newRole })}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs font-medium border-0 bg-secondary/50 hover:bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Staff</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground hidden sm:block">Active</span>
                  </div>

                  <button
                    onClick={() => handleOpenDeleteModal(member)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Former Staff Toggle */}
      {formerTeam.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border/20">
          <button
            onClick={() => setShowFormerStaff(!showFormerStaff)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFormerStaff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {filteredFormerTeam.length} former member{filteredFormerTeam.length !== 1 ? 's' : ''}
          </button>

          {showFormerStaff && (
            <div className="space-y-1 mt-4">
              {filteredFormerTeam.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 -mx-4 rounded-xl opacity-60"
                >
                  <UserAvatar
                    src={member.userAvatar}
                    name={member.userName || member.userEmail || member.email}
                    size="md"
                    className="flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium tracking-tight truncate text-muted-foreground">
                      {member.userName || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {member.userEmail || member.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-muted-foreground capitalize">
                      Was: {member.role}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <UserMinus className="w-3.5 h-3.5 text-muted-foreground" />
                      {member.leftAt && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(member.leftAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role Info - Collapsible */}
      <div className="mt-12 pt-8 border-t border-border/20">
        <p className="text-xs text-muted-foreground mb-4">Role permissions</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-600">Owner</span>
            <span className="text-xs text-muted-foreground">Full access including settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-foreground">Staff</span>
            <span className="text-xs text-muted-foreground">Listings, inquiries, day-to-day tasks</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <StaffDeleteModal
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        memberName={deleteModal.member?.userName || ''}
        memberEmail={deleteModal.member?.userEmail || deleteModal.member?.email || ''}
        isLoading={removeMutation.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
