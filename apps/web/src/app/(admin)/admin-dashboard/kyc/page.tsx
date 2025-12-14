'use client';

import { useState, useEffect } from 'react';
import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { Check, X, Eye, Download, AlertCircle } from 'lucide-react';

interface KYCRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl: string | null;
  selfieUrl: string;
  submittedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function KYCManagementPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/kyc/requests?status=${filter === 'all' ? '' : filter}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Are you sure you want to approve this KYC request?')) return;

    try {
      const response = await fetch('/api/kyc/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch('/api/kyc/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', reason }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to reject KYC:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <DashboardDisplayArea
      title="KYC Management"
      description="Review and manage user identity verification requests"
    >
      <div className="p-6 md:p-10">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && requests.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No KYC requests found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'pending' ? 'There are no pending KYC requests at this time.' : `No ${filter} requests found.`}
            </p>
          </div>
        )}

        {/* Requests Table */}
        {!isLoading && requests.length > 0 && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Document Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{request.user.name}</div>
                        <div className="text-xs text-muted-foreground">{request.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {request.documentType.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {request.documentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-primary hover:text-primary/80 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mr-3"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-medium text-foreground">KYC Document Review</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {/* User Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-2">User Information</h3>
                  <div className="bg-muted/20 border border-border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm text-foreground">{selectedRequest.user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground">{selectedRequest.user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Document Type</p>
                        <p className="text-sm text-foreground">
                          {selectedRequest.documentType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Document Number</p>
                        <p className="text-sm text-foreground">{selectedRequest.documentNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Uploaded Documents</h3>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Document Front</p>
                    <img
                      src={selectedRequest.documentFrontUrl}
                      alt="Document Front"
                      className="w-full border border-border rounded-lg"
                    />
                  </div>

                  {selectedRequest.documentBackUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Document Back</p>
                      <img
                        src={selectedRequest.documentBackUrl}
                        alt="Document Back"
                        className="w-full border border-border rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Selfie with Document</p>
                    <img
                      src={selectedRequest.selfieUrl}
                      alt="Selfie"
                      className="w-full border border-border rounded-lg"
                    />
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="flex-1 h-10 px-4 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="flex-1 h-10 px-4 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardDisplayArea>
  );
}
