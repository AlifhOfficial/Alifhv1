/**
 * Staff Bookings View Component
 * Main container for staff bookings management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { AlertCircle, RefreshCw, CheckCircle2, Settings, Search, X, ChevronDown } from 'lucide-react';
import type { BookingData, BookingStats, AvailabilityRule, BookingSettings } from './types';
import { BookingList } from './booking-list';
import { AvailabilitySettings } from './availability-settings';
import { StaffCancelModal } from './staff-cancel-modal';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

type TabType = 'bookings' | 'settings';
type VerifyAction = 'check_in' | 'confirm' | 'complete' | 'no_show';
type BookingSort = 'newest' | 'oldest';

// Status tabs configuration
const STATUS_TABS = [
  { key: 'all', label: 'All', color: 'purple' },
  { key: 'pending', label: 'Pending', color: 'yellow' },
  { key: 'confirmed', label: 'Confirmed', color: 'green' },
  { key: 'completed', label: 'Completed', color: 'blue' },
  { key: 'cancelled', label: 'Cancelled', color: 'red' },
  { key: 'no_show', label: 'No Show', color: 'gray' },
];

function getColorClasses(color?: string) {
  switch (color) {
    case 'blue': return 'text-blue-600 dark:text-blue-400';
    case 'green': return 'text-green-600 dark:text-green-400';
    case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
    case 'red': return 'text-red-600 dark:text-red-400';
    case 'purple': return 'text-purple-600 dark:text-purple-400';
    case 'gray': return 'text-gray-600 dark:text-gray-400';
    default: return 'text-foreground';
  }
}

export function StaffBookingsView() {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('confirmed');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<BookingSort>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Availability state
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('customer_request');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Verify by code state (inline)
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyAction, setVerifyAction] = useState<VerifyAction>('check_in');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [quickCheckOpen, setQuickCheckOpen] = useState(false);
  
  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const ITEMS_PER_PAGE = 50;

  // Debounced search handler
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setCurrentPage(1);
  }, 400);

  // Server-side filtered fetch
  const fetchBookings = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Build query params for server-side filtering
      const params = new URLSearchParams();
      params.set('stats', 'true');
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

      const res = await fetch(`/api/bookings/manage?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      setBookings(data.bookings || []);
      setTotalBookings(data.total || 0);
      setStats(data.stats || null);
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch, sort, currentPage]);

  const fetchAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/availability');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load availability');
      
      setAvailability(data.availability || []);
      setSettings(data.settings || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
    
    // Cleanup: abort in-flight requests on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchBookings]);

  // Fetch availability only when tab switches to settings
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchAvailability();
    }
  }, [activeTab, fetchAvailability]);

  // Inline verify by code handler
  async function handleVerifyByCode() {
    const token = verifyCode.trim().toUpperCase();
    if (!token) return;

    setIsVerifying(true);
    setVerifyMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/bookings/manage/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationToken: token, action: verifyAction }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const messages: Record<VerifyAction, string> = {
        check_in: 'Checked in',
        confirm: 'Confirmed',
        complete: 'Completed',
        no_show: 'No-show recorded',
      };
      setVerifyMessage(messages[verifyAction]);
      setVerifyCode('');
      fetchBookings();
      
      // Clear message after 3s
      setTimeout(() => setVerifyMessage(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }

  async function initializeAvailability() {
    setAvailabilityLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize availability');
      
      setAvailability(data.availability || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function updateDayAvailability(dayOfWeek: number, updates: Partial<AvailabilityRule>) {
    const existingRule = availability.find(r => r.dayOfWeek === dayOfWeek);
    const previousAvailability = [...availability];
    
    // Optimistic update for instant feedback
    setAvailability(prev => {
      const idx = prev.findIndex(r => r.dayOfWeek === dayOfWeek);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      return prev;
    });
    
    setSavingDay(dayOfWeek);
    setError(null);
    
    try {
      const res = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setDay',
          dayOfWeek,
          startTime: updates.startTime ?? existingRule?.startTime ?? '09:00',
          endTime: updates.endTime ?? existingRule?.endTime ?? '18:00',
          slotDuration: updates.slotDuration ?? existingRule?.slotDuration ?? 45,
          maxConcurrentBookings: updates.maxConcurrentBookings ?? existingRule?.maxConcurrentBookings ?? 1,
          bufferTime: updates.bufferTime ?? existingRule?.bufferTime ?? 15,
          isActive: updates.isActive ?? existingRule?.isActive ?? true,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Rollback on error
        setAvailability(previousAvailability);
        throw new Error(data.error || 'Failed to update availability');
      }
      
      // Update with server response
      setAvailability(prev => {
        const existing = prev.findIndex(r => r.dayOfWeek === dayOfWeek);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data.rule;
          return updated;
        }
        return [...prev, data.rule];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSavingDay(null);
    }
  }

  async function updateBookingSettings(updates: Partial<BookingSettings>) {
    const previousSettings = settings;
    
    // Optimistic update
    setSettings(prev => prev ? { ...prev, ...updates } : null);
    
    setSavingSettings(true);
    setError(null);
    
    try {
      const res = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSettings',
          ...settings,
          ...updates,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Rollback on error
        setSettings(previousSettings);
        throw new Error(data.error || 'Failed to update settings');
      }
      
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleBookingAction(bookingId: string, action: string, data?: Record<string, any>) {
    // If action is cancel, open the modal instead
    if (action === 'cancel') {
      setCancelModal({ bookingId, isOpen: true });
      return;
    }
    
    setError(null);
    try {
      const res = await fetch(`/api/bookings/manage/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Action failed');
      }

      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  async function handleSubmitCancel() {
    if (!cancelModal) return;
    setIsCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/manage/${cancelModal.bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cancel', 
          reason: cancelReason,
          notes: cancelNotes || undefined 
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to cancel booking');
      }

      setCancelModal(null);
      setCancelReason('customer_request');
      setCancelNotes('');
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  }

  function handleCloseCancel() {
    setCancelModal(null);
    setCancelReason('customer_request');
    setCancelNotes('');
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">Bookings</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground/60 mt-0.5">
              Manage test drive bookings
            </p>
          </div>
          
          {/* Right: Settings & Refresh */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'settings' ? 'bookings' : 'settings')}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-secondary text-foreground' 
                  : 'hover:bg-secondary/50 text-muted-foreground'
              }`}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={activeTab === 'bookings' ? fetchBookings : fetchAvailability}
              disabled={activeTab === 'bookings' ? isLoading : availabilityLoading}
              className="p-1.5 sm:p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground ${(activeTab === 'bookings' ? isLoading : availabilityLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              {/* Row 1: Search + Sort + Check-in */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search */}
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
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
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

                {/* Quick Check-in Dropdown */}
                <Popover open={quickCheckOpen} onOpenChange={setQuickCheckOpen}>
                  <PopoverTrigger asChild>
                    <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Check-in</span>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </PopoverTrigger>
                <PopoverContent align="end" className="w-[280px] p-0" sideOffset={8}>
                  <div className="p-3 border-b border-border/40">
                    <p className="text-sm font-semibold text-foreground">Quick Check-in</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Enter code to update status</p>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {/* Code Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground/70">Booking Code</label>
                      <input
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                        placeholder="e.g. W5ZC2CD6"
                        className="w-full h-10 px-3 bg-muted/30 border border-border/40 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm font-mono placeholder:text-muted-foreground/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyByCode()}
                        autoFocus
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground/70">Action</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { value: 'check_in', label: 'Check-in' },
                          { value: 'confirm', label: 'Confirm' },
                          { value: 'complete', label: 'Complete' },
                          { value: 'no_show', label: 'No-show' },
                        ].map((action) => (
                          <button
                            key={action.value}
                            onClick={() => setVerifyAction(action.value as VerifyAction)}
                            className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                              verifyAction === action.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 border border-border/40 text-foreground hover:bg-muted'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-3 border-t border-border/40 bg-muted/20">
                    <button
                      onClick={() => {
                        handleVerifyByCode();
                        if (verifyCode.trim()) setQuickCheckOpen(false);
                      }}
                      disabled={isVerifying || !verifyCode.trim()}
                      className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isVerifying ? 'Processing...' : 'Apply Action'}
                    </button>
                    
                    {verifyMessage && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-medium mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {verifyMessage}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

              {/* Row 2: Status Pills - Horizontal scroll */}
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
                  {STATUS_TABS.map((tab) => {
                    // Use stats for counts (server-side accurate)
                    const count = stats ? (
                      tab.key === 'all' ? stats.totalBookings
                      : tab.key === 'pending' ? stats.pendingBookings
                      : tab.key === 'confirmed' ? stats.confirmedBookings
                      : tab.key === 'completed' ? stats.completedBookings
                      : tab.key === 'cancelled' ? stats.cancelledBookings
                      : tab.key === 'no_show' ? stats.noShowBookings
                      : 0
                    ) : 0;
                    const isActive = selectedStatus === tab.key;
                    
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setSelectedStatus(tab.key);
                          setCurrentPage(1);
                        }}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all capitalize whitespace-nowrap ${
                          isActive
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        {count > 0 && (
                          <span className="ml-1 sm:ml-1.5 text-muted-foreground">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Booking List - server-filtered bookings */}
            <BookingList
              bookings={bookings}
              isLoading={isLoading}
              selectedStatus={selectedStatus}
              searchQuery={debouncedSearch}
              onAction={handleBookingAction}
            />

            {/* Pagination */}
            {(() => {
              const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);
              if (totalPages <= 1) return null;
              
              return (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/30">
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages} · {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md sm:rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || isLoading}
                      className="px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md sm:rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="pb-24 sm:pb-32">
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              ← Back to bookings
            </button>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/50 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <AvailabilitySettings
              availability={availability}
              settings={settings}
              isLoading={availabilityLoading}
              savingDay={savingDay}
              savingSettings={savingSettings}
              onInitialize={initializeAvailability}
              onUpdateDay={updateDayAvailability}
              onUpdateSettings={updateBookingSettings}
            />
          </div>
        )}

        {/* Cancel Modal */}
        <StaffCancelModal
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
