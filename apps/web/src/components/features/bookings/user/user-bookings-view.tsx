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
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </DashboardPageHeader>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {statusTabs.map((tab) => {
            // Count includes expired under no_show tab
            const count = tab.key === 'all' 
              ? bookings.length 
              : tab.key === 'no_show'
                ? bookings.filter(b => b.status === 'no_show' || b.status === 'expired').length
                : bookings.filter(b => b.status === tab.key).length;
            const isActive = selectedStatus === tab.key;
            
            // Color config for pill-style tabs
            const colorConfig = {
              all: { bg: 'bg-primary/10', text: 'text-primary', badge: 'bg-primary/20 text-primary' },
              pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', badge: 'bg-amber-500/20 text-amber-600' },
              confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', badge: 'bg-emerald-500/20 text-emerald-600' },
              completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', badge: 'bg-blue-500/20 text-blue-600' },
              cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', badge: 'bg-red-500/20 text-red-600' },
              no_show: { bg: 'bg-muted', text: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
            }[tab.key] || { bg: 'bg-muted', text: 'text-foreground', badge: 'bg-muted text-muted-foreground' };
            
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? `${colorConfig.bg} ${colorConfig.text}`
                    : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold tabular-nums ${
                    isActive ? colorConfig.badge : 'bg-muted/50 text-muted-foreground/50'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Search + Sort */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-muted/30 border border-border/40 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 focus:bg-background transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as BookingSort)}>
            <SelectTrigger className="h-10 w-28 border border-border/40 bg-muted/30 rounded-lg text-sm font-medium flex-shrink-0 focus:ring-1 focus:ring-primary/30">
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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-sm text-destructive">{error}</p>
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
