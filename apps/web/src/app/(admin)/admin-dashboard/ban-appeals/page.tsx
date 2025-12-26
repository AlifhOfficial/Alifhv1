/**
 * Admin Ban Appeals Page
 * Review and process user ban appeals
 * V1: Optimized to always fetch all appeals (stats stay accurate when filtering)
 */
'use client';

import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminBanAppealsPage() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewingAppeal, setReviewingAppeal] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const queryClient = useQueryClient();

  // V1: Always fetch all appeals - filter client-side so stats remain accurate
  const { data, isLoading } = useQuery<{ appeals: BanAppeal[] }>({
    queryKey: ['admin', 'ban-appeals'],
    queryFn: async () => {
      const res = await fetch('/api/admin/appeals/ban');
      if (!res.ok) throw new Error('Failed to fetch appeals');
      return res.json();
    },
  });

  const allAppeals = data?.appeals || [];
  
  // Compute stats from full dataset (always accurate)
  const pendingCount = useMemo(() => allAppeals.filter(a => a.appeal.status === 'pending').length, [allAppeals]);
  const approvedCount = useMemo(() => allAppeals.filter(a => a.appeal.status === 'approved').length, [allAppeals]);
  const rejectedCount = useMemo(() => allAppeals.filter(a => a.appeal.status === 'rejected').length, [allAppeals]);
  
  // Filter for display based on selected status
  const appeals = useMemo(() => 
    selectedStatus === 'all' 
      ? allAppeals 
      : allAppeals.filter(a => a.appeal.status === selectedStatus),
    [allAppeals, selectedStatus]
  );

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
    } catch {
      alert('Failed to review appeal');
    }
  };

  return (
    <DashboardDisplayArea>
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        
        {/* Stats */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 border-y border-border divide-x divide-border bg-background">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                selectedStatus === 'pending' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pending Review</span>
              <span className="text-2xl font-semibold text-yellow-500">{pendingCount}</span>
            </button>
            
            <button
              onClick={() => setSelectedStatus('approved')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                selectedStatus === 'approved' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Approved</span>
              <span className="text-2xl font-semibold text-green-500">{approvedCount}</span>
            </button>
            
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`p-8 flex flex-col gap-3 hover:bg-secondary/20 transition-colors ${
                selectedStatus === 'rejected' ? 'bg-secondary/40' : ''
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Rejected</span>
              <span className="text-2xl font-semibold text-foreground">{rejectedCount}</span>
            </button>
          </div>
        </section>

        {/* Filter Toggle */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Appeals</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedStatus('approved')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === 'approved' ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setSelectedStatus('rejected')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === 'rejected' ? 'bg-blue-500 text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Appeals List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No ban appeals found</p>
            </div>
          ) : (
            <div className="space-y-0 border border-border rounded-xl overflow-hidden divide-y divide-border">
              {appeals.map(({ appeal, user, userProfile, reviewer }) => (
                <div
                  key={appeal.id}
                  className="p-6 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-medium text-foreground">
                          {user?.name || 'Unknown User'}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          appeal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          appeal.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {appeal.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(appeal.createdAt).toLocaleDateString('en-AE', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Ban Info */}
                  {user?.banned && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1 uppercase tracking-wider">Current Ban</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{user.banReason}</p>
                      {user.banExpires && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Expires: {new Date(user.banExpires).toLocaleDateString('en-AE')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Appeal Message */}
                  <div className="mb-4 p-4 bg-secondary/20 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Appeal Message</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{appeal.message}</p>
                  </div>

                  {/* Review Section */}
                  {appeal.status === 'pending' ? (
                    reviewingAppeal === appeal.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Add a review note (optional)"
                          className="w-full h-24 p-3 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors placeholder:text-muted-foreground/30 resize-none"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReview(appeal.id, 'approve')}
                            className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                          >
                            Approve & Unban
                          </button>
                          <button
                            onClick={() => handleReview(appeal.id, 'reject')}
                            className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                          >
                            Reject Appeal
                          </button>
                          <button
                            onClick={() => {
                              setReviewingAppeal(null);
                              setReviewNote('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingAppeal(appeal.id)}
                        className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                      >
                        Review Appeal
                      </button>
                    )
                  ) : (
                    <div className="p-4 bg-secondary/20 rounded-xl">
                      <p className="text-xs font-medium text-foreground mb-1">
                        Reviewed by {reviewer?.name || 'Unknown Admin'}
                      </p>
                      {appeal.reviewedAt && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(appeal.reviewedAt).toLocaleDateString('en-AE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
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
        </section>

      </div>
    </DashboardDisplayArea>
  );
}
