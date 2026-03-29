/**
 * BookingSheet - Native Bottom Sheet for test drive bookings
 *
 * Multi-step flow: Date → Time → Confirm → Success
 * Uses @gorhom/bottom-sheet, follows existing sheet patterns (FinancingSheet, PhoneActionSheet).
 * Connects to /api/bookings/slots and /api/bookings via booking-api.ts.
 * Includes confetti + chime on success, matching CarCardM interaction patterns.
 */

import { Text, HapticPressable, ConfettiBurst, useConfettiBurst } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar1, Clock, Users, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography, Fonts, Colors, Spacing, Radius, Sizes, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  getAvailableDates,
  getTimeSlots,
  createBooking,
  type TimeSlot,
  type AvailableDate,
  type BookingSettings,
} from '@/lib/booking-api';
import { consumeDataReady, scheduleRenderPerf } from '@/lib/config';

// ============================================================================
// TYPES
// ============================================================================

interface BookingSheetProps {
  visible: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

type BookingStep = 'date' | 'time' | 'confirm' | 'success';

// ============================================================================
// CONSTANTS
// ============================================================================

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const BOOKING_TIME_ZONE = 'Asia/Dubai';

const BOOKING_CONFETTI_COLORS = [
  Colors.light.primary, // primary blue
  Colors.light.success, // success green
  Colors.light.info, // blue-500
  Colors.light.success, // emerald-500
  Colors.light.info, // cyan-500
  Colors.light.amna, // violet-500
];

// ============================================================================
// HELPERS
// ============================================================================

function toUtcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: BOOKING_TIME_ZONE,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BookingSheet = memo(function BookingSheet({
  visible,
  onClose,
  listingId,
  listingTitle,
  isAuthenticated,
  onLoginRequired,
}: BookingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Confetti
  const successConfetti = useConfettiBurst();

  // Flow state
  const [step, setStep] = useState<BookingStep>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Settings
  const [settings, setSettings] = useState<BookingSettings | null>(null);

  // Form
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState(1);

  // Result
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    confirmationToken: string;
  } | null>(null);

  const snapPoints = useMemo(() => ['50%', '93%'], []);

  // ── Sheet lifecycle ──────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      setStep('date');
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes('');
      setAttendees(1);
      setBookingResult(null);
      setError(null);
      setCurrentMonth(new Date());
      bottomSheetRef.current?.present();
      fetchAvailableDates();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, listingId]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  // ── Data fetching ────────────────────────────────────────────────────

