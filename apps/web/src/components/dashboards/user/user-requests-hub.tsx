/**
 * User Requests Hub
 * Partner applications and staff invites
 * Clean typography-first design, no icons
 */
'use client';

import { useState, useEffect } from 'react';
import { PartnerApplicationForm } from './partner-application-form';
import { UserStaffInvites } from './user-staff-invites';
import { usePartnerRequest, usePartnerRequestCancel } from '@/hooks/partner';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { cn } from '@/utils';

type View = 'overview' | 'apply' | 'invites';

// ============================================================================
// Shared Components
// ============================================================================

function SectionHeader({ 
  title, 
  subtitle 
}: { 
  title: string; 
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatusPill({ 
  status, 
  label 
}: { 
  status: 'success' | 'warning' | 'error' | 'neutral';
  label: string;
}) {
  const styles = {
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400',
    neutral: 'bg-muted/50 text-muted-foreground',
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold",
      styles[status]
    )}>
      {label}
    </span>
  );
}

function ActionRow({
  title,
  description,
  onClick,
  href,
  trailing,
}: {
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  trailing?: React.ReactNode;
}) {
  const content = (
    <div className={cn(
      "flex items-center justify-between py-3 -mx-5 px-5 rounded-lg transition-colors",
      (onClick || href) && "hover:bg-muted/30 cursor-pointer"
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>}
      </div>
      {trailing}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>;
  }

  return content;
}

// ============================================================================
// Main Component
// ============================================================================

export function UserRequestsHub() {
  const [view, setView] = useState<View>('overview');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { session: user } = useAuth();
  const { data: partnerRequest, isLoading: loadingPartner } = usePartnerRequest();
  const { cancel, isCancelling } = usePartnerRequestCancel();
  
  const { data: invitesData, isLoading: loadingInvites } = useQuery({
    queryKey: ['user', 'staff-invites'],
    queryFn: async () => {
      const res = await fetch('/api/user/staff-invites');
      if (!res.ok) throw new Error('Failed to fetch invites');
      return res.json();
    },
  });
  
  const inviteCount = invitesData?.data?.length || 0;
  const isLoading = loadingPartner || loadingInvites;

  // Check if user is already a partner owner
  const userWithPartner = user as any;
  const partnerMembership = userWithPartner?.partnerMemberships?.find((m: any) => m.staffRole === 'owner');
  
  // Check if there's already an active request
  const hasActiveRequest = partnerRequest && 
    (partnerRequest.status === 'pending' || partnerRequest.status === 'approved');

  // Auto-switch to overview if we're on apply view but there's an active request
  useEffect(() => {
    if (view === 'apply' && hasActiveRequest) {
      setView('overview');
    }
  }, [view, hasActiveRequest]);

  // ============================================================================
  // Sub-views
  // ============================================================================
  
  if (view === 'apply' && !hasActiveRequest) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <button 
            onClick={() => setView('overview')} 
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <PartnerApplicationForm onSuccess={() => setView('overview')} />
        </div>
      </div>
    );
  }

  if (view === 'invites') {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <button 
            onClick={() => setView('overview')} 
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <UserStaffInvites />
        </div>
      </div>
    );
  }

  // ============================================================================
  // Loading State
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="h-7 w-32 bg-muted/40 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-border/40 bg-sidebar p-5 h-24 animate-pulse" />
              <div className="rounded-xl border border-border/40 bg-sidebar p-5 h-24 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render Partner Status
  // ============================================================================
  
  const renderPartnerContent = () => {
    // Already a partner (no pending request)
    if (!partnerRequest && partnerMembership) {
      return (
        <ActionRow
          title="Partner Account"
          description={partnerMembership.partnerName}
          href="/partner-dashboard/insights"
          trailing={
            <span className="text-sm font-medium text-primary">Open →</span>
          }
        />
      );
    }
    
    // No application and not a partner - CTA to apply
    if (!partnerRequest && !partnerMembership) {
      return (
        <ActionRow
          title="Become a Partner"
          description="List vehicles and grow your business"
          onClick={() => setView('apply')}
          trailing={
            <span className="text-sm font-medium text-primary">Apply →</span>
          }
        />
      );
    }

    // Pending application
    if (partnerRequest?.status === 'pending') {
      return (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground">Application Under Review</p>
              <StatusPill status="warning" label="Pending" />
            </div>
            <p className="text-xs text-muted-foreground/70">{partnerRequest.companyNameLegal}</p>
          </div>
          
          <div className="rounded-lg bg-muted/20 p-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-medium text-muted-foreground/70">Submitted</span>
              <span className="font-semibold text-foreground">
                {new Date(partnerRequest.createdAt).toLocaleDateString('en-AE', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/60 text-center">
            We typically respond within 2-3 business days
          </p>
          
          {/* Cancel Application */}
          <div className="pt-3 border-t border-border/20">
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
              >
                Cancel Application
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-center text-muted-foreground">
                  Are you sure? You'll need to reapply if you cancel.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    disabled={isCancelling}
                    className="flex-1 py-2.5 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => cancel()}
                    disabled={isCancelling}
                    className="flex-1 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Rejected application
    if (partnerRequest?.status === 'rejected') {
      return (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-foreground mb-1">Application Not Approved</p>
            <p className="text-sm text-muted-foreground">
              {partnerRequest.rejectionReason || "Unfortunately, we couldn't approve your application at this time."}
            </p>
          </div>
          
          <button
            onClick={() => setView('apply')}
            className="flex items-center justify-between w-full py-3 -mx-5 px-5 rounded-lg hover:bg-muted/30 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-foreground">Try Again</p>
              <p className="text-xs text-muted-foreground/70">Submit a new application</p>
            </div>
            <span className="text-sm font-medium text-primary">Apply →</span>
          </button>
        </div>
      );
    }

    // Approved with partner membership
    if (partnerRequest?.status === 'approved' && partnerMembership) {
      return (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-foreground mb-1">Welcome to Alifh Partners</p>
            <p className="text-sm text-muted-foreground">Your application was approved. You're all set.</p>
          </div>
          
          <Link
            href="/partner-dashboard/insights"
            className="flex items-center justify-between py-3 -mx-5 px-5 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{partnerMembership.partnerName}</p>
              <p className="text-xs text-muted-foreground/70">Partner Dashboard</p>
            </div>
            <span className="text-sm font-medium text-primary">Open →</span>
          </Link>
        </div>
      );
    }

    return null;
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Partner applications and team invitations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 border border-border/40 divide-x divide-border/40 bg-sidebar rounded-xl">
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Partner Status</span>
            <span className="text-sm font-bold text-foreground">
              {partnerMembership ? 'Active' : 
               partnerRequest?.status === 'pending' ? 'Pending' :
               partnerRequest?.status === 'rejected' ? 'Not Approved' : 'Not Applied'}
            </span>
          </div>
          <div className="p-5 flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70">Invitations</span>
            <span className="text-sm font-bold text-foreground">
              {inviteCount > 0 ? `${inviteCount} pending` : 'None'}
            </span>
          </div>
        </div>

        {/* Partner Application Section */}
        <section>
          <SectionHeader title="Partner Application" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            {renderPartnerContent()}
          </div>
        </section>

        {/* Staff Invitations Section */}
        <section>
          <SectionHeader 
            title="Staff Invitations"
            subtitle={inviteCount > 0 ? `${inviteCount} pending` : undefined}
          />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            {inviteCount > 0 ? (
              <ActionRow
                title={`${inviteCount} Pending Invitation${inviteCount !== 1 ? 's' : ''}`}
                description="You've been invited to join a partner team"
                onClick={() => setView('invites')}
                trailing={
                  <span className="text-sm font-medium text-primary">View</span>
                }
              />
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground/60 mb-1">No pending invitations</p>
                <p className="text-xs text-muted-foreground/40">
                  Team invites will appear here
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
