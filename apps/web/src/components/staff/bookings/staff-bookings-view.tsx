/**
 * Staff Bookings View Component
 * Main container for staff bookings management
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AlertCircle,
  RefreshCw,
  Settings,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/utils';
import { DashboardPageLayout } from '@/components/layout';
import type { BookingData, BookingStats, AvailabilityRule, BookingSettings } from './types';
import { BookingStatsCards } from './booking-stats';
import { BookingFilters } from './booking-filters';
import { BookingList } from './booking-list';
import { AvailabilitySettings } from './availability-settings';
import { BookingVerifyByCode } from './booking-verify-by-code';

type TabType = 'bookings' | 'availability';

export function StaffBookingsView() {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Availability state
  const [availability, setAvailability] = useState<AvailabilityRule[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Abort controller for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBookings = useCallback(async () => {
    // Cancel any in-flight request to prevent race conditions
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const statusParam = selectedStatus !== 'all' ? `&status=${selectedStatus}` : '';
      const res = await fetch(`/api/bookings/manage?stats=true${statusParam}`, {
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
  }, [selectedStatus]);

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

  useEffect(() => {
    fetchBookings();
    
    // Cleanup: abort in-flight requests on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchBookings]);

  useEffect(() => {
    if (activeTab === 'availability') {
      fetchAvailability();
    }
  }, [activeTab, fetchAvailability]);

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
    setSavingDay(dayOfWeek);
    setError(null);
    try {
      const existingRule = availability.find(r => r.dayOfWeek === dayOfWeek);
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
      if (!res.ok) throw new Error(data.error || 'Failed to update availability');
      
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
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleBookingAction(bookingId: string, action: string, data?: Record<string, any>) {
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

  return (
    <DashboardPageLayout
      title="Bookings"
      headerActions={
        <div className="flex items-center gap-2">
          {activeTab === 'bookings' && (
            <button
              onClick={fetchBookings}
              disabled={isLoading}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          {activeTab === 'availability' && (
            <button
              onClick={fetchAvailability}
              disabled={availabilityLoading}
              className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {availabilityLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-secondary/30 rounded-full w-fit">
          <button
            onClick={() => setActiveTab('bookings')}
            className={cn(
              "px-5 py-2 rounded-full text-sm transition-all",
              activeTab === 'bookings'
                ? "bg-blue-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={cn(
              "px-5 py-2 rounded-full text-sm transition-all",
              activeTab === 'availability'
                ? "bg-blue-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            Availability
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Availability Settings Tab */}
        {activeTab === 'availability' && (
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
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            <BookingVerifyByCode onSuccess={fetchBookings} />
            {stats && <BookingStatsCards stats={stats} />}
            <BookingFilters 
              selectedStatus={selectedStatus} 
              onStatusChange={setSelectedStatus} 
            />
            <BookingList
              bookings={bookings}
              isLoading={isLoading}
              selectedStatus={selectedStatus}
              onAction={handleBookingAction}
            />
          </>
        )}
      </div>
    </DashboardPageLayout>
  );
}