  const fetchAvailableDates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const interactionStartAt = performance.now();
      const data = await getAvailableDates(listingId, { interactionStartAt });
      if (!data.available) {
        setError(data.reason || 'Bookings are not available for this listing');
        return;
      }
      setAvailableDates(data.dates || []);
      setSettings(data.settings || null);
      const readyAt = consumeDataReady(`booking:dates:${listingId}`) ?? performance.now();
      scheduleRenderPerf('booking.dates-sheet', readyAt, { listingId, dates: data.dates?.length ?? 0 });
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
      const interactionStartAt = performance.now();
      const data = await getTimeSlots(listingId, dateStr, { interactionStartAt });
      setTimeSlots(data.slots || []);
      setStep('time');
      const readyAt = consumeDataReady(`booking:slots:${listingId}:${dateStr}`) ?? performance.now();
      scheduleRenderPerf('booking.time-slots-sheet', readyAt, {
        listingId,
        date: dateStr,
        slots: data.slots?.length ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  // ── Booking submission ───────────────────────────────────────────────

  const handleBooking = useCallback(async () => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    if (!selectedDate || !selectedSlot) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createBooking({
        listingId,
        scheduledDate: toUtcDateKey(selectedDate),
        scheduledStartTime: selectedSlot.startTime,
        scheduledEndTime: selectedSlot.endTime,
        notes: notes || undefined,
        numberOfAttendees: attendees,
      });

      // Fire confetti + haptic on success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      successConfetti.fire({ colors: BOOKING_CONFETTI_COLORS, count: 16 });

      setBookingResult({
        bookingId: result.bookingId,
        confirmationToken: result.confirmationToken,
      });
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);

      if (
        message.toLowerCase().includes('no longer available') ||
        message.toLowerCase().includes('already booked')
      ) {
        setSelectedSlot(null);
        await fetchTimeSlots(selectedDate);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, onLoginRequired, selectedDate, selectedSlot, listingId, notes, attendees, fetchTimeSlots, successConfetti]);

  // ── Calendar helpers ─────────────────────────────────────────────────

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    const startingDay = firstDay.getUTCDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(Date.UTC(year, month, i)));
    return days;
  }, [currentMonth]);

  const isDateAvailable = useCallback(
    (date: Date) => {
      const dateStr = toUtcDateKey(date);
      return availableDates.some(d => d.date === dateStr && d.hasSlots);
    },
    [availableDates],
  );

  const isDatePast = useCallback((date: Date) => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    return date.getTime() < todayUtc.getTime();
  }, []);

  const canGoPreviousMonth = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() > now.getFullYear() ||
      (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth())
    );
  }, [currentMonth]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleDateSelect = useCallback(
    (date: Date) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(date);
      setSelectedSlot(null);
      fetchTimeSlots(date);
    },
    [fetchTimeSlots],
  );

  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSlot(slot);
  }, []);

  const handleContinueToConfirm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('confirm');
  }, []);

  const handleBackToDate = useCallback(() => {
    setStep('date');
    setSelectedSlot(null);
    setError(null);
  }, []);

  const handleBackToTime = useCallback(() => {
    setStep('time');
    setError(null);
  }, []);

  const incrementAttendees = useCallback(() => {
    setAttendees(prev => Math.min(prev + 1, 5));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const decrementAttendees = useCallback(() => {
    setAttendees(prev => Math.max(prev - 1, 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const availableSlots = useMemo(() => timeSlots.filter(s => s.isAvailable), [timeSlots]);

  // Step indicator text
  const stepLabel = step === 'date' ? 'Select Date' : step === 'time' ? 'Select Time' : step === 'confirm' ? 'Review' : '';

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.content}>
        {/* Confetti overlay */}
        <View style={styles.confettiAnchor}>
          <ConfettiBurst ref={successConfetti.ref} />
        </View>

        {/* ── SUCCESS ─────────────────────────────────────────────── */}
        {step === 'success' && bookingResult ? (
          <View style={styles.successContainer}>
            <CheckCircle2 size={Spacing['5xl']} color={colors.success} strokeWidth={1.5} />

            <Text variant="heading" style={styles.centerText}>
              You're all set!
            </Text>
            <Text variant="body" tone="secondary" style={styles.centerText}>
              Your test drive request has been sent
            </Text>

            {/* Booking summary */}
            <View style={[styles.successCard, { backgroundColor: colors.fill2 }]}>
              <Text variant="bodySm" style={{ color: colors.label }}>{listingTitle}</Text>
              {selectedDate && selectedSlot && (
                <View style={styles.successCardRow}>
                  <Calendar1 size={Spacing.md} color={colors.labelSecondary} />
                  <Text variant="body" tone="secondary">
                    {formatDateShort(selectedDate)} at {formatTime(selectedSlot.startTime)}
                  </Text>
                </View>
              )}
              <View style={[styles.tokenContainer, { borderColor: colors.border + '40' }]}>
                <Text variant="bodySm" tone="muted">Confirmation</Text>
                <Text variant="body" style={styles.tokenText}>
                  {bookingResult.confirmationToken}
                </Text>
              </View>
            </View>

            <Text variant="bodySm" tone="muted" style={styles.centerText}>
              Check your Bookings to track your request
            </Text>

            <HapticPressable
              onPress={onClose}
              style={[styles.primaryButton, styles.doneButton, { backgroundColor: colors.label }]}
            >
              <Text variant="body" style={{ color: colors.background }}>
                Done
              </Text>
            </HapticPressable>
          </View>
        ) : (
          <>
            {/* ── HEADER ──────────────────────────────────────────── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {(step === 'time' || step === 'confirm') && (
                  <HapticPressable
                    onPress={step === 'confirm' ? handleBackToTime : handleBackToDate}
                    hitSlop={Spacing.md}
                    style={[styles.backButton, { backgroundColor: colors.fill2 }]}
                  >
                    <ChevronLeft size={Sizes.iconSm} color={colors.label} />
                  </HapticPressable>
                )}
                <View>
                  <Text variant="heading">Schedule Test Drive</Text>
                  <Text variant="bodySm" tone="muted">{listingTitle}</Text>
                </View>
              </View>
              <HapticPressable
                onPress={onClose}
                hitSlop={Spacing.md}
                style={[styles.closeButton, { backgroundColor: colors.fill2 }]}
              >
                <Ionicons name="close" size={Spacing.lg} color={colors.labelSecondary} />
              </HapticPressable>
            </View>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {(['date', 'time', 'confirm'] as const).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        step === s ? colors.label :
                        (['date', 'time', 'confirm'].indexOf(step) > i) ? colors.label :
                        colors.fill2,
                    },
                  ]}
                />
              ))}
            </View>

            {/* ── ERROR ───────────────────────────────────────────── */}
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle" size={Spacing.md + 2} color={colors.error} />
                <Text variant="bodySm" style={{ color: colors.error, flex: 1 }} tone="secondary">
                  {error}
                </Text>
              </View>
            )}

            {/* ── LOADING ─────────────────────────────────────────── */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.labelQuaternary} />
              </View>
            )}

            {/* ── STEP: DATE ──────────────────────────────────────── */}
            {step === 'date' && !isLoading && !error && (
              <View style={styles.stepContainer}>
                {/* Month navigation */}
                <View style={styles.monthNav}>
                  <HapticPressable
                    onPress={goToPreviousMonth}
                    disabled={!canGoPreviousMonth}
                    hitSlop={12}
                    style={[
                      styles.monthNavBtn,
                      { backgroundColor: colors.fill2 },
                      !canGoPreviousMonth && styles.monthNavBtnDisabled,
                    ]}
                  >
                    <ChevronLeft size={Spacing.lg} color={canGoPreviousMonth ? colors.label : colors.labelQuaternary} />
                  </HapticPressable>
                  <Text variant="body">
                    {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </Text>
                  <HapticPressable
                    onPress={goToNextMonth}
                    hitSlop={12}
                    style={[styles.monthNavBtn, { backgroundColor: colors.fill2 }]}
                  >
                    <ChevronRight size={Spacing.lg} color={colors.label} />
                  </HapticPressable>
                </View>

                {/* Day headers */}
                <View style={styles.dayHeaders}>
                  {DAY_NAMES.map((day, i) => (
                    <View key={`${day}-${i}`} style={styles.dayHeaderCell}>
                      <Text variant="bodySm" tone="muted" style={styles.dayHeaderText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.calendarGrid}>
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <View key={`empty-${index}`} style={styles.calendarCell} />;
                    }

                    const past = isDatePast(date);
                    const available = !past && isDateAvailable(date);
                    const isSelected = selectedDate && toUtcDateKey(selectedDate) === toUtcDateKey(date);
                    const isToday = toUtcDateKey(date) === toUtcDateKey(new Date());

                    return (
                      <View key={date.toISOString()} style={styles.calendarCell}>
                        <HapticPressable
                          onPress={() => available && handleDateSelect(date)}
                          disabled={!available}
                          style={[
                            styles.calendarDayInner,
                            isSelected && { backgroundColor: colors.label },
                            isToday && !isSelected && { backgroundColor: colors.fill2 },
                          ]}
                        >
                          <Text
                            variant="bodySm"
                            style={[
                              isSelected && { color: colors.background },
                              !isSelected && available && { color: colors.label },
                              !isSelected && !available && { color: colors.labelQuaternary + '30' },
                              isToday && !isSelected && { color: colors.label },
                            ]}
                          >
                            {date.getUTCDate()}
                          </Text>
                        </HapticPressable>
                        {available && !isSelected && (
                          <View style={[styles.availableDot, { backgroundColor: colors.success }]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── STEP: TIME ──────────────────────────────────────── */}
            {step === 'time' && !isLoading && selectedDate && (
              <View style={styles.stepContainer}>
                {/* Selected date display */}
                <View style={[styles.selectedDateBar, { backgroundColor: colors.fill2 }]}>
                  <Calendar1 size={Sizes.iconXs} color={colors.labelSecondary} />
                  <Text variant="bodySm" style={{ color: colors.label }}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>

                {availableSlots.length === 0 ? (
                  <View style={styles.emptySlots}>
                    <Clock size={Sizes.iconLg} color={colors.labelQuaternary} />
                    <Text variant="body" tone="muted" style={{ marginTop: Spacing.sm }}>
                      No times available for this date
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text variant="caption" tone="muted" style={styles.sectionLabel} uppercase>AVAILABLE TIMES</Text>
                    <View style={styles.slotsGrid}>
                      {timeSlots.map(slot => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <HapticPressable
                            key={slot.id}
                            onPress={() => slot.isAvailable && handleSlotSelect(slot)}
                            disabled={!slot.isAvailable}
                            style={[
                              styles.slotButton,
                              {
                                backgroundColor: isSelected ? colors.label : colors.fill2,
                                borderColor: isSelected ? colors.label : 'transparent',
                              },
                              !slot.isAvailable && styles.slotDisabled,
                            ]}
                          >
                            <Text
                              variant="bodySm"
                              style={[
                                isSelected && { color: colors.background },
                                !isSelected && slot.isAvailable && { color: colors.label },
                                !slot.isAvailable && { color: colors.labelQuaternary },
                              ]}
                            >
                              {formatTime(slot.startTime)}
                            </Text>
                            {slot.isAvailable && (
                              <Text variant="bodySm" style={isSelected ? { color: colors.background + 'AA' } : undefined} tone={isSelected ? undefined : 'muted'}>{slot.duration}m</Text>
                            )}
                          </HapticPressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Continue button */}
                {selectedSlot && (
                  <HapticPressable
                    onPress={handleContinueToConfirm}
                    style={[styles.primaryButton, { backgroundColor: colors.label }]}
                  >
                    <Text variant="body" style={{ color: colors.background }}>
                      Continue
                    </Text>
                  </HapticPressable>
                )}
              </View>
            )}

            {/* ── STEP: CONFIRM ───────────────────────────────────── */}
            {step === 'confirm' && selectedDate && selectedSlot && (
              <View style={styles.stepContainer}>
                {/* Booking summary */}
                <View style={[styles.confirmCard, { backgroundColor: colors.fill2 }]}>
                  <View style={styles.confirmRow}>
                    <View style={[styles.confirmIconBox, { backgroundColor: colors.fill2 }]}>
                      <Calendar1 size={Spacing.lg} color={colors.labelSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySm" tone="muted">Date</Text>
                      <Text variant="bodySm">{formatDate(selectedDate)}</Text>
                    </View>
                  </View>
                  <View style={[styles.confirmDivider, { backgroundColor: colors.border + '30' }]} />
                  <View style={styles.confirmRow}>
                    <View style={[styles.confirmIconBox, { backgroundColor: colors.fill2 }]}>
                      <Clock size={Spacing.lg} color={colors.labelSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySm" tone="muted">Time</Text>
                      <Text variant="bodySm">
                        {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                      </Text>
                    </View>
                    <View style={[styles.durationBadge, { backgroundColor: colors.fill2 }]}>
                      <Text variant="bodySm" style={{ color: colors.labelSecondary }} tone="secondary">{selectedSlot.duration}m</Text>
                    </View>
                  </View>
                </View>

                {/* Attendees */}
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldHeader}>
                    <Users size={Sizes.iconXs} color={colors.labelSecondary} />
                    <Text variant="caption" tone="muted" uppercase>ATTENDEES</Text>
                  </View>
                  <View style={[styles.attendeePicker, { backgroundColor: colors.fill2 }]}>
                    <HapticPressable
                      onPress={decrementAttendees}
                      disabled={attendees <= 1}
                      style={[
                        styles.attendeeBtn,
                        { backgroundColor: colors.surface },
                        attendees <= 1 && styles.attendeeBtnDisabled,
                      ]}
                    >
                      <Ionicons name="remove" size={Spacing.lg} color={attendees <= 1 ? colors.labelQuaternary : colors.label} />
                    </HapticPressable>
                    <Text variant="body" style={{ minWidth: Spacing["2xl"], textAlign: 'center' }}>{attendees}</Text>
                    <HapticPressable
                      onPress={incrementAttendees}
                      disabled={attendees >= 5}
                      style={[
                        styles.attendeeBtn,
                        { backgroundColor: colors.surface },
                        attendees >= 5 && styles.attendeeBtnDisabled,
                      ]}
                    >
                      <Ionicons name="add" size={Spacing.lg} color={attendees >= 5 ? colors.labelQuaternary : colors.label} />
                    </HapticPressable>
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldHeader}>
                    <FileText size={Sizes.iconXs} color={colors.labelSecondary} />
                    <Text variant="caption" tone="muted" uppercase>NOTES</Text>
                    <Text variant="bodySm" tone="muted">(optional)</Text>
                  </View>
                  <BottomSheetTextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any questions or special requests..."
                    placeholderTextColor={colors.labelQuaternary}
                    multiline
                    numberOfLines={2}
                    style={[
                      styles.notesInput,
                      {
                        color: colors.label,
                        backgroundColor: colors.fill2,
                        borderColor: colors.border + '30',
                      },
                    ]}
                  />
                </View>

                {/* Submit */}
                {!isAuthenticated ? (
                  <HapticPressable
                    onPress={onLoginRequired}
                    style={[styles.primaryButton, { backgroundColor: colors.label }]}
                  >
                    <Text variant="body" style={{ color: colors.background }}>
                      Sign in to Book
                    </Text>
                  </HapticPressable>
                ) : (
                  <HapticPressable
                    onPress={handleBooking}
                    disabled={isLoading}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: colors.label },
                      isLoading && styles.buttonDisabled,
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text variant="body" style={{ color: colors.background }}>
                        Confirm Booking
                      </Text>
                    )}
                  </HapticPressable>
                )}
              </View>
            )}

            <View style={{ height: insets.bottom + Spacing.md }} />
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderRadius: Radius['3xl'],
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  confettiAnchor: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    zIndex: ZIndex.modal,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  backButton: {
    width: Spacing['3xl'] - 2,
    height: Spacing['3xl'] - 2,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: Spacing['3xl'] - 2,
    height: Spacing['3xl'] - 2,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stepDot: {
    width: Spacing['2xl'],
    height: Spacing.xs,
    borderRadius: Spacing.xs / 2,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },

  // Step container
  stepContainer: {
    gap: Spacing.lg,
  },

  // ── Calendar ─────────────────────────────────────────────────────────
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthNavBtn: {
    width: Spacing['3xl'] - 2,
    height: Spacing['3xl'] - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  monthNavBtnDisabled: {
    opacity: 0.25,
  },
  dayHeaders: {
    flexDirection: 'row',
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  dayHeaderText: {
    letterSpacing: 0.3,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  calendarDayInner: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Spacing.xs / 2,
    marginTop: 1,
  },

  // ── Time slots ───────────────────────────────────────────────────────
  selectedDateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.xs,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: '30%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slotDisabled: {
    opacity: 0.25,
  },
  emptySlots: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },

  // ── Confirm ──────────────────────────────────────────────────────────
  confirmCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    gap: Spacing.md,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  confirmIconBox: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDivider: {
    height: 1,
    marginHorizontal: Spacing.xs,
  },
  durationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.md,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  attendeePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  attendeeBtn: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  attendeeBtnDisabled: {
    opacity: 0.3,
  },
  notesInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Typography.body,
    minHeight: Sizes.avatarLg + Spacing.sm,
    textAlignVertical: 'top',
  },

  // ── CTA Button ───────────────────────────────────────────────────────
  primaryButton: {
    height: Spacing['5xl'],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  doneButton: {
    width: '100%',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // ── Success ──────────────────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  successCheckIcon: {
    marginBottom: Spacing.sm,
  },
  centerText: {
    textAlign: 'center',
  },
  successCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  successCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tokenContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    width: '100%',
  },
  tokenText: {
    letterSpacing: 3,
  },
});
