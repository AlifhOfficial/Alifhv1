/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { RefreshCw, Calendar, Search, X } from 'lucide-react';
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
import { CancelBookingModal } from './cancel-booking-modal';

export function UserBookingsView() {
  const [bookings, setBookings] = useState<UserBookingData[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<BookingSort>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const ITEMS_PER_PAGE = 50;

  // Debounced search handler
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1);
  }, 400);

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
      // Build query params for server-side filtering
      const params = new URLSearchParams();
      params.set('limit', String(ITEMS_PER_PAGE));
      params.set('offset', String((currentPage - 1) * ITEMS_PER_PAGE));
      params.set('sort', sort);
      
      // Status filter (handle 'no_show' which includes 'expired')
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'no_show') {
          params.set('status', 'no_show,expired');
        } else {
          params.set('status', selectedStatus);
        }
      }
      
      // Search query
      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }

      const res = await fetch(`/api/bookings?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      setBookings(data.bookings || []);
      setTotalBookings(data.total || 0);
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch, sort, currentPage]);

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
        // Combine reason and notes; send cancellationReason for enum
        body: JSON.stringify({ 
          action: 'cancel', 
          notes: [reason, notes].filter(Boolean).join(': ') || undefined,
          cancellationReason: 'other'
        }),
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

  async function handleSubmitCancel() {
    if (!cancelModal) return;
    setIsCancelling(true);
    try {
      await handleCancel(cancelModal.bookingId, cancelReason, cancelNotes);
      setCancelModal(null);
      setCancelReason('');
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
    setCancelReason('');
    setCancelNotes('');
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">My Bookings</h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">Your scheduled test drives</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        {/* Search & Sort Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchChange(e.target.value);
              }}
              className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-8 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleSearchChange('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => {
            setSort(v as BookingSort);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="h-9 sm:h-10 w-24 sm:w-28 border-0 bg-secondary/50 rounded-lg sm:rounded-xl text-xs sm:text-sm shrink-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Pills - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
            {statusTabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedStatus(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs transition-all capitalize whitespace-nowrap ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <UserBookingList
        bookings={bookings}
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        searchQuery={debouncedSearch}
        onCancel={(bookingId) => setCancelModal({ bookingId, isOpen: true })}
      />

      {/* Pagination */}
      {(() => {
        const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;
        
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-border/40 mt-4 sm:mt-6">
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
              Page {currentPage} of {totalPages} · {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
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
  );
}
