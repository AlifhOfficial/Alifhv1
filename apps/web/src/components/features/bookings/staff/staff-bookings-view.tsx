/**
 * Staff Bookings View Component
 * Main container for staff bookings management
 */

'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, CheckCircle2, Settings, Search, X, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface StaffBookingsInitialData {
  bookings: BookingData[];
  total: number;
  stats: BookingStats | null;
}

interface StaffBookingsViewProps {
  initialData: StaffBookingsInitialData;
  initialSettingsData?: {
    availability: AvailabilityRule[];
    settings: BookingSettings | null;
  };
  filters: {
    status: string;
    sort: BookingSort;
    page: number;
    q: string;
  };
}

// Main status tabs (always visible)
const MAIN_STATUS_TABS = [
  { key: 'all', label: 'All', color: 'purple' },
  { key: 'pending', label: 'Pending', color: 'yellow' },
  { key: 'confirmed', label: 'Confirmed', color: 'green' },
  { key: 'completed', label: 'Completed', color: 'blue' },
];

// Secondary status tabs (in More dropdown)
const SECONDARY_STATUS_TABS = [
  { key: 'cancelled', label: 'Cancelled', color: 'red' },
  { key: 'rejected', label: 'Rejected', color: 'red' },
  { key: 'no_show', label: 'No Show', color: 'gray' },
];

function _getColorClasses(color?: string) {
  switch (color) {
    case 'blue': return 'text-primary';
    case 'green': return 'text-success';
    case 'yellow': return 'text-warning';
    case 'red': return 'text-destructive';
    case 'purple': return 'text-purple-600 dark:text-purple-400';
    case 'gray': return 'text-gray-600 dark:text-gray-400';
    default: return 'text-foreground';
  }
}

