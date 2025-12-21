/**
 * Partner Request Admin List
 * 
 * Admin view for managing partner applications
 * - List with filters
 * - Quick actions
 * - Status indicators
 */

'use client';

import { useState } from 'react';
import { usePartnerRequestsAdmin, usePartnerRequestReview } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
} from 'lucide-react';

export function PartnerRequestAdminList() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  
  const { data, isLoading, refetch } = usePartnerRequestsAdmin({
    status: statusFilter,
    includeCounts: true,
  });

  const requests = data?.requests;
  const counts = data?.counts;

  const { review, isReviewing } = usePartnerRequestReview();
  const { toast } = useToast();

  const handleReview = (requestId: string, status: 'approved' | 'rejected', reason?: string) => {
    review(
      {
        requestId,
        status,
        rejectionReason: reason,
      },
      {
        onSuccess: () => {
          toast({
            title: `Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            description: `Partner application has been ${status}.`,
          });
          setReviewModalOpen(false);
          setSelectedRequest(null);
          refetch();
        },
        onError: (error) => {
          toast({
            title: 'Review Failed',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-500 dark:bg-yellow-950/20 dark:border-yellow-900/30',
        label: 'Pending',
      },
      approved: {
        icon: CheckCircle2,
        color: 'text-green-600 bg-green-50 border-green-200 dark:text-green-500 dark:bg-green-950/20 dark:border-green-900/30',
        label: 'Approved',
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-500 dark:bg-red-950/20 dark:border-red-900/30',
        label: 'Rejected',
      },
    }[status] || {
      icon: Clock,
      color: 'text-muted-foreground bg-muted/20 border-border',
      label: status,
    };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{counts?.total || 0}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30 p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{counts?.pending || 0}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/30 p-4">
          <p className="text-sm text-green-600 dark:text-green-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{counts?.approved || 0}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/30 p-4">
          <p className="text-sm text-red-600 dark:text-red-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{counts?.rejected || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company name, email..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value as any || undefined)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests && requests.length > 0 ? (
          requests.map(({ request, user }) => (
            <div
              key={request.id}
              className="bg-card rounded-lg border border-border p-6 hover:border-border/60 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{request.companyNameLegal}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.brandName && (
                    <p className="text-sm text-muted-foreground">
                      Brand: {request.brandName}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedRequest(request.id)}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {request.partnerType.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{request.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{request.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">License: {request.tradeLicense}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Applied {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {user && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      By: {user.name || user.email}
                    </span>
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleReview(request.id, 'approved')}
                    disabled={isReviewing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isReviewing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request.id);
                      setReviewModalOpen(true);
                    }}
                    disabled={isReviewing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No partner requests found</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">Reject Application</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejection:
            </p>
            <textarea
              id="rejection-reason"
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement)?.value;
                  if (reason.trim()) {
                    handleReview(selectedRequest, 'rejected', reason);
                  } else {
                    toast({
                      title: 'Rejection reason required',
                      description: 'Please provide a reason for rejection.',
                      variant: 'destructive',
                    });
                  }
                }}
                disabled={isReviewing}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isReviewing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
