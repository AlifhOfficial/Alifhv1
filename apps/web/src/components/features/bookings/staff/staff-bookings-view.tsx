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
import { StaffRejectModal } from './staff-reject-modal';
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
type QuickAction = 'confirm' | 'reject' | 'complete' | 'noShow' | 'cancel';
type BookingSort = 'newest' | 'oldest';

// Quick lookup booking info
interface LookedUpBooking {
  id: string;
  status: string;
  userName: string;
  listingTitle: string;
  scheduledStartTime: string;
  confirmationToken: string;
}

// Status tabs configuration
const STATUS_TABS = [
  { key: 'all', label: 'All', color: 'purple' },
  { key: 'pending', label: 'Pending', color: 'yellow' },
  { key: 'confirmed', label: 'Confirmed', color: 'green' },
  { key: 'completed', label: 'Completed', color: 'blue' },
  { key: 'cancelled', label: 'Cancelled', color: 'red' },
  { key: 'rejected', label: 'Rejected', color: 'red' },
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
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ bookingId: string; isOpen: boolean } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Quick action state (lookup-first flow)
  const [verifyCode, setVerifyCode] = useState('');
  const [lookedUpBooking, setLookedUpBooking] = useState<LookedUpBooking | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isApplyingAction, setIsApplyingAction] = useState(false);
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
      params.set('includeStats', 'true');
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

      const res = await fetch(`/api/bookings?staffView=true&myListings=true&${params.toString()}`, {
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
      const res = await fetch('/api/bookings/settings');
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

  // Lookup booking by code
  async function handleLookupByCode() {
    const token = verifyCode.trim().toUpperCase();
    if (!token) return;

    setIsLookingUp(true);
    setVerifyMessage(null);
    setError(null);
    setLookedUpBooking(null);

    try {
      const res = await fetch(`/api/bookings?confirmationToken=${token}&staffView=true&myListings=true`);
      const data = await res.json();
      if (!res.ok || !data.bookings?.length) {
        throw new Error('Booking not found');
      }
      const booking = data.bookings[0];
      setLookedUpBooking({
        id: booking.id,
        status: booking.status,
        userName: booking.userName,
        listingTitle: booking.listingTitle,
        scheduledStartTime: booking.scheduledStartTime,
        confirmationToken: booking.confirmationToken,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setIsLookingUp(false);
    }
  }

  // Apply quick action to looked-up booking
  async function handleApplyQuickAction(action: QuickAction) {
    if (!lookedUpBooking) return;

    // For cancel/reject, use modals instead
    if (action === 'cancel') {
      setCancelModal({ bookingId: lookedUpBooking.id, isOpen: true });
      setQuickCheckOpen(false);
      resetQuickAction();
      return;
    }
    if (action === 'reject') {
      setRejectModal({ bookingId: lookedUpBooking.id, isOpen: true });
      setQuickCheckOpen(false);
      resetQuickAction();
      return;
    }

    setIsApplyingAction(true);
    setVerifyMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${lookedUpBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      const messages: Record<string, string> = {
        confirm: 'Booking confirmed',
        complete: 'Marked as completed',
        noShow: 'Marked as no-show',
      };
      setVerifyMessage(messages[action] || 'Done');
      resetQuickAction();
      fetchBookings();
      
      setTimeout(() => setVerifyMessage(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setIsApplyingAction(false);
    }
  }

  function resetQuickAction() {
    setVerifyCode('');
    setLookedUpBooking(null);
  }

  // Get valid actions based on booking status
  function getValidActions(status: string): { action: QuickAction; label: string; color: string }[] {
    switch (status) {
      case 'pending':
        return [
          { action: 'confirm', label: 'Confirm', color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
          { action: 'reject', label: 'Reject', color: 'bg-red-500/10 hover:bg-red-500/20 text-red-600' },
        ];
      case 'confirmed':
        return [
          { action: 'complete', label: 'Complete', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
          { action: 'noShow', label: 'No-show', color: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600' },
          { action: 'cancel', label: 'Cancel', color: 'bg-red-500/10 hover:bg-red-500/20 text-red-600' },
        ];
      default:
        return [];
    }
  }

  async function initializeAvailability() {
    setAvailabilityLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/settings', {
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
      const res = await fetch('/api/bookings/settings', {
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
      const res = await fetch('/api/bookings/settings', {
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
    
    // If action is reject, open the reject modal instead
    if (action === 'reject') {
      setRejectModal({ bookingId, isOpen: true });
      return;
    }
    
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
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
      const res = await fetch(`/api/bookings/${cancelModal.bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cancel', 
          // Combine reason and notes into full text
          notes: [cancelReason, cancelNotes].filter(Boolean).join(': ') || undefined,
          cancellationReason: 'other' // Staff cancellations default to 'other'
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to cancel booking');
      }

      setCancelModal(null);
      setCancelReason('');
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
    setCancelReason('');
    setCancelNotes('');
  }

  async function handleSubmitReject() {
    if (!rejectModal) return;
    setIsRejecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${rejectModal.bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject', 
          reason: rejectReason,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to reject booking');
      }

      setRejectModal(null);
      setRejectReason('');
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking');
    } finally {
      setIsRejecting(false);
    }
  }

  function handleCloseReject() {
    setRejectModal(null);
    setRejectReason('');
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

                {/* Quick Action Dropdown */}
                <Popover open={quickCheckOpen} onOpenChange={(open) => {
                  setQuickCheckOpen(open);
                  if (!open) resetQuickAction();
                }}>
                  <PopoverTrigger asChild>
                    <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Quick Action</span>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-[calc(100vw-2rem)] sm:w-[320px] max-w-[320px] p-0" 
                  sideOffset={8}
                  collisionPadding={16}
                >
                  <div className="p-3 border-b border-border/40">
                    <p className="text-sm font-semibold text-foreground">Quick Action</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Enter booking code to update status</p>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {/* Code Input */}
                    {!lookedUpBooking && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground/70">Booking Code</label>
                        <div className="flex gap-2">
                          <input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                            placeholder="e.g. W5ZC2CD6"
                            className="flex-1 min-w-0 h-10 px-3 bg-muted/30 border border-border/40 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm font-mono placeholder:text-muted-foreground/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleLookupByCode()}
                            autoFocus
                          />
                          <button
                            onClick={handleLookupByCode}
                            disabled={isLookingUp || !verifyCode.trim()}
                            className="h-10 px-3 sm:px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {isLookingUp ? '...' : 'Go'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Booking Info (after lookup) */}
                    {lookedUpBooking && (
                      <div className="space-y-3">
                        {/* Booking summary */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground line-clamp-1 min-w-0">{lookedUpBooking.listingTitle}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
                              lookedUpBooking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                              lookedUpBooking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                              lookedUpBooking.status === 'completed' ? 'bg-blue-500/10 text-blue-600' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {lookedUpBooking.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{lookedUpBooking.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lookedUpBooking.scheduledStartTime).toLocaleDateString('en-AE', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                              timeZone: 'Asia/Dubai'
                            })}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground/60">{lookedUpBooking.confirmationToken}</p>
                        </div>
                        
                        {/* Valid actions */}
                        {getValidActions(lookedUpBooking.status).length > 0 ? (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground/70">Actions</label>
                            <div className="flex flex-wrap gap-1.5">
                              {getValidActions(lookedUpBooking.status).map((actionItem) => (
                                <button
                                  key={actionItem.action}
                                  onClick={() => handleApplyQuickAction(actionItem.action)}
                                  disabled={isApplyingAction}
                                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${actionItem.color}`}
                                >
                                  {actionItem.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">No actions available for this status</p>
                        )}
                        
                        {/* Reset button */}
                        <button
                          onClick={resetQuickAction}
                          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Look up another booking
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Success message */}
                  {verifyMessage && (
                    <div className="p-3 border-t border-border/40 bg-emerald-500/5">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {verifyMessage}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

              {/* Row 2: Status Pills - Horizontal scroll */}
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
                  {STATUS_TABS.map((tab) => {
                    // Use stats for counts (server-side accurate)
                    const count = stats ? (
                      tab.key === 'all' ? stats.total
                      : tab.key === 'pending' ? stats.pending
                      : tab.key === 'confirmed' ? stats.confirmed
                      : tab.key === 'completed' ? stats.completed
                      : tab.key === 'cancelled' ? stats.cancelled
                      : tab.key === 'rejected' ? stats.rejected
                      : tab.key === 'no_show' ? stats.noShow
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

        {/* Reject Modal */}
        <StaffRejectModal
          isOpen={rejectModal?.isOpen ?? false}
          reason={rejectReason}
          isSubmitting={isRejecting}
          onReasonChange={setRejectReason}
          onSubmit={handleSubmitReject}
          onClose={handleCloseReject}
        />
    </div>
  );
}
