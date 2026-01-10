/**
 * Staff Bookings View Component
 * Main container for staff bookings management
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('confirmed');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<BookingSort>('newest');
  
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

  // Fetch ALL bookings once - filtering happens client-side
  const fetchBookings = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Fetch ALL bookings with stats - no status filter, client-side filtering for zero-latency toggling
      const res = await fetch(`/api/bookings/manage?stats=true`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - only fetch on mount or manual refresh

  // Client-side filtered bookings for instant status switching with search
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by status (note: 'no_show' tab includes 'expired' bookings)
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
        booking.userName.toLowerCase().includes(query) ||
        booking.userEmail.toLowerCase().includes(query) ||
        (booking.userPhone && booking.userPhone.toLowerCase().includes(query)) ||
        booking.confirmationToken.toLowerCase().includes(query) ||
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

  // Fetch bookings only once on mount
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
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Section */}
        <header className="flex items-start justify-between gap-4">
          {/* Left: Title */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-[15px] font-medium text-muted-foreground/70">
              Manage test drive bookings
            </p>
          </div>
          
          {/* Right: Settings & Refresh */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'settings' ? 'bookings' : 'settings')}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={activeTab === 'bookings' ? fetchBookings : fetchAvailability}
              disabled={activeTab === 'bookings' ? isLoading : availabilityLoading}
              className="w-9 h-9 flex items-center justify-center hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${(activeTab === 'bookings' ? isLoading : availabilityLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

          {/* Status Filter Tabs */}
          {activeTab === 'bookings' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {STATUS_TABS.map((tab) => {
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
          )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="pb-32">
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              ← Back to bookings
            </button>
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

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Toolbar: Search + Sort + Quick Check-in */}
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

              {/* Quick Check-in Dropdown */}
              <Popover open={quickCheckOpen} onOpenChange={setQuickCheckOpen}>
                <PopoverTrigger asChild>
                  <button className="h-10 px-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 text-sm font-medium flex items-center gap-2 transition-colors flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Check-in</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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

            {/* Booking List - now with client-filtered bookings */}
            <BookingList
              bookings={filteredBookings}
              isLoading={isLoading}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onAction={handleBookingAction}
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
    </div>
  );
}
