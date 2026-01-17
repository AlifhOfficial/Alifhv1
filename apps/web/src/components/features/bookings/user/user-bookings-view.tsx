/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RefreshCw, Calendar, Search, X } from 'lucide-react';
import { DashboardPageWrapper, DashboardPageHeader } from '@/components/shared/layout/dashboard-page-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

type BookingSort = 'newest' | 'oldest';
import type { UserBookingData } from './types';
import { USER_BOOKING_STATUS_LABELS } from './types';
import { UserBookingList } from './user-booking-list';
import { FeedbackModal } from './feedback-modal';
import { CancelBookingModal } from './cancel-booking-modal';

export function UserBookingsView() {
  const [bookings, setBookings] = useState<UserBookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<BookingSort>('newest');
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
    { key: 'no_show', label: 'No Show' },
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

  // Client-side filtering and sorting for zero-latency toggling
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'no_show') {
        filtered = filtered.filter(b => b.status === 'no_show' || b.status === 'expired');
      } else {
        filtered = filtered.filter(b => b.status === selectedStatus);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.listingTitle.toLowerCase().includes(query) ||
        booking.partnerName.toLowerCase().includes(query) ||
        (booking.confirmationToken && booking.confirmationToken.toLowerCase().includes(query)) ||
        booking.scheduledDate.includes(query)
      );
    }

    // Sort by scheduled date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledStartTime}`).getTime();
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledStartTime}`).getTime();
      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [bookings, selectedStatus, searchQuery, sort]);

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
          className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-8 rounded-xl bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl">
          {statusTabs.map((tab) => {
            const count = tab.key === 'all' 
              ? bookings.length 
              : tab.key === 'no_show'
                ? bookings.filter(b => b.status === 'no_show' || b.status === 'expired').length
                : bookings.filter(b => b.status === tab.key).length;
            const isActive = selectedStatus === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all capitalize ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => setSort(v as BookingSort)}>
          <SelectTrigger className="h-10 w-32 border-0 bg-secondary/50 rounded-xl text-sm">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-secondary/50 text-sm">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <UserBookingList
        bookings={filteredBookings}
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
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
