/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { DashboardPageLayout } from '@/components/layout';
import type { UserBookingData } from './types';
import { UserBookingFilters } from './user-booking-filters';
import { UserBookingList } from './user-booking-list';
import { FeedbackModal } from './feedback-modal';
import { CancelBookingModal } from './cancel-booking-modal';

export function UserBookingsView() {
  const [bookings, setBookings] = useState<UserBookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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

  const fetchBookings = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
      const res = await fetch(`/api/bookings?${statusParam}`, {
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
  }, [selectedStatus]);

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
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        {/* Header Section */}
        <section className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
              <p className="text-sm text-muted-foreground/70 mt-2">
                View and manage your booked test drives
              </p>
            </div>
            
            <button
              onClick={fetchBookings}
              disabled={isLoading}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <UserBookingFilters 
            selectedStatus={selectedStatus} 
            onStatusChange={setSelectedStatus} 
          />
        </section>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
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
      </div>
    </div>
  );
}
