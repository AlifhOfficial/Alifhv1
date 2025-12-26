/**
 * Partner Request Admin List
 * Admin view for managing partner applications
 * Following profile-view design system
 */

'use client';

import { useState } from 'react';
import { usePartnerRequestsAdmin, usePartnerRequestReview } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, CheckCircle2, XCircle } from 'lucide-react';

export function PartnerRequestAdminList() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { data, isLoading, refetch } = usePartnerRequestsAdmin({
    status: statusFilter,
    includeCounts: true,
  });

  const requests = data?.requests || [];
  const counts = data?.counts;

  const { review, isReviewing } = usePartnerRequestReview();
  const { toast } = useToast();

  const handleReview = (requestId: string, status: 'approved' | 'rejected', reason?: string) => {
    review(
      { requestId, status, rejectionReason: reason },
      {
        onSuccess: () => {
          toast({ title: `Application ${status}` });
          setRejectingId(null);
          setRejectionReason('');
          refetch();
        },
        onError: (error) => {
          toast({
            title: 'Review failed',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      
      {/* Stats */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border divide-x divide-border bg-background">
          <div className="p-8 flex flex-col gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="text-2xl font-semibold text-blue-500">{counts?.total || 0}</span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
              statusFilter === 'pending' ? 'bg-secondary/40' : ''
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pending</span>
            <span className="text-2xl font-semibold text-yellow-500">{counts?.pending || 0}</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
              statusFilter === 'approved' ? 'bg-secondary/40' : ''
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Approved</span>
            <span className="text-2xl font-semibold text-green-500">{counts?.approved || 0}</span>
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
              statusFilter === 'rejected' ? 'bg-secondary/40' : ''
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Rejected</span>
            <span className="text-2xl font-semibold text-foreground">{counts?.rejected || 0}</span>
          </button>
        </div>
      </section>

      {/* Requests List */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
          <h3 className="text-lg font-medium tracking-tight">Applications</h3>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(undefined)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              {statusFilter ? `No ${statusFilter} requests found` : 'No partner applications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
            {requests.map(({ request, user }) => (
              <div key={request.id} className="p-6 hover:bg-secondary/10 transition-colors">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-medium text-foreground">{request.companyNameLegal}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                        request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                        request.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString('en-AE', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                  <div>
                    <span className="font-medium">Type:</span> {request.partnerType.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">License:</span> {request.tradeLicense}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {request.companySize}
                  </div>
                </div>

                {request.status === 'pending' && !rejectingId && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => handleReview(request.id, 'approved')}
                      disabled={isReviewing}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isReviewing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}

                {rejectingId === request.id && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="w-full h-24 p-3 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors placeholder:text-muted-foreground/30 resize-none"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (rejectionReason.trim()) {
                            handleReview(request.id, 'rejected', rejectionReason);
                          } else {
                            toast({ title: 'Rejection reason required', variant: 'destructive' });
                          }
                        }}
                        disabled={isReviewing || !rejectionReason.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isReviewing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