export function StaffBookingsView({ initialData, initialSettingsData, filters }: StaffBookingsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [searchQuery, setSearchQuery] = useState(filters.q);
  const [error, setError] = useState<string | null>(null);
  const bookings = initialData.bookings;
  const totalBookings = initialData.total;
  const stats = initialData.stats;
  const selectedStatus = filters.status;
  const debouncedSearch = filters.q;
  const sort = filters.sort;
  const currentPage = filters.page;
  const isLoading = isPending;
  
  // Availability state
  const [availability, setAvailability] = useState<AvailabilityRule[]>(() => initialSettingsData?.availability || []);
  const [settings, setSettings] = useState<BookingSettings | null>(() => initialSettingsData?.settings || null);
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
  
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (!initialSettingsData) return;
    setAvailability(initialSettingsData.availability);
    setSettings(initialSettingsData.settings);
  }, [initialSettingsData]);

  const updateRoute = useCallback((updates: Partial<StaffBookingsViewProps['filters']>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const nextStatus = updates.status ?? selectedStatus;
    const nextSort = updates.sort ?? sort;
    const nextPage = updates.page ?? currentPage;
    const nextQuery = updates.q ?? debouncedSearch;

    if (nextStatus === 'confirmed') params.delete('status');
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

  // Fetch availability only when tab switches to settings
  useEffect(() => {
    if (activeTab === 'settings') {
      if (initialSettingsData) return;
      fetchAvailability();
    }
  }, [activeTab, fetchAvailability, initialSettingsData]);

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
      startTransition(() => {
        router.refresh();
      });
      
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
          { action: 'reject', label: 'Reject', color: 'bg-destructive-muted hover:bg-destructive/15 text-destructive' },
        ];
      case 'confirmed':
        return [
          { action: 'complete', label: 'Complete', color: 'bg-primary hover:bg-primary/90 text-white' },
          { action: 'noShow', label: 'No-show', color: 'bg-warning-muted hover:bg-warning/15 text-warning' },
          { action: 'cancel', label: 'Cancel', color: 'bg-destructive-muted hover:bg-destructive/15 text-destructive' },
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

      startTransition(() => {
        router.refresh();
      });
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
      if (selectedStatus !== 'cancelled') {
        updateRoute({ status: 'cancelled', page: 1 });
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
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
      if (selectedStatus !== 'rejected') {
        updateRoute({ status: 'rejected', page: 1 });
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
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
    <div className="space-y-4 compact:space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div>
            <h1 className="text-callout compact:text-headline font-semibold text-foreground">Bookings</h1>
            <p className="text-caption2 compact:text-caption1 text-muted-foreground/60 mt-0.5">
              Manage test drive bookings
            </p>
          </div>
          
          {/* Right: Settings & Refresh */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'settings' ? 'bookings' : 'settings')}
              className={`p-1.5 compact:p-2 rounded-full transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-secondary text-foreground' 
                  : 'hover:bg-secondary/50 text-muted-foreground'
              }`}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 compact:w-4 compact:h-4" />
            </button>
            <button
              onClick={activeTab === 'bookings'
                ? () => startTransition(() => router.refresh())
                : fetchAvailability}
              disabled={activeTab === 'bookings' ? isLoading : availabilityLoading}
              className="p-1.5 compact:p-2 rounded-full hover:bg-secondary/50 active:bg-secondary transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 compact:w-4 compact:h-4 text-muted-foreground ${(activeTab === 'bookings' ? isLoading : availabilityLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 compact:space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              {/* Row 1: Search + Sort + Check-in */}
              <div className="flex items-center gap-2 compact:gap-3">
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
                    className="w-full h-9 compact:h-10 pl-9 compact:pl-10 pr-8 rounded-lg compact:rounded-xl bg-secondary/50 text-caption1 compact:text-subhead placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        handleSearchChange('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
                    >
                      <X className="w-3 h-3 compact:w-3.5 compact:h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <Select value={sort} onValueChange={(v) => {
                  setError(null);
                  updateRoute({ sort: v as BookingSort, page: 1 });
                }}>
                  <SelectTrigger className="h-9 compact:h-10 w-24 compact:w-28 border-0 bg-secondary/50 rounded-lg compact:rounded-xl text-caption1 compact:text-subhead shrink-0">
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
                    <button className="h-9 compact:h-10 px-3 compact:px-4 rounded-lg compact:rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-caption1 compact:text-subhead flex items-center gap-1.5 compact:gap-2 transition-colors flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 compact:w-4 compact:h-4" />
                      <span className="hidden compact:inline">Quick Action</span>
                      <ChevronDown className="w-3 h-3 compact:w-3.5 compact:h-3.5" />
                    </button>
                  </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-[calc(100vw-2rem)] compact:w-[320px] max-w-[320px] p-0" 
                  sideOffset={8}
                  collisionPadding={16}
                >
                  <div className="p-3 border-b border-border/40">
                    <p className="text-subhead font-semibold text-foreground">Quick Action</p>
                    <p className="text-caption1 text-muted-foreground/70 mt-0.5">Enter booking code to update status</p>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {/* Code Input */}
                    {!lookedUpBooking && (
                      <div className="space-y-1.5">
                        <label className="text-caption1 font-semibold text-muted-foreground/70">Booking Code</label>
                        <div className="flex gap-2">
                          <input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                            placeholder="e.g. W5ZC2CD6"
                            className="flex-1 min-w-0 h-10 px-3 bg-muted/30 border border-border/40 rounded-lg focus:ring-1 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-subhead font-mono placeholder:text-muted-foreground/50"
                            onKeyDown={(e) => e.key === 'Enter' && handleLookupByCode()}
                            autoFocus
                          />
                          <button
                            onClick={handleLookupByCode}
                            disabled={isLookingUp || !verifyCode.trim()}
                            className="h-10 px-3 compact:px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead transition-colors disabled:opacity-50 flex-shrink-0"
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
                            <p className="text-subhead text-foreground line-clamp-1 min-w-0">{lookedUpBooking.listingTitle}</p>
                            <span className={`text-caption2 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
                              lookedUpBooking.status === 'pending' ? 'bg-warning-muted text-warning' :
                              lookedUpBooking.status === 'confirmed' ? 'bg-success-muted text-success' :
                              lookedUpBooking.status === 'completed' ? 'bg-primary-muted text-primary' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {lookedUpBooking.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-caption1 text-muted-foreground truncate">{lookedUpBooking.userName}</p>
                          <p className="text-caption1 text-muted-foreground">
                            {new Date(lookedUpBooking.scheduledStartTime).toLocaleDateString('en-AE', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                              timeZone: 'Asia/Dubai'
                            })}
                          </p>
                          <p className="text-caption2 font-mono text-muted-foreground/60">{lookedUpBooking.confirmationToken}</p>
                        </div>
                        
                        {/* Valid actions */}
                        {getValidActions(lookedUpBooking.status).length > 0 ? (
                          <div className="space-y-1.5">
                            <label className="text-caption1 font-semibold text-muted-foreground/70">Actions</label>
                            <div className="flex flex-wrap gap-1.5">
                              {getValidActions(lookedUpBooking.status).map((actionItem) => (
                                <button
                                  key={actionItem.action}
                                  onClick={() => handleApplyQuickAction(actionItem.action)}
                                  disabled={isApplyingAction}
                                  className={`h-8 px-3 rounded-lg text-caption1 font-semibold transition-colors disabled:opacity-50 ${actionItem.color}`}
                                >
                                  {actionItem.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-caption1 text-muted-foreground text-center py-2">No actions available for this status</p>
                        )}
                        
                        {/* Reset button */}
                        <button
                          onClick={resetQuickAction}
                          className="w-full text-caption1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Look up another booking
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Success message */}
                  {verifyMessage && (
                    <div className="p-3 border-t border-border/40 bg-emerald-500/5">
                      <div className="flex items-center justify-center gap-1.5 text-caption1 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {verifyMessage}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

              {/* Row 2: Status Pills - Horizontal scroll */}
              <div className="-mx-4 px-4 compact:mx-0 compact:px-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
                  {MAIN_STATUS_TABS.map((tab) => {
                    // Use stats for counts (server-side accurate)
                    const count = stats ? (
                      tab.key === 'all' ? stats.total
                      : tab.key === 'pending' ? stats.pending
                      : tab.key === 'confirmed' ? stats.confirmed
                      : tab.key === 'completed' ? stats.completed
                      : 0
                    ) : 0;
                    const isActive = selectedStatus === tab.key;
                    
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setError(null);
                          updateRoute({ status: tab.key, page: 1 });
                        }}
                        className={`px-2.5 compact:px-3 py-1 compact:py-1.5 rounded-lg text-caption2 compact:text-caption1 transition-all capitalize whitespace-nowrap ${
                          isActive
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        <span className="ml-1 compact:ml-1.5 text-muted-foreground">{count}</span>
                      </button>
                    );
                  })}
                  
                  {/* More dropdown for secondary statuses */}
                  {(() => {
                    const secondaryWithCounts = SECONDARY_STATUS_TABS.map(tab => ({
                      ...tab,
                      count: stats ? (
                        tab.key === 'cancelled' ? stats.cancelled
                        : tab.key === 'rejected' ? stats.rejected
                        : tab.key === 'no_show' ? stats.noShow
                        : 0
                      ) : 0
                    })).filter(tab => tab.count > 0);
                    
                    if (secondaryWithCounts.length === 0) return null;
                    
                    const isSecondarySelected = SECONDARY_STATUS_TABS.some(tab => tab.key === selectedStatus);
                    const selectedSecondaryTab = secondaryWithCounts.find(tab => tab.key === selectedStatus);
                    
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`px-2.5 compact:px-3 py-1 compact:py-1.5 rounded-lg text-caption2 compact:text-caption1 transition-all flex items-center gap-1 whitespace-nowrap ${
                              isSecondarySelected
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {isSecondarySelected && selectedSecondaryTab ? (
                              <>
                                {selectedSecondaryTab.label}
                                <span className="text-muted-foreground">{selectedSecondaryTab.count}</span>
                              </>
                            ) : (
                              <>More</>
                            )}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                          {secondaryWithCounts.map((tab) => (
                            <DropdownMenuItem
                              key={tab.key}
                              onClick={() => {
                                setError(null);
                                updateRoute({ status: tab.key, page: 1 });
                              }}
                              className={`text-caption1 cursor-pointer ${
                                selectedStatus === tab.key ? 'bg-secondary' : ''
                              }`}
                            >
                              <span className="flex-1">{tab.label}</span>
                              <span className="text-muted-foreground ml-2">{tab.count}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 compact:mb-8 p-3 compact:p-4 rounded-lg compact:rounded-xl bg-secondary/50 text-caption1 compact:text-subhead">
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
                <div className="flex flex-col compact:flex-row items-center justify-center gap-2 compact:gap-3 mt-6 compact:mt-8 pt-4 compact:pt-6 border-t border-border/30">
                  <p className="text-caption2 compact:text-caption1 text-muted-foreground">
                    Page {currentPage} of {totalPages} · {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRoute({ page: Math.max(1, currentPage - 1) })}
                      disabled={currentPage === 1 || isLoading}
                      className="px-3 py-1.5 text-caption2 compact:text-caption1 rounded-md compact:rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => updateRoute({ page: Math.min(totalPages, currentPage + 1) })}
                      disabled={currentPage === totalPages || isLoading}
                      className="px-3 py-1.5 text-caption2 compact:text-caption1 rounded-md compact:rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <div className="pb-24 compact:pb-32">
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-caption1 compact:text-subhead text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              ← Back to bookings
            </button>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 compact:mb-8 p-3 compact:p-4 rounded-lg compact:rounded-xl bg-secondary/50 text-caption1 compact:text-subhead">
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
