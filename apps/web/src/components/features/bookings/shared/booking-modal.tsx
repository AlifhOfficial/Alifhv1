/**
 * Booking Modal Component
 * Clean, minimal design matching profile/settings views
 */

'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';
import type { PublicBookingAvailabilityResponse } from '@/lib/bookings/public-availability';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'available' | 'booked' | 'blocked' | 'past';
  isAvailable: boolean;
}

interface AvailableDate {
  date: string;
  dayOfWeek: number;
  hasSlots: boolean;
}

interface BookingSettings {
  minLeadTimeHours: number;
  maxLeadTimeDays: number;
  defaultSlotDuration: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  partnerName: string;
  partnerAddress?: string | null;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
  initialAvailability?: PublicBookingAvailabilityResponse | null;
}

type BookingStep = 'date' | 'time' | 'confirm' | 'success';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BOOKING_TIME_ZONE = 'Asia/Dubai';

function toUtcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function BookingModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingThumbnail: _listingThumbnail,
  partnerName: _partnerName,
  partnerAddress: _partnerAddress,
  isAuthenticated,
  onLoginRequired,
  initialAvailability,
}: BookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Booking settings
  const [_settings, setSettings] = useState<BookingSettings | null>(null);
  
  // Booking form
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [attendees, setAttendees] = useState(1);
  
  // Result
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    confirmationToken: string;
  } | null>(null);
  const hasHydratedAvailabilityRef = React.useRef(false);

  const fetchAvailableDates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/bookings/slots?listingId=${listingId}&mode=dates&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load availability');
      }

      if (!data.available) {
        setError(data.reason || 'Bookings not available');
        return;
      }

      setAvailableDates(data.dates || []);
      setSettings(data.settings || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const fetchTimeSlots = useCallback(async (date: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dateStr = toUtcDateKey(date);
      const res = await fetch(`/api/bookings/slots?listingId=${listingId}&date=${dateStr}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load time slots');
      }

      setTimeSlots(data.slots || []);
      setStep('time');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  // Fetch available dates when modal opens
  useEffect(() => {
    if (isOpen && listingId) {
      if (!hasHydratedAvailabilityRef.current && initialAvailability) {
        hasHydratedAvailabilityRef.current = true;
        setError(initialAvailability.available ? null : (initialAvailability.reason || 'Bookings not available'));
        setAvailableDates(initialAvailability.dates || []);
        setSettings(initialAvailability.settings || null);
        return;
      }
      fetchAvailableDates();
    }
  }, [isOpen, listingId, initialAvailability, fetchAvailableDates]);

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const dateKey = toUtcDateKey(selectedDate);
      const prefetchedSlots = initialAvailability?.slotsByDate?.[dateKey];
      if (prefetchedSlots) {
        setTimeSlots(prefetchedSlots);
        setStep('time');
        setError(null);
        return;
      }
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, initialAvailability, fetchTimeSlots]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('date');
        setSelectedDate(null);
        setSelectedSlot(null);
        setNotes('');
        setSpecialRequests('');
        setAttendees(1);
        setBookingResult(null);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  async function handleBooking() {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    if (!selectedDate || !selectedSlot) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          scheduledDate: toUtcDateKey(selectedDate),
          scheduledStartTime: selectedSlot.startTime,
          scheduledEndTime: selectedSlot.endTime,
          notes: notes || undefined,
          specialRequests: specialRequests || undefined,
          numberOfAttendees: attendees,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Rate limited / abuse prevention
          setError(data.error || 'You have reached the booking limit. Please try again later.');
        } else {
          const message = data.error || 'Failed to create booking';
          setError(message);

          // If the slot was taken between selection and submit, refresh slots immediately
          // so the user sees the accurate availability.
          if (
            message.toLowerCase().includes('no longer available') ||
            message.toLowerCase().includes('already booked')
          ) {
            setSelectedSlot(null);
            await fetchTimeSlots(selectedDate);
          }

          return;
        }
        return;
      }

      setBookingResult({
        bookingId: data.bookingId,
        confirmationToken: data.confirmationToken,
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  }

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    const startingDay = firstDay.getUTCDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(Date.UTC(year, month, i)));
    }

    return days;
  };

  // Check if a date has available slots
  const isDateAvailable = (date: Date) => {
    const dateStr = toUtcDateKey(date);
    const availableDate = availableDates.find(d => d.date === dateStr);
    return availableDate?.hasSlots ?? false;
  };

  // Check if a date is in the past
  const isDatePast = (date: Date) => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    return date.getTime() < todayUtc.getTime();
  };

  // Format time for display
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-AE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: BOOKING_TIME_ZONE,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-popover border-border/40 rounded-xl p-0 overflow-hidden">
        
        {/* Success State - Centered */}
        {step === 'success' && bookingResult ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-headline font-semibold text-foreground mb-1">Booking Requested</h2>
            <p className="text-subhead text-muted-foreground/70 mb-1">{listingTitle}</p>
            <p className="text-caption1 text-muted-foreground/50 mb-4">
              {selectedDate && formatDate(selectedDate)} • {selectedSlot && formatTime(selectedSlot.startTime)}
            </p>
            <p className="text-caption1 text-muted-foreground/60 mb-4">The dealer will confirm your booking shortly.</p>
            <p className="font-mono text-subhead font-semibold text-foreground mb-6">{bookingResult.confirmationToken}</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/user-dashboard/bookings')} 
                className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-semibold transition-colors"
              >
                View Bookings
              </button>
              <button 
                onClick={onClose} 
                className="w-full h-11 text-subhead font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle className="text-headline font-semibold text-foreground">
                  {step === 'confirm' ? 'Confirm Booking' : 'Schedule Test Drive'}
                </DialogTitle>
                <DialogDescription className="text-subhead text-muted-foreground/70">
                  {listingTitle}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Error */}
              {error && (
                <p className="text-subhead text-destructive mb-4">{error}</p>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {/* Date Selection */}
              {step === 'date' && !isLoading && !error && (
                <div className="space-y-4">
                  {/* Month Nav */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousMonth}
                      disabled={currentMonth <= new Date()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-subhead font-medium">
                      {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={goToNextMonth}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map(day => (
                      <div key={day} className="text-center text-caption2 font-medium text-muted-foreground/50 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, index) => {
                      if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                      
                      const isPast = isDatePast(date);
                      const isAvailable = !isPast && isDateAvailable(date);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => isAvailable && setSelectedDate(date)}
                          disabled={!isAvailable}
                          className={cn(
                            "aspect-square rounded-lg text-subhead transition-colors",
                            isSelected && "bg-primary text-primary-foreground font-semibold",
                            !isSelected && isAvailable && "hover:bg-muted/50 font-medium",
                            !isSelected && !isAvailable && "text-muted-foreground/20",
                            isToday && !isSelected && "text-primary font-semibold"
                          )}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              {step === 'time' && !isLoading && selectedDate && (
                <div className="space-y-4">
                  <button
                    onClick={() => setStep('date')}
                    className="text-subhead text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← {formatDate(selectedDate)}
                  </button>

                  {timeSlots.length === 0 ? (
                    <p className="text-subhead text-muted-foreground/70 text-center py-8">No times available</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                          disabled={!slot.isAvailable}
                          className={cn(
                            "py-2 rounded-lg text-subhead transition-colors",
                            selectedSlot?.id === slot.id && "bg-primary text-primary-foreground font-semibold",
                            selectedSlot?.id !== slot.id && slot.isAvailable && "hover:bg-muted/50 font-medium",
                            !slot.isAvailable && "text-muted-foreground/20 line-through"
                          )}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSlot && (
                    <button
                      onClick={() => setStep('confirm')}
                      className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-semibold transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}

              {/* Confirmation */}
              {step === 'confirm' && selectedDate && selectedSlot && (
                <div className="space-y-4">
                  <button
                    onClick={() => setStep('time')}
                    className="text-subhead text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change time
                  </button>

                  <div className="py-3 space-y-1 border-b border-border/30">
                    <p className="text-subhead font-medium">{formatDate(selectedDate)}</p>
                    <p className="text-subhead text-muted-foreground/70">
                      {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)} • {selectedSlot.duration} min
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-caption1 font-medium text-muted-foreground/70 mb-1.5 block">Attendees</label>
                      <Select value={attendees.toString()} onValueChange={(value) => setAttendees(parseInt(value))}>
                        <SelectTrigger className="w-full h-10 border-border/30 text-subhead rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'person' : 'people'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-caption1 font-medium text-muted-foreground/70 mb-1.5 block">
                        Notes <span className="text-muted-foreground/40">(optional)</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Questions or requests..."
                        rows={2}
                        className="w-full px-3 py-2 border border-border/30 rounded-lg text-subhead resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <button 
                      onClick={onLoginRequired} 
                      className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-semibold transition-colors"
                    >
                      Sign in to Book
                    </button>
                  ) : (
                    <button
                      onClick={handleBooking}
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-subhead font-semibold transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
