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
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Partner Application Section */}
        <section className="space-y-6">
          <div>
            <h3 className="text-base font-medium">Partner Application</h3>
            <p className="text-sm text-muted-foreground mt-1">Apply to become a verified dealership partner</p>
          </div>
          
          {/* Show status for pending/approved requests, show apply button if no request or rejected */}
          {partnerRequest && (partnerRequest.status === 'pending' || partnerRequest.status === 'approved') ? (
            <PartnerApplicationStatus />
          ) : (
            <button
              onClick={() => setActiveTab('partner-application')}
              className="group w-full p-8 rounded-2xl border border-border/40 hover:border-border transition-all text-left bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">
                    {partnerRequest?.status === 'rejected' ? 'Re-apply as Partner' : 'Become a Partner'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {partnerRequest?.status === 'rejected' 
                      ? 'Your previous application was not approved. You can submit a new application.'
                      : 'Join the UAE\'s most transparent car marketplace'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          )}
        </section>

        {/* Staff Invites Section */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-base font-medium">Staff Invitations</h3>
              <p className="text-sm text-muted-foreground mt-1">Invitations from dealership partners</p>
            </div>
            {inviteCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-muted text-xs font-medium">{inviteCount}</span>
            )}
          </div>
          
          {inviteCount > 0 ? (
            <button
              onClick={() => setActiveTab('staff-invites')}
              className="group w-full p-8 rounded-2xl border border-border/40 hover:border-border transition-all text-left bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium">
                    {inviteCount} Pending Invitation{inviteCount !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Review and respond to invitations
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          ) : (
            <div className="p-12 rounded-2xl border border-border/40 bg-card text-center">
              <p className="text-sm text-muted-foreground">No pending invitations</p>
            </div>
          )}
        </section>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Page Header */}
      {activeTab === 'overview' ? (
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/user-dashboard"
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </a>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Partner applications and staff invitations
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
        <div className="max-w-3xl mx-auto px-6 py-8">
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
