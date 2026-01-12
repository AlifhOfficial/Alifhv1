/**
 * User Requests Hub
 * Partner applications and staff invites
 * Follows settings-view minimal design system
 */
'use client';

import { useState } from 'react';
import { PartnerApplicationForm } from './partner-application-form';
import { UserStaffInvites } from './user-staff-invites';
import { usePartnerRequest } from '@/hooks/partner';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';
import { ArrowRight, Loader2, ArrowLeft, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type View = 'overview' | 'apply' | 'invites';

export function UserRequestsHub() {
  const [view, setView] = useState<View>('overview');
  const { session: user } = useAuth();
  const { data: partnerRequest, isLoading: loadingPartner } = usePartnerRequest();
  
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

  // Sub-views
  if (view === 'apply') {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <button 
            onClick={() => setView('overview')} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <PartnerApplicationForm />
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
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <UserStaffInvites />
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Partner applications and staff invitations</p>
        </div>

        {/* Partner Application */}
        <section>
          <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Partner Application</h3>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            
            {/* No application - but user is already a partner owner */}
            {!partnerRequest && partnerMembership && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">You're a Partner</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Your partner account for {partnerMembership.partnerName} is active
                  </p>
                  <Link
                    href="/partner-dashboard/insights"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-semibold mt-3 transition-colors"
                  >
                    Go to Partner Dashboard
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
            
            {/* No application and not a partner */}
            {!partnerRequest && !partnerMembership && (
              <button
                onClick={() => setView('apply')}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Become a Partner</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Join the UAE's most transparent car marketplace</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            )}

            {/* Pending */}
            {partnerRequest?.status === 'pending' && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Under Review</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Your application for {partnerRequest.companyNameLegal} is being reviewed
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-2">
                    Submitted {new Date(partnerRequest.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {/* Rejected - Clean and simple */}
            {partnerRequest?.status === 'rejected' && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Application Not Approved</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {partnerRequest.companyNameLegal}
                    </p>
                  </div>
                </div>
                
                {partnerRequest.rejectionReason && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1.5">Reason</p>
                    <p className="text-sm text-foreground leading-relaxed">{partnerRequest.rejectionReason}</p>
                  </div>
                )}
                
                <button
                  onClick={() => setView('apply')}
                  className="w-full py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
                >
                  Apply Again
                </button>
              </div>
            )}

            {/* Approved - Direct access to dashboard */}
            {partnerRequest?.status === 'approved' && partnerMembership && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">You're All Set</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Your partner account for {partnerMembership.partnerName} is active
                  </p>
                  <Link
                    href="/partner-dashboard/insights"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-semibold mt-3 transition-colors"
                  >
                    Go to Partner Dashboard
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Staff Invitations */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold tracking-tight text-foreground">Staff Invitations</h3>
            {inviteCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-muted/40 text-xs font-semibold">{inviteCount}</span>
            )}
          </div>
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            {inviteCount > 0 ? (
              <button
                onClick={() => setView('invites')}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inviteCount} Pending Invitation{inviteCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Review and respond to invitations</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground/60">No pending invitations</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
