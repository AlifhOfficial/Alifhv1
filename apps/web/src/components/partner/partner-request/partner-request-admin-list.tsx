/**
 * Partner Request Admin List
 * Admin view for managing partner applications
 * Following Revvup design system
 */

'use client';

import { useState } from 'react';
import { usePartnerRequestsAdmin, usePartnerRequestReview } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Building2, 
  CheckCircle2, 
  XCircle,
  FileText,
  Calendar,
  User,
  Mail,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';

export function PartnerRequestAdminList() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [trialMonths, setTrialMonths] = useState<number>(3); // Default 3 months
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  
  const { data, isLoading, refetch } = usePartnerRequestsAdmin({
    status: statusFilter,
    includeCounts: true,
  });

  const requests = data?.requests || [];
  const counts = data?.counts;

  const { review, isReviewing } = usePartnerRequestReview();
  const { toast } = useToast();

  const handleReview = (requestId: string, status: 'approved' | 'rejected', reason?: string, months?: number) => {
    review(
      { requestId, status, rejectionReason: reason, trialMonths: months },
      {
        onSuccess: () => {
          toast({ title: `Application ${status}` });
          setRejectingId(null);
          setApprovingId(null);
          setRejectionReason('');
          setTrialMonths(3);
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

  const viewDocument = async (key: string) => {
    try {
      const response = await fetch(`/api/storage/private-url?key=${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error('Failed to generate URL');
      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: 'Failed to open document',
        description: 'Could not generate secure URL',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        
        {/* Header */}
        <section className="space-y-4">
          <h1>Partner Applications</h1>
          <p className="text-muted-foreground">
            Review and manage partner verification requests
          </p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/40 divide-x divide-border/40">
          <div className="p-6 md:p-8 flex flex-col gap-1">
            <small className="text-muted-foreground">Total</small>
            <h2>{counts?.total || 0}</h2>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'pending' ? undefined : 'pending')}
            className={`p-6 md:p-8 flex flex-col gap-1 hover:bg-secondary/30 transition-colors text-left ${
              statusFilter === 'pending' ? 'bg-secondary/40' : ''
            }`}
          >
            <small className="text-muted-foreground">Pending</small>
            <h2 className="text-yellow-500">{counts?.pending || 0}</h2>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'approved' ? undefined : 'approved')}
            className={`p-6 md:p-8 flex flex-col gap-1 hover:bg-secondary/30 transition-colors text-left ${
              statusFilter === 'approved' ? 'bg-secondary/40' : ''
            }`}
          >
            <small className="text-muted-foreground">Approved</small>
            <h2 className="text-green-500">{counts?.approved || 0}</h2>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'rejected' ? undefined : 'rejected')}
            className={`p-6 md:p-8 flex flex-col gap-1 hover:bg-secondary/30 transition-colors text-left ${
              statusFilter === 'rejected' ? 'bg-secondary/40' : ''
            }`}
          >
            <small className="text-muted-foreground">Rejected</small>
            <h2>{counts?.rejected || 0}</h2>
          </button>
        </div>

        {/* Requests List */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between pb-3">
            <div>
              <h2>Applications</h2>
              {statusFilter && (
                <small className="text-muted-foreground">Filtered by: {statusFilter}</small>
              )}
            </div>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter(undefined)}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-border/40 bg-secondary/10">
              <Building2 className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">
                {statusFilter ? `No ${statusFilter} requests found` : 'No partner applications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map(({ request, user }) => (
                <div 
                  key={request.id} 
                  className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-border/60 transition-all"
                >
                  {/* Header */}
                  <div className="p-8 border-b border-border/40">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h3 className="text-foreground">{request.companyNameLegal}</h3>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            request.status === 'pending' ? 'text-yellow-600 bg-yellow-500/10' :
                            request.status === 'approved' ? 'text-green-600 bg-green-500/10' :
                            'text-red-600 bg-red-500/10'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {user?.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            Applied {new Date(request.createdAt).toLocaleDateString('en-AE', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Company Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm text-muted-foreground">Company Information</h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <small className="text-muted-foreground">Type</small>
                            <p className="text-sm text-foreground capitalize">{request.partnerType.replace('_', ' ')}</p>
                          </div>
                          <div className="space-y-1">
                            <small className="text-muted-foreground">Company Size</small>
                            <p className="text-sm text-foreground capitalize">{request.companySize}</p>
                          </div>
                        </div>
                      </div>

                      {/* Legal Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm text-muted-foreground">Legal Documents</h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <small className="text-muted-foreground">Trade License</small>
                            <p className="text-sm text-foreground font-mono">{request.tradeLicense}</p>
                          </div>
                          <div className="space-y-1">
                            <small className="text-muted-foreground">Expiry Date</small>
                            <p className="text-sm text-foreground">
                              {new Date(request.tradeLicenseExpiry).toLocaleDateString('en-AE', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <small className="text-muted-foreground">VAT Number</small>
                            <p className="text-sm text-foreground font-mono">{request.vatNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document */}
                    {request.tradeLicenseDocumentUrl && (
                      <div className="pt-6 border-t border-border/40">
                        <h3 className="text-sm text-muted-foreground mb-4">Uploaded Documents</h3>
                        <button
                          onClick={() => viewDocument(request.tradeLicenseDocumentUrl)}
                          className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:bg-secondary/30 transition-all w-full md:w-auto"
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground mb-0.5">Trade License Document</p>
                            <small className="text-muted-foreground">Click to view</small>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && !rejectingId && !approvingId && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-border/40">
                        <button
                          onClick={() => setApprovingId(request.id)}
                          disabled={isReviewing}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Application
                        </button>
                        <button
                          onClick={() => setRejectingId(request.id)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border/40 hover:border-red-500/30 hover:bg-red-500/10 text-foreground hover:text-red-500 text-sm font-medium transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Rejection Form */}
                    {rejectingId === request.id && (
                      <div className="space-y-4 pt-6 border-t border-border/40">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Rejection Reason</label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide a clear reason for rejection..."
                            rows={4}
                            className="w-full p-4 bg-background border border-border/40 rounded-xl focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 resize-none text-foreground"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            onClick={() => {
                              if (rejectionReason.trim()) {
                                handleReview(request.id, 'rejected', rejectionReason);
                              } else {
                                toast({ title: 'Rejection reason required', variant: 'destructive' });
                              }
                            }}
                            disabled={isReviewing || !rejectionReason.trim()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                          >
                            {isReviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Approval Form - Set Trial Period */}
                    {approvingId === request.id && (
                      <div className="space-y-4 pt-6 border-t border-border/40">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Founding Access Period</label>
                          <p className="text-xs text-muted-foreground">
                            Select how many months of founding access to grant on Revvup Flow
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {[0, 1, 2, 3, 6, 12].map((months) => (
                              <button
                                key={months}
                                type="button"
                                onClick={() => setTrialMonths(months)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  trialMonths === months
                                    ? 'bg-green-500 text-white'
                                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                                }`}
                              >
                                {months === 0 ? 'No trial' : `${months} month${months > 1 ? 's' : ''}`}
                              </button>
                            ))}
                          </div>
                          {trialMonths > 0 && (
                            <p className="text-xs text-green-500 mt-2">
                              Partner will get {trialMonths} month{trialMonths > 1 ? 's' : ''} free access to Revvup Flow (no credit card required)
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button
                            onClick={() => handleReview(request.id, 'approved', undefined, trialMonths)}
                            disabled={isReviewing}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                          >
                            {isReviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm Approval
                          </button>
                          <button
                            onClick={() => {
                              setApprovingId(null);
                              setTrialMonths(3);
                            }}
                            className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason Display */}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="space-y-2 pt-6 border-t border-border/40">
                        <small className="text-muted-foreground">Rejection Reason</small>
                        <p className="text-sm text-foreground">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
