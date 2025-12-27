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
import { usePartnerRequest } from '@/hooks/partner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

type TabType = 'overview' | 'partner-application' | 'staff-invites';

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
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        
        {/* Partner Application Section */}
        <section className="space-y-8">
          <div className="border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Partner Application</h3>
          </div>
          
          {/* Show status for pending/approved requests, show apply button if no request or rejected */}
          {partnerRequest && (partnerRequest.status === 'pending' || partnerRequest.status === 'approved') ? (
            <PartnerApplicationStatus />
          ) : (
            <button
              onClick={() => setActiveTab('partner-application')}
              className="group w-full p-6 rounded-xl border border-border hover:bg-secondary/30 transition-all text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <h4 className="text-base font-medium">
                    {partnerRequest?.status === 'rejected' ? 'Re-apply as Partner' : 'Become a Partner'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {partnerRequest?.status === 'rejected' 
                      ? 'Your previous application was not approved. You can submit a new application.'
                      : 'Join the UAE\'s most transparent car marketplace. List your inventory and grow your business.'}
                  </p>
                  {!partnerRequest?.status && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>• Increased Visibility</span>
                      <span>• Quality Leads</span>
                      <span>• Professional Tools</span>
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          )}
        </section>

        {/* Staff Invites Section */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Staff Invitations</h3>
            {inviteCount > 0 && (
              <span className="text-sm text-muted-foreground font-medium">{inviteCount} pending</span>
            )}
          </div>
          
          <button
            onClick={() => setActiveTab('staff-invites')}
            className="group w-full p-6 rounded-xl border border-border hover:bg-secondary/30 transition-all text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h4 className="text-base font-medium">
                  {inviteCount > 0 
                    ? `${inviteCount} Pending Invitation${inviteCount !== 1 ? 's' : ''}`
                    : 'No Pending Invitations'
                  }
                </h4>
                <p className="text-sm text-muted-foreground">
                  {inviteCount > 0 
                    ? 'Review and respond to staff invitations from partners'
                    : 'Staff invitations from partners will appear here'
                  }
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
            </div>
          </button>
        </section>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Page Header */}
      {activeTab === 'overview' ? (
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <a
                href="/user-dashboard"
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </a>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your partner applications and staff invitations
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['partner', 'request'] });
                queryClient.invalidateQueries({ queryKey: ['user', 'staff-invites'] });
              }}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Requests</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">
                {activeTab === 'partner-application' ? 'Partner Application' : 'Staff Invitations'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}

    </div>
  );
}
