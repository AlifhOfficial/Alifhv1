/**
 * User Bookings View Component
 * Main container for user's booking management
 */

'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Search, X, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BookingSort = 'newest' | 'oldest';
import type { UserBookingData, UserBookingStats } from './types';
import { UserBookingList } from './user-booking-list';
import { CancelBookingModal } from './cancel-booking-modal';

interface UserBookingsViewProps {
  initialData: {
    bookings: UserBookingData[];
    total: number;
    stats: UserBookingStats;
  };
  filters: {
    status: string;
    sort: BookingSort;
    page: number;
    q: string;
  };
}

export function UserBookingsView({ initialData, filters }: UserBookingsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.q);
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const bookings = initialData.bookings;
  const totalBookings = initialData.total;
  const stats = initialData.stats;
  const selectedStatus = filters.status;
  const debouncedSearch = filters.q;
  const sort = filters.sort;
  const currentPage = filters.page;
  const isLoading = isPending;

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  const updateRoute = useCallback((updates: Partial<UserBookingsViewProps['filters']>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const nextStatus = updates.status ?? selectedStatus;
    const nextSort = updates.sort ?? sort;
    const nextPage = updates.page ?? currentPage;
    const nextQuery = updates.q ?? debouncedSearch;

    if (nextStatus === 'all') params.delete('status');
    else params.set('status', nextStatus);

    if (nextSort === 'newest') params.delete('sort');
    else params.set('sort', nextSort);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    if (!nextQuery.trim()) params.delete('q');
    else params.set('q', nextQuery.trim());

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [searchParams, selectedStatus, sort, currentPage, debouncedSearch, pathname, router]);

  // Debounced search handler
  const handleSearchChange = useDebouncedCallback((value: string) => {
    updateRoute({ q: value, page: 1 });
  }, 400);

  // Main status tabs (always visible)
  const mainStatusTabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { key: 'completed', label: 'Completed', count: stats.completed },
  ];

  // Secondary status tabs (in More dropdown)
  const secondaryStatusTabs = [
    { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
    { key: 'no_show', label: 'No Show', count: stats.noShow },
  ];
  
  const isSecondaryStatusSelected = secondaryStatusTabs.some(tab => tab.key === selectedStatus);
  const selectedSecondaryTab = secondaryStatusTabs.find(tab => tab.key === selectedStatus);

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
        updateRoute({ status: 'cancelled', page: 1 });
      } else {
        startTransition(() => {
          router.refresh();
        });
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
            onClick={() => startTransition(() => router.refresh())}
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
            setError(null);
            updateRoute({ sort: v as BookingSort, page: 1 });
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
            {mainStatusTabs.map((tab) => {
              const isActive = selectedStatus === tab.key;
              
              return (
                <button
                    key={tab.key}
                    onClick={() => {
                    setError(null);
                    updateRoute({ status: tab.key, page: 1 });
                    }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs transition-all capitalize whitespace-nowrap ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${isActive ? 'text-foreground/70' : 'text-muted-foreground/70'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
            
            {/* More dropdown for secondary statuses */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs transition-all flex items-center gap-1 whitespace-nowrap ${
                    isSecondaryStatusSelected
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isSecondaryStatusSelected && selectedSecondaryTab ? (
                    <>
                      {selectedSecondaryTab.label}
                      <span className="text-foreground/70">{selectedSecondaryTab.count}</span>
                    </>
                  ) : (
                    'More'
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {secondaryStatusTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.key}
                  onClick={() => {
                      setError(null);
                      updateRoute({ status: tab.key, page: 1 });
                    }}
                    className={`text-xs cursor-pointer ${
                      selectedStatus === tab.key ? 'bg-secondary' : ''
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-auto text-muted-foreground/70">{tab.count}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
                onClick={() => updateRoute({ page: Math.max(1, currentPage - 1) })}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => updateRoute({ page: Math.min(totalPages, currentPage + 1) })}
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
