/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';
import type { UserBookingData } from './types';
import { USER_BOOKING_STATUS_LABELS } from './types';
import { UserBookingList } from './user-booking-list';
import { FeedbackModal } from './feedback-modal';
import { CancelBookingModal } from './cancel-booking-modal';

export function UserBookingsView() {
  const [bookings, setBookings] = useState<UserBookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('confirmed');
  const [feedbackModal, setFeedbackModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('changed_mind');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Status tabs configuration
  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const fetchBookings = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Fetch ALL bookings - filtering happens client-side for zero-latency toggling
      const res = await fetch(`/api/bookings`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      setBookings(data.bookings || []);
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - only fetch on mount or manual refresh

  useEffect(() => {
    fetchBookings();
    
    // Cleanup: abort in-flight requests on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchBookings]);

  async function handleCancel(bookingId: string, reason: string, notes?: string) {
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason, notes: notes || undefined }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to cancel booking');
      }

      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  }

  async function handleSubmitFeedback() {
    if (!feedbackModal) return;

    setIsSubmittingFeedback(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${feedbackModal.bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'feedback',
          rating: feedbackRating,
          comment: feedbackComment || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      setFeedbackModal(null);
      setFeedbackRating(0);
      setFeedbackComment('');
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  function handleCloseFeedback() {
    setFeedbackModal(null);
    setFeedbackRating(0);
    setFeedbackComment('');
  }

  async function handleSubmitCancel() {
    if (!cancelModal) return;
    setIsCancelling(true);
    try {
      await handleCancel(cancelModal.bookingId, cancelReason, cancelNotes);
      setCancelModal(null);
      setCancelReason('changed_mind');
      setCancelNotes('');
      if (selectedStatus !== 'cancelled') {
        setSelectedStatus('cancelled');
      }
    } finally {
      setIsCancelling(false);
    }
  }

  function handleCloseCancel() {
    setCancelModal(null);
    setCancelReason('changed_mind');
    setCancelNotes('');
  }

  return (
    <DashboardPageWrapper>
      {/* Header */}
      <DashboardPageHeader
        title="My Bookings"
        description="Your scheduled test drives"
      >
        <button
          onClick={fetchBookings}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-sidebar transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-sidebar p-1.5 rounded-xl border border-border/40">
          {statusTabs.map((tab) => {
            const count = tab.key === 'all' 
              ? bookings.length 
              : bookings.filter(b => b.status === tab.key).length;
            const isActive = selectedStatus === tab.key;
            
            // Color mapping for counts
            const getCountColor = () => {
              if (!isActive) return 'bg-muted/50 text-muted-foreground/60';
              switch (tab.key) {
                case 'confirmed': return 'bg-green-500/10 text-green-600';
                case 'pending': return 'bg-amber-500/10 text-amber-600';
                case 'completed': return 'bg-blue-500/10 text-blue-600';
                case 'cancelled': return 'bg-red-500/10 text-red-600';
                default: return 'bg-purple-500/10 text-purple-600';
              }
            };
            
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-tight transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-md text-xs font-bold ${getCountColor()}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      <UserBookingList
        bookings={bookings}
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        onCancel={(bookingId) => setCancelModal({ bookingId, isOpen: true })}
        onOpenFeedback={(bookingId) => setFeedbackModal({ bookingId, isOpen: true })}
      />

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackModal?.isOpen ?? false}
        rating={feedbackRating}
        comment={feedbackComment}
        isSubmitting={isSubmittingFeedback}
        onRatingChange={setFeedbackRating}
        onCommentChange={setFeedbackComment}
        onSubmit={handleSubmitFeedback}
        onClose={handleCloseFeedback}
      />

      <CancelBookingModal
        isOpen={cancelModal?.isOpen ?? false}
        reason={cancelReason}
        notes={cancelNotes}
        isSubmitting={isCancelling}
        onReasonChange={setCancelReason}
        onNotesChange={setCancelNotes}
        onSubmit={handleSubmitCancel}
        onClose={handleCloseCancel}
      />
    </DashboardPageWrapper>
  );
}
