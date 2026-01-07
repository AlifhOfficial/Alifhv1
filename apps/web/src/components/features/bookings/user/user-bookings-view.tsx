/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Package } from 'lucide-react';
import { DashboardPageLayout } from '@/components/shared/layout';
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
    { key: 'all', label: 'All', color: 'purple' },
    { key: 'pending', label: 'Pending', color: 'yellow' },
    { key: 'confirmed', label: 'Confirmed', color: 'green' },
    { key: 'completed', label: 'Completed', color: 'blue' },
    { key: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'gray': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-foreground';
    }
  };

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
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Header Section - Sticky */}
        <section className="space-y-4 sticky top-0 bg-background z-10 pt-8 sm:pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
              <p className="text-[15px] font-medium text-muted-foreground/70 mt-2">
                View and manage your booked test drives
              </p>
            </div>
            
            <button
              onClick={fetchBookings}
              disabled={isLoading}
              className="p-2 hover:bg-muted/40 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="border-b border-border/40">
            <div className="flex gap-1 overflow-x-auto pb-px">
              {statusTabs.map((tab) => {
                const count = tab.key === 'all' 
                  ? bookings.length 
                  : bookings.filter(b => b.status === tab.key).length;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedStatus(tab.key)}
                    className={`px-5 py-3.5 border-b-2 transition-colors whitespace-nowrap text-[15px] font-semibold tracking-tight ${
                      selectedStatus === tab.key
                        ? `border-transparent ${getColorClasses(tab.color)}`
                        : 'border-transparent text-muted-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 text-sm font-semibold tracking-tight ${selectedStatus === tab.key ? getColorClasses(tab.color) : 'text-muted-foreground/60'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="mt-6 pb-32">
          <UserBookingList
            bookings={bookings}
            isLoading={isLoading}
            selectedStatus={selectedStatus}
            onCancel={(bookingId) => setCancelModal({ bookingId, isOpen: true })}
            onOpenFeedback={(bookingId) => setFeedbackModal({ bookingId, isOpen: true })}
          />
        </div>

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
