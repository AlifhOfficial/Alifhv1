/**
 * Booking Modal Component
 * Clean, minimal design matching profile/settings views
 */

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
  CarFront, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { cn } from '@/utils';

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
  listingThumbnail,
  partnerName,
  partnerAddress,
  isAuthenticated,
  onLoginRequired,
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
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  
  // Booking form
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [attendees, setAttendees] = useState(1);
  
  // Result
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    confirmationToken: string;
  } | null>(null);

  // Fetch available dates when modal opens
  useEffect(() => {
    if (isOpen && listingId) {
      fetchAvailableDates();
    }
  }, [isOpen, listingId]);

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

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

  async function fetchAvailableDates() {
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
  }

  async function fetchTimeSlots(date: Date) {
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
  }

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
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto bg-background border-border/40 rounded-xl p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              {step === 'success' ? 'Booking Confirmed' : 'Schedule Test Drive'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {step === 'date' && 'Select an available date'}
              {step === 'time' && 'Choose your preferred time'}
              {step === 'confirm' && 'Review your booking'}
              {step === 'success' && 'Your appointment is confirmed'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Listing Info */}
        <div className="mx-6 mt-5 flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-sidebar">
          <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
            {listingThumbnail ? (
              <img 
                src={listingThumbnail} 
                alt={listingTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CarFront className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{listingTitle}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{partnerName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 mb-5 bg-destructive/10 rounded-xl border border-destructive/20">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground/70 mt-4">Loading...</p>
            </div>
          )}

          {/* Step 1: Date Selection */}
          {step === 'date' && !isLoading && !error && (
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-muted/30 rounded-lg transition-colors disabled:opacity-30"
                  disabled={currentMonth <= new Date()}
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                  {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground/70 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

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
                        "aspect-square rounded-lg text-sm font-medium transition-colors",
                        isSelected && "bg-foreground text-background",
                        !isSelected && isAvailable && "hover:bg-muted/50 text-foreground",
                        !isSelected && !isAvailable && "text-muted-foreground/30 cursor-not-allowed",
                        isToday && !isSelected && "ring-1 ring-border"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground/70 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-foreground" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-muted/50" />
                  <span>Available</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && !isLoading && selectedDate && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('date')}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="py-3 border-b border-border/20">
                <p className="text-sm font-semibold text-muted-foreground/70">Selected Date</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(selectedDate)}</p>
              </div>

              {timeSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No available times</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try a different date</p>
                </div>
              ) : (
                <div>
                  <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Available Times</p>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={cn(
                          "py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
                          selectedSlot?.id === slot.id && "bg-foreground text-background",
                          selectedSlot?.id !== slot.id && slot.isAvailable && "bg-sidebar border border-border/40 hover:border-border text-foreground",
                          !slot.isAvailable && "bg-muted/20 text-muted-foreground/30 cursor-not-allowed line-through"
                        )}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSlot && (
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedDate && selectedSlot && (
            <div className="space-y-5">
              <button
                onClick={() => setStep('time')}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Booking Summary - 2 columns */}
              <div className="rounded-xl border border-border/40 bg-sidebar p-5">
                <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Date</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Time</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Duration</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedSlot.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Location</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {partnerAddress || <span className="text-muted-foreground/60">Contact dealer</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground/70 mb-1.5 block">
                    Attendees
                  </label>
                  <Select value={attendees.toString()} onValueChange={(value) => setAttendees(parseInt(value))}>
                    <SelectTrigger className="w-full h-10 bg-muted/20 border-border/40 text-sm rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} {n === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground/70 mb-1.5 block">
                    Notes <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any questions about the car?"
                    rows={2}
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground/70 mb-1.5 block">
                    Special requests <span className="font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Financing info, route preference..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-muted/20 border border-border/40 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {!isAuthenticated ? (
                <button 
                  onClick={onLoginRequired} 
                  className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                >
                  Sign in to Book
                </button>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && bookingResult && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold tracking-tight text-foreground">Test Drive Scheduled</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Confirmation: <span className="font-mono font-semibold text-foreground">{bookingResult.confirmationToken}</span>
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-sidebar p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Vehicle</p>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">{listingTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Dealer</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{partnerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Date</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedDate && formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground/70">Time</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedSlot && `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/70 text-center">
                A confirmation email has been sent. The dealer will confirm your booking shortly.
              </p>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={onClose} 
                  className="flex-1 py-2.5 rounded-lg border border-border/40 hover:bg-muted/30 text-sm font-semibold transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => router.push('/user-dashboard/bookings')} 
                  className="flex-1 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                >
                  View Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
