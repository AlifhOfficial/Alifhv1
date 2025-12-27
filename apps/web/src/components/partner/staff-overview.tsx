/**
 * Staff Overview Component
 * Dashboard for staff members - quick actions, stats, team preview
 * V1: Uses single API call for all data (optimized from 3 calls)
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Clock, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  pendingInvites: number;
  managers: number;
}

interface TeamMember {
  id: string;
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

export function StaffOverview() {
  // V1: Single API call returns staff, stats, and invites
  const { data } = useQuery<StaffOverviewData>({
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/partner-dashboard"
                className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Staff</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Manage your team members and their access
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Quick Actions */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/partner-dashboard/staff/manage"
              className="group p-6 bg-card border border-border/40 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-medium text-foreground">
                    Manage Team
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove staff members
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>

            <Link
              href="/partner-dashboard/staff/profile"
              className="group p-6 bg-card border border-border/40 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-medium text-foreground">
                    Your Profile
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Edit your work identity
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Stats */}
        {stats && (
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Team Stats</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/40 divide-x divide-border/40">
              <div className="p-8 flex flex-col gap-2">
                <small className="text-muted-foreground">Total Staff</small>
                <h2 className="text-foreground">{stats.totalStaff}</h2>
              </div>
              <div className="p-8 flex flex-col gap-2">
                <small className="text-muted-foreground">Active</small>
                <h2 className="text-foreground">{stats.activeStaff}</h2>
              </div>
              <div className="p-8 flex flex-col gap-2">
                <small className="text-muted-foreground">Pending</small>
                <h2 className="text-foreground">{stats.pendingInvites}</h2>
              </div>
              <div className="p-8 flex flex-col gap-2">
                <small className="text-muted-foreground">Managers</small>
                <h2 className="text-foreground">{stats.managers}</h2>
              </div>
            </div>
          </section>
        )}

        {/* Team Preview */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Recent Team Members</h3>
            <Link
              href="/partner-dashboard/staff/manage"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <Link
                href="/partner-dashboard/staff/manage"
                className="mt-4 px-5 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                Invite Team Member
              </Link>
            </div>
          ) : (
            <div className="space-y-0 border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">
              {team.map((member) => (
                <div key={member.id} className="p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <UserAvatar
                      src={member.userAvatar}
                      name={member.displayName || member.userEmail || member.email}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.displayName || 'No display name'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{member.userEmail || member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-muted border border-border/40 text-xs text-muted-foreground capitalize">
                      {member.role}
                    </span>
                    {member.joinedAt && (
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {new Date(member.joinedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h3 className="text-lg font-medium tracking-tight">Pending Invites</h3>
              <Link
                href="/partner-dashboard/staff/manage"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Manage invites
              </Link>
            </div>

            <div className="rounded-xl border border-border/40 divide-y divide-border/40">
              {invites.map((invite) => (
                <div key={invite.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <UserAvatar
                      name={invite.email}
                      size="sm"
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
                      <span className="text-xs text-muted-foreground">
                        {new Date(invite.expiresAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
