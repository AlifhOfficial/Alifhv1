/**
 * Booking Modal Component
 * 
 * A calendar-based booking modal for scheduling test drives.
 * Shows available dates and time slots for the selected listing.
 * 
 * Features:
 * - Date picker with available dates highlighted
 * - Time slot selection with 45-minute intervals
 * - Anti-abuse restrictions display
 * - Confirmation flow
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
import { Button } from '@/components/ui/forms';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Phone,
  Mail
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
  preparationInstructions: string | null;
  directions: string | null;
  parkingInstructions: string | null;
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {step === 'success' ? 'Booking Confirmed' : 'Schedule Test Drive'}
          </DialogTitle>
          <DialogDescription>
            {step === 'date' && 'Select a date to view available time slots'}
            {step === 'time' && 'Choose a time slot for your test drive'}
            {step === 'confirm' && 'Review and confirm your booking'}
            {step === 'success' && 'Your test drive has been scheduled'}
          </DialogDescription>
        </DialogHeader>

        {/* Listing Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {listingThumbnail && (
            <img 
              src={listingThumbnail} 
              alt={listingTitle}
              className="w-16 h-12 object-cover rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{listingTitle}</p>
            <p className="text-xs text-muted-foreground">{partnerName}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Step 1: Date Selection */}
        {step === 'date' && !isLoading && !error && (
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                disabled={currentMonth <= new Date()}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-medium">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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
                      "aspect-square rounded-lg text-sm font-medium transition-all",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && isAvailable && "hover:bg-primary/10 text-foreground",
                      !isSelected && !isAvailable && "text-muted-foreground/40 cursor-not-allowed",
                      isToday && !isSelected && "ring-1 ring-primary",
                      isAvailable && !isSelected && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted border border-border" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 'time' && !isLoading && selectedDate && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('date')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to calendar
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">{formatDate(selectedDate)}</span>
            </div>

            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No available slots for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                    disabled={!slot.isAvailable}
                    className={cn(
                      "py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
                      selectedSlot?.id === slot.id && "bg-primary text-primary-foreground",
                      selectedSlot?.id !== slot.id && slot.isAvailable && "bg-muted/50 hover:bg-primary/10 text-foreground",
                      !slot.isAvailable && "bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through"
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <Button
                onClick={() => setStep('confirm')}
                className="w-full"
              >
                Continue
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && selectedDate && selectedSlot && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('time')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Change time
            </button>

            {/* Booking Summary */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span>
                <span className="text-muted-foreground">({selectedSlot.duration} min)</span>
              </div>
              {partnerAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <span>{partnerAddress}</span>
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Number of attendees
                </label>
                <select
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any questions about the car?"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Special requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Need financing info, test drive route preference..."
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                />
              </div>
            </div>

            {/* Preparation Instructions */}
            {settings?.preparationInstructions && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> {settings.preparationInstructions}
                </p>
              </div>
            )}

            {!isAuthenticated ? (
              <Button onClick={onLoginRequired} className="w-full">
                Sign in to Book
              </Button>
            ) : (
              <Button
                onClick={handleBooking}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && bookingResult && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground">Test Drive Scheduled!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmation code: <span className="font-mono font-medium">{bookingResult.confirmationToken}</span>
              </p>
            </div>

            <div className="space-y-2 p-4 bg-muted/30 rounded-lg text-left">
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-primary" />
                <span>{listingTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>{selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{partnerName}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              You'll receive a confirmation email shortly. The dealer will confirm your booking.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => router.push('/user-dashboard/bookings')} 
                className="flex-1"
              >
                View Bookings
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
