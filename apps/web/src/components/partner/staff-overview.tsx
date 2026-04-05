/**
 * Staff Overview Component
 * Dashboard for staff members - quick actions, stats, team preview
 * V1: Uses single API call for all data (optimized from 3 calls)
 */
'use client';

import Link from 'next/link';
import { Users, Clock, ArrowRight, RefreshCw, Mail, UserPlus } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  manager: { color: 'text-primary', bg: 'bg-primary-muted' },
  staff: { color: 'text-foreground', bg: 'bg-secondary' },
};

export function StaffOverview({ initialData }: { initialData: StaffOverviewData }) {
  const router = useRouter();
  const data = initialData;
  const isLoading = false;
  const isRefetching = false;

  const stats = data?.stats ?? null;
  const team = data?.data?.filter(m => m.status !== 'invited') ?? [];
  const invites = data?.invites ?? [];

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.staff;
    return config;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-callout sm:text-headline font-semibold text-foreground">Staff</h1>
          <p className="text-caption2 sm:text-caption1 text-muted-foreground/60 mt-0.5">Manage your team members and access</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.refresh()}
            disabled={isRefetching}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefetching && "animate-spin")} />
          </button>
        </div>
      </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-10">
            <div>
              <span className="text-caption1 text-muted-foreground">Total</span>
              <p className="text-title3 font-semibold tracking-tight mt-1">{stats.totalStaff}</p>
            </div>
            <div>
              <span className="text-caption1 text-muted-foreground">Active</span>
              <p className="text-title3 font-semibold tracking-tight mt-1 text-success">{stats.activeStaff}</p>
            </div>
            <div>
              <span className="text-caption1 text-muted-foreground">Pending</span>
              <p className="text-title3 font-semibold tracking-tight mt-1 text-warning">{stats.pendingInvites}</p>
            </div>
            <div>
              <span className="text-caption1 text-muted-foreground">Managers</span>
              <p className="text-title3 font-semibold tracking-tight mt-1 text-primary">{stats.managers}</p>
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-12">
        <Link
          href="/partner-dashboard/staff/manage"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-subhead hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Manage Team
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-6">
          {/* Stats Skeleton */}
          <div className="flex items-center gap-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-7 w-8" />
              </div>
            ))}
          </div>
          
          {/* Team List Skeleton */}
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 -mx-4 rounded-xl">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      {!isLoading && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-caption1 text-muted-foreground">
              {team.length} team member{team.length !== 1 ? 's' : ''}
            </p>
            <Link
              href="/partner-dashboard/staff/manage"
              className="text-caption1 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users className="w-10 h-10 text-muted-foreground/20 mb-4" />
              <h3 className="text-headline tracking-tight">No team members yet</h3>
              <p className="text-subhead text-muted-foreground mt-1">Start by inviting your first staff member</p>
              <Link
                href="/partner-dashboard/staff/manage"
                className="mt-6 px-4 py-2 rounded-full bg-primary text-white text-subhead hover:bg-primary/90 transition-colors"
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
                      <p className="text-subhead tracking-tight truncate">
                        {member.userName || 'Unknown'}
                      </p>
                      <p className="text-caption1 text-muted-foreground truncate">
                        {member.userEmail || member.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-caption1 capitalize",
                        roleBadge.bg,
                        roleBadge.color
                      )}>
                        {member.role}
                      </span>
                      {member.joinedAt && (
                        <span className="text-caption1 text-muted-foreground hidden sm:block">
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
                  <p className="text-caption1 text-muted-foreground">
                    {invites.length} pending invite{invites.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  href="/partner-dashboard/staff/manage"
                  className="text-caption1 text-muted-foreground hover:text-foreground transition-colors"
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
                    <div className="w-10 h-10 rounded-full bg-warning-muted flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-warning" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-subhead tracking-tight truncate">
                        {invite.email}
                      </p>
                      <p className="text-caption1 text-muted-foreground">
                        Invited as <span className="capitalize">{invite.role}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-warning" />
                      <span className="text-caption1 text-muted-foreground">
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
    </div>
  );
}
