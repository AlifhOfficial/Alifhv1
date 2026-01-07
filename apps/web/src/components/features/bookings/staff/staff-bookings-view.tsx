/**
 * Staff Bookings View Component
 * Main container for staff bookings management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, Settings } from 'lucide-react';
import type { BookingData, BookingStats, AvailabilityRule, BookingSettings } from './types';
import { BookingList } from './booking-list';
import { AvailabilitySettings } from './availability-settings';
import { StaffCancelModal } from './staff-cancel-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

type TabType = 'bookings' | 'settings';
type VerifyAction = 'check_in' | 'confirm' | 'complete' | 'no_show';

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

  // Client-side filtered bookings for instant status switching
  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === selectedStatus);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Header Section - Sticky */}
        <section className="space-y-4 sticky top-0 bg-background z-10 pt-8 sm:pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
              <p className="text-[15px] font-medium text-muted-foreground/70 mt-2">
                Manage test drive bookings
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab(activeTab === 'settings' ? 'bookings' : 'settings')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-muted text-foreground' 
                    : 'hover:bg-muted/40 text-muted-foreground'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={activeTab === 'bookings' ? fetchBookings : fetchAvailability}
                disabled={activeTab === 'bookings' ? isLoading : availabilityLoading}
                className="p-2 hover:bg-muted/40 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Inline Verify by Code */}
          {activeTab === 'bookings' && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                placeholder="Enter booking code"
                className="w-44 h-10 px-3 bg-secondary/30 border border-border/40 rounded-lg focus:border-foreground/40 focus:bg-secondary/50 outline-none transition-all text-sm font-mono placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyByCode()}
              />
              <Select value={verifyAction} onValueChange={(v) => setVerifyAction(v as VerifyAction)}>
                <SelectTrigger className="w-32 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in">Check-in</SelectItem>
                  <SelectItem value="confirm">Confirm</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="no_show">No-show</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={handleVerifyByCode}
                disabled={isVerifying || !verifyCode.trim()}
                className="h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isVerifying ? '...' : 'Apply'}
              </button>
              {verifyMessage && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {verifyMessage}
                </span>
              )}
            </div>
          )}

          {/* Status Filter Tabs - Part of sticky header when in bookings mode */}
          {activeTab === 'bookings' && (
            <div className="border-b border-border/40">
              <div className="flex gap-1 overflow-x-auto pb-px">
                {STATUS_TABS.map((tab) => {
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
          )}
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="mt-6 pb-32">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Availability Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure booking slots and availability</p>
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to bookings
              </button>
            </div>
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
          <div className="mt-6 pb-32">
            {/* Booking List - now with client-filtered bookings */}
            <BookingList
              bookings={filteredBookings}
              isLoading={isLoading}
              selectedStatus={selectedStatus}
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
