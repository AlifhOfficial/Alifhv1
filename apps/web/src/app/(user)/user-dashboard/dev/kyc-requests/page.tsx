/**
 * KYC Requests Dev Page
 * Development page to view and manage KYC verification requests
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Eye, FileText } from 'lucide-react';
import { DashboardPageLayout } from '@/components/shared/layout';
import { useToast } from '@/hooks/use-toast';
import { getSignedUrl } from '@/lib/storage';

interface KycRequest {
  id: string;
  userId: string;
  status: string;
  type: string;
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
  userProfileFirstName: string | null;
  userProfileLastName: string | null;
}

export default function KycRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchRequests();
    }
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kyc/requests', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.records || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load KYC requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/kyc/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          kycId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      toast({
        title: 'Approved',
        description: 'KYC request has been approved',
      });

      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/kyc/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          kycId,
          action: 'reject',
          rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      toast({
        title: 'Rejected',
        description: 'KYC request has been rejected',
      });

      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const viewDocument = async (key: string) => {
    if (documentUrls[key]) {
      window.open(documentUrls[key], '_blank');
      return;
    }

    try {
      const signedUrl = await fetch('/api/storage/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ key }),
      }).then(res => res.json());

      if (signedUrl.url) {
        setDocumentUrls(prev => ({ ...prev, [key]: signedUrl.url }));
        window.open(signedUrl.url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load document',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardPageLayout
      title="KYC Verification Requests"
    >
      <p className="text-sm text-muted-foreground mb-6">
        Development page to manage user verification requests
      </p>

      {/* Requests List */}
      <div className="space-y-4">{requests.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">No KYC requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-card border border-border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium text-foreground">
                        {request.userProfileFirstName && request.userProfileLastName
                          ? `${request.userProfileFirstName} ${request.userProfileLastName}`
                          : request.userName || 'Unknown User'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Document Type:</span>
                    <span className="ml-2 text-foreground font-medium">
                      {request.documentType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Document Number:</span>
                    <span className="ml-2 text-foreground font-medium">
                      {request.documentNumber}
                    </span>
                  </div>
                </div>

                {/* Document Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => viewDocument(request.documentFrontUrl)}
                    className="h-8 px-3 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Front
                  </button>
                  {request.documentBackUrl && (
                    <button
                      onClick={() => viewDocument(request.documentBackUrl!)}
                      className="h-8 px-3 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Back
                    </button>
                  )}
                  <button
                    onClick={() => viewDocument(request.selfieUrl)}
                    className="h-8 px-3 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Selfie
                  </button>
                </div>

                {/* Approval Actions */}
                {request.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing}
                      className="h-9 px-4 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      disabled={isProcessing}
                      className="h-9 px-4 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Rejection Info */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-foreground mt-1">{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-foreground">Reject KYC Request</h3>
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting this request
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="flex-1 h-10 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                disabled={isProcessing}
                className="flex-1 h-10 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
