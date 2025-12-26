'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BanAppeal {
  appeal: {
    id: string;
    userId: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy: string | null;
    reviewedAt: Date | null;
    reviewNote: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    banned: boolean;
    banReason: string | null;
    banExpires: Date | null;
  } | null;
  userProfile: {
    fullName: string | null;
    phone: string | null;
  } | null;
  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function BanAppealsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewingAppeal, setReviewingAppeal] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ appeals: BanAppeal[] }>({
    queryKey: ['admin', 'ban-appeals', selectedStatus === 'all' ? undefined : selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const res = await fetch(`/api/admin/appeals/ban${params}`);
      if (!res.ok) throw new Error('Failed to fetch appeals');
      return res.json();
    },
  });

  const appeals = data?.appeals || [];
  const pendingCount = appeals.filter(a => a.appeal.status === 'pending').length;
  const approvedCount = appeals.filter(a => a.appeal.status === 'approved').length;
  const rejectedCount = appeals.filter(a => a.appeal.status === 'rejected').length;

  const handleReview = async (appealId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/appeals/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealId, action, reviewNote: reviewNote || undefined }),
      });

      if (!res.ok) throw new Error('Failed to review appeal');

      queryClient.invalidateQueries({ queryKey: ['admin', 'ban-appeals'] });
      setReviewingAppeal(null);
      setReviewNote('');
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      alert('Failed to review appeal');
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Ban Appeals</h1>
        <p className="text-sm text-muted-foreground">Review and manage user ban appeals</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`bg-card border rounded-lg p-6 text-left transition-colors ${
            selectedStatus === 'pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'border-border hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span>Pending Review</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{pendingCount}</div>
        </button>
        
        <button
          onClick={() => setSelectedStatus('approved')}
          className={`bg-card border rounded-lg p-6 text-left transition-colors ${
            selectedStatus === 'approved' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span>Approved</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{approvedCount}</div>
        </button>
        
        <button
          onClick={() => setSelectedStatus('rejected')}
          className={`bg-card border rounded-lg p-6 text-left transition-colors ${
            selectedStatus === 'rejected' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">{rejectedCount}</div>
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'approved' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setSelectedStatus('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'rejected' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Appeals List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Loading appeals...</p>
        </div>
      ) : appeals.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-sm text-muted-foreground">No ban appeals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map(({ appeal, user, userProfile, reviewer }) => (
            <div
              key={appeal.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-medium text-foreground">
                      {user?.name || 'Unknown User'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300' :
                      appeal.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                    }`}>
                      {appeal.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {new Date(appeal.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Ban Info */}
              {user?.banned && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                  <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">Current Ban Status:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{user.banReason}</p>
                  {user.banExpires && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Expires: {new Date(user.banExpires).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Appeal Message */}
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Appeal Message:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appeal.message}</p>
              </div>

              {/* Review Section */}
              {appeal.status === 'pending' ? (
                reviewingAppeal === appeal.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add a review note (optional)"
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(appeal.id, 'approve')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Approve & Unban User
                      </button>
                      <button
                        onClick={() => handleReview(appeal.id, 'reject')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject Appeal
                      </button>
                      <button
                        onClick={() => {
                          setReviewingAppeal(null);
                          setReviewNote('');
                        }}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewingAppeal(appeal.id)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                  >
                    Review Appeal
                  </button>
                )
              ) : (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-foreground mb-1">
                    Reviewed by {reviewer?.name || 'Unknown Admin'}
                  </p>
                  {appeal.reviewedAt && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(appeal.reviewedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {appeal.reviewNote && (
                    <p className="text-sm text-muted-foreground">{appeal.reviewNote}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
