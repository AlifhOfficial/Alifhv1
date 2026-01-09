/**
 * User Requests Hub Component
 * Central location for partner applications and staff invites
 * Following profile-view minimal design system
 */
'use client';

import { useState } from 'react';
import { PartnerApplicationForm } from './partner-application-form';
import { PartnerApplicationStatus } from './partner-application-status';
import { UserStaffInvites } from './user-staff-invites';
import { usePartnerRequest, usePartnerRequestDismiss, type PartnerRequest } from '@/hooks/partner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, ArrowLeft, RefreshCw, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';

// ============================================================================
// Types
// ============================================================================

type TabType = 'overview' | 'partner-application' | 'staff-invites';

interface RejectedApplicationCardProps {
  request: PartnerRequest;
  onDismiss: () => void;
  onReapply: () => void;
}

// ============================================================================
// Rejected Application Card Component
// ============================================================================

/**
 * Shows rejected partner application with dismiss option
 */
const RejectedApplicationCard = ({ request, onDismiss, onReapply }: RejectedApplicationCardProps) => {
  const { dismiss, isDismissing } = usePartnerRequestDismiss();
  const { toast } = useToast();

  const handleDismiss = () => {
    dismiss(undefined, {
      onSuccess: () => {
        toast({
          title: 'Application Dismissed',
          description: 'The rejected application has been cleared from your dashboard.',
        });
        onDismiss();
      },
      onError: (error) => {
        toast({
          title: 'Failed to Dismiss',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="bg-sidebar rounded-xl border border-border/40 p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold tracking-tight text-foreground mb-1.5">Application Not Approved</h4>
          <p className="text-[15px] font-medium text-muted-foreground/70 leading-relaxed mb-3">
            Your application for <span className="font-semibold text-foreground">{request.companyNameLegal}</span> was not approved.
          </p>
          {request.rejectionReason && (
            <div className="bg-muted/30 rounded-lg p-3 mb-4 border border-border/40">
              <p className="text-xs font-semibold tracking-tight text-muted-foreground/70 mb-1.5">Feedback</p>
              <p className="text-[15px] font-medium text-foreground">{request.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onReapply}
          className="flex-1 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-tight transition-colors"
        >
          Submit New Application
        </button>
        <button
          onClick={handleDismiss}
          disabled={isDismissing}
          className="px-5 py-2.5 rounded-full border border-border/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground font-semibold text-sm tracking-tight transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isDismissing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dismissing...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Dismiss
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function UserRequestsHub() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const queryClient = useQueryClient();
  
  // Get partner request status
  const { data: partnerRequest, isLoading: loadingPartner } = usePartnerRequest();
  
  // Get staff invites count
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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'partner-application':
        return <PartnerApplicationForm />;
      case 'staff-invites':
        return <UserStaffInvites />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="space-y-10">
        
        {/* Partner Application Section */}
        <section className="space-y-4">
          <div>
            <h3 className="text-[15px] font-bold tracking-tight">Partner Application</h3>
            <p className="text-[15px] font-medium text-muted-foreground/70 mt-1.5">Apply to become a verified dealership partner</p>
          </div>
          
          {/* Show status for pending/approved requests */}
          {partnerRequest && (partnerRequest.status === 'pending' || partnerRequest.status === 'approved') ? (
            <PartnerApplicationStatus />
          ) : partnerRequest?.status === 'rejected' ? (
            <RejectedApplicationCard 
              request={partnerRequest}
              onDismiss={() => {
                queryClient.invalidateQueries({ queryKey: ['partner', 'request'] });
              }}
              onReapply={() => setActiveTab('partner-application')}
            />
          ) : (
            <button
              onClick={() => setActiveTab('partner-application')}
              className="group w-full p-6 rounded-xl border border-border/40 hover:border-border/60 transition-all text-left bg-sidebar"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <h4 className="font-semibold tracking-tight">Become a Partner</h4>
                  <p className="text-[15px] font-medium text-muted-foreground/70">
                    Join the UAE's most transparent car marketplace
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          )}
        </section>

        {/* Staff Invites Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-[15px] font-bold tracking-tight">Staff Invitations</h3>
              <p className="text-[15px] font-medium text-muted-foreground/70 mt-1.5">Invitations from dealership partners</p>
            </div>
            {inviteCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-muted/40 text-xs font-semibold tracking-tight">{inviteCount}</span>
            )}
          </div>
          
          {inviteCount > 0 ? (
            <button
              onClick={() => setActiveTab('staff-invites')}
              className="group w-full p-6 rounded-xl border border-border/40 hover:border-border/60 transition-all text-left bg-sidebar"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <h4 className="font-semibold tracking-tight">
                    {inviteCount} Pending Invitation{inviteCount !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-[15px] font-medium text-muted-foreground/70">
                    Review and respond to invitations
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          ) : (
            <div className="p-8 rounded-xl border border-border/40 bg-sidebar text-center">
              <p className="text-[15px] font-medium text-muted-foreground/60">No pending invitations</p>
            </div>
          )}
        </section>

      </div>
    );
  };

  return (
    <DashboardPageWrapper>
      
      {/* Page Header */}
      {activeTab === 'overview' ? (
        <DashboardPageHeader
          title="Requests"
          description="Partner applications and staff invitations"
        >
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['partner', 'request'] });
              queryClient.invalidateQueries({ queryKey: ['user', 'staff-invites'] });
            }}
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </DashboardPageHeader>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="p-2 hover:bg-muted/40 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-muted-foreground/70">Requests</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-semibold tracking-tight">
              {activeTab === 'partner-application' ? 'Partner Application' : 'Staff Invitations'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}

    </DashboardPageWrapper>
  );
}
