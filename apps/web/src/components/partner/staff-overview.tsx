/**
 * Staff Overview Component
 * Dashboard for staff members - quick actions, stats, team preview
 * V1: Uses single API call for all data (optimized from 3 calls)
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Clock, ArrowRight, RefreshCw, Mail, UserPlus } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { cn } from '@/lib/utils';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  pendingInvites: number;
  managers: number;
}

interface TeamMember {
  id: string;
  userName?: string | null;
  displayName: string | null;
  email: string;
  userEmail?: string;
  userAvatar?: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

interface StaffOverviewData {
  data: TeamMember[];
  stats: StaffStats;
  invites: PendingInvite[];
}

// Role badge config
const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  owner: { color: 'text-purple-600', bg: 'bg-purple-500/10' },
  manager: { color: 'text-blue-600', bg: 'bg-blue-500/10' },
  staff: { color: 'text-foreground', bg: 'bg-secondary' },
};

export function StaffOverview() {
  // V1: Single API call returns staff, stats, and invites
  const { data, isLoading, refetch, isRefetching } = useQuery<StaffOverviewData>({
    queryKey: ['staff', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/partner/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      return res.json();
    },
  });

  const stats = data?.stats ?? null;
  const team = data?.data?.filter(m => m.status !== 'invited') ?? [];
  const invites = data?.invites ?? [];

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.staff;
    return config;
  };

  return (
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="Staff"
        description="Manage your team members and access"
      >
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefetching && "animate-spin")} />
        </button>
      </DashboardPageHeader>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-10">
            <div>
              <span className="text-xs text-muted-foreground">Total</span>
              <p className="text-xl font-semibold tracking-tight mt-1">{stats.totalStaff}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Active</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-green-500">{stats.activeStaff}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Pending</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-yellow-500">{stats.pendingInvites}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Managers</span>
              <p className="text-xl font-semibold tracking-tight mt-1 text-blue-500">{stats.managers}</p>
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-12">
        <Link
          href="/partner-dashboard/staff/manage"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Manage Team
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground mt-4">Loading...</p>
        </div>
      )}

      {/* Team Members */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted-foreground">
              {team.length} team member{team.length !== 1 ? 's' : ''}
            </p>
            <Link
              href="/partner-dashboard/staff/manage"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users className="w-10 h-10 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium tracking-tight">No team members yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Start by inviting your first staff member</p>
              <Link
                href="/partner-dashboard/staff/manage"
                className="mt-6 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Invite Team Member
              </Link>
            </div>
          ) : (
            <div className="space-y-1 mb-12">
              {team.map((member) => {
                const roleBadge = getRoleBadge(member.role);
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
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium capitalize",
                        roleBadge.bg,
                        roleBadge.color
                      )}>
                        {member.role}
                      </span>
                      {member.joinedAt && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {new Date(member.joinedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6 pt-8 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {invites.length} pending invite{invites.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href="/partner-dashboard/staff/manage"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-1">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-yellow-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium tracking-tight truncate">
                        {invite.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited as <span className="capitalize">{invite.role}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">
                        Expires {new Date(invite.expiresAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DashboardPageWrapper>
  );
}
