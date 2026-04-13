import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar1,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Minus,
  Plus,
  Users,
} from 'lucide-react-native';

import { HapticPressable, SheetHeader, Text, TextInput } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, SheetChrome, Sizes, Spacing, Stroke } from '@/constants/theme';
import { createBooking, getAvailableDates, getTimeSlots, type AvailableDate, type TimeSlot } from '@/lib/booking-api';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

const BOOKING_TIME_ZONE = 'Asia/Dubai';
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type BookingStep = 'date' | 'time' | 'confirm' | 'success';

function toUtcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-AE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: BOOKING_TIME_ZONE,
  });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });
}

export default function BookingScreen() {
  const { listingId, listingTitle } = useLocalSearchParams<{ listingId?: string; listingTitle?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<BookingStep>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const safeTitle = Array.isArray(listingTitle) ? listingTitle[0] : listingTitle;
  const today = useMemo(() => new Date(), []);

  const loadDates = useCallback(async () => {
    if (!listingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailableDates(listingId);
      if (!data.available) {
        setError(data.reason || 'Bookings are not available for this listing');
        return;
      }
      setAvailableDates(data.dates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const loadSlots = useCallback(async (date: Date) => {
    if (!listingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = toUtcDateKey(date);
      const data = await getTimeSlots(listingId, dateStr);
      setTimeSlots(data.slots || []);
      setStep('time');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const handleSubmit = useCallback(async () => {
    if (!listingId || !selectedDate || !selectedSlot) return;
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
      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setConfirmationToken(result.confirmationToken);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, selectedDate, selectedSlot, notes, attendees]);

  const calendarDays = useMemo((): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getUTCDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getUTCDate(); i++) days.push(new Date(Date.UTC(year, month, i)));
    return days;
  }, [currentMonth]);

  const isDateAvailable = useCallback(
    (date: Date) => availableDates.find((d) => d.date === toUtcDateKey(date))?.hasSlots ?? false,
    [availableDates],
  );

  const isDatePast = useCallback((date: Date) => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    return date.getTime() < todayUtc.getTime();
  }, []);

  const isPrevMonthDisabled =
    currentMonth.getFullYear() < today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() <= today.getMonth());

  if (availableDates.length === 0 && !isLoading && !error) {
    void loadDates();
  }

  const monthLabel = `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const stepHeader = (() => {
    if (step === 'date') {
      return (
        <SheetHeader
          title={monthLabel}
          left={
            <HapticPressable
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              disabled={isPrevMonthDisabled}
              style={[styles.circleBtn, { backgroundColor: colors.surfaceSecondary, opacity: isPrevMonthDisabled ? 0.25 : 1 }]}
            >
              <ChevronLeft size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
            </HapticPressable>
          }
          right={
            <HapticPressable
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              style={[styles.circleBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ChevronRight size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
            </HapticPressable>
          }
        />
      );
    }
    if (step === 'time') {
      return (
        <SheetHeader
          title={selectedDate ? formatDateLong(selectedDate) : 'Pick a Time'}
          left={
            <HapticPressable onPress={() => setStep('date')} style={[styles.circleBtn, { backgroundColor: colors.surfaceSecondary }]}>
              <ChevronLeft size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
            </HapticPressable>
          }
        />
      );
    }
    if (step === 'confirm') {
      return (
        <SheetHeader
          title="Confirm Booking"
          left={
            <HapticPressable onPress={() => setStep('time')} style={[styles.circleBtn, { backgroundColor: colors.surfaceSecondary }]}>
              <ChevronLeft size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
            </HapticPressable>
          }
        />
      );
    }
    return <SheetHeader title="Booking Requested" />;
  })();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={[styles.content, { paddingBottom: getSheetBottomPadding(insets.bottom) }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {stepHeader}

      {safeTitle && step !== 'success' ? (
        <Text variant="subhead" tone="secondary">{safeTitle}</Text>
      ) : null}

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}>
          <Text variant="subhead" tone="error">{error}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}

      {/* ── Date Step ── */}
      {step === 'date' && !isLoading ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.stack}>
          {/* Day-of-week headers */}
          <View style={styles.calendarRow}>
            {DAY_LABELS.map((label, i) => (
              <View key={i} style={styles.calendarCell}>
                <Text variant="caption2" tone="muted" style={styles.dayLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              if (!date) return <View key={`e-${index}`} style={styles.calendarCell} />;
              const isPast = isDatePast(date);
              const isAvailable = !isPast && isDateAvailable(date);
              const isSelected = selectedDate ? toUtcDateKey(selectedDate) === toUtcDateKey(date) : false;
              const isToday = toUtcDateKey(date) === toUtcDateKey(today);
              return (
                <HapticPressable
                  key={toUtcDateKey(date)}
                  style={styles.calendarCell}
                  onPress={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected
                        ? { backgroundColor: colors.primary }
                        : isToday && !isPast
                        ? { backgroundColor: colors.primaryMuted }
                        : undefined,
                    ]}
                  >
                    <Text
                      variant="subhead"
                      style={{
                        textAlign: 'center',
                        color: isSelected
                          ? colors.primaryForeground
                          : isToday && !isPast
                          ? colors.primary
                          : !isAvailable
                          ? colors.labelQuaternary
                          : colors.label,
                      }}
                    >
                      {date.getUTCDate()}
                    </Text>
                  </View>
                </HapticPressable>
              );
            })}
          </View>

          <HapticPressable
            onPress={() => selectedDate && loadSlots(selectedDate)}
            style={[styles.primaryBtn, { backgroundColor: selectedDate ? colors.primary : colors.fill2 }]}
            disabled={!selectedDate}
          >
            <Text variant="body" style={{ color: selectedDate ? colors.primaryForeground : colors.labelQuaternary }}>
              Continue
            </Text>
          </HapticPressable>
        </Animated.View>
      ) : null}

      {/* ── Time Step ── */}
      {step === 'time' && !isLoading ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.stack}>
          {timeSlots.filter((s) => s.isAvailable).length === 0 ? (
            <Text variant="subhead" tone="muted" style={styles.emptySlots}>
              No available times for this date
            </Text>
          ) : (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const selected = selectedSlot?.id === slot.id;
                return (
                  <HapticPressable
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      selected
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : slot.isAvailable
                        ? { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                        : { backgroundColor: colors.fill3, borderColor: 'transparent', opacity: 0.4 },
                    ]}
                    onPress={() => slot.isAvailable && setSelectedSlot(slot)}
                    disabled={!slot.isAvailable}
                  >
                    <Text
                      variant="subheadEmphasized"
                      style={{
                        color: selected ? colors.primaryForeground : slot.isAvailable ? colors.label : colors.labelQuaternary,
                        textAlign: 'center',
                        textDecorationLine: !slot.isAvailable ? 'line-through' : 'none',
                      }}
                    >
                      {formatTime(slot.startTime)}
                    </Text>
                  </HapticPressable>
                );
              })}
            </View>
          )}

          <HapticPressable
            onPress={() => setStep('confirm')}
            style={[styles.primaryBtn, { backgroundColor: selectedSlot ? colors.primary : colors.fill2 }]}
            disabled={!selectedSlot}
          >
            <Text variant="body" style={{ color: selectedSlot ? colors.primaryForeground : colors.labelQuaternary }}>
              Continue
            </Text>
          </HapticPressable>
        </Animated.View>
      ) : null}

      {/* ── Confirm Step ── */}
      {step === 'confirm' && !isLoading ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.stack}>

          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.row}>
              <Calendar1 size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
              <Text variant="subhead">{selectedDate ? formatDateLong(selectedDate) : '—'}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
              <Text variant="subhead">
                {selectedSlot ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` : '—'}
              </Text>
              {selectedSlot ? (
                <Text variant="subhead" tone="muted">· {selectedSlot.duration} min</Text>
              ) : null}
            </View>
          </View>

          {/* Attendees stepper */}
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <Users size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
            <Text variant="subhead" style={styles.inputRowLabel}>Attendees</Text>
            <HapticPressable
              onPress={() => setAttendees(Math.max(1, attendees - 1))}
              style={[styles.stepper, { backgroundColor: colors.fill2 }]}
            >
              <Minus size={Sizes.iconXs} color={colors.label} strokeWidth={Stroke.icon} />
            </HapticPressable>
            <Text variant="subheadEmphasized" style={styles.attendeeCount}>{attendees}</Text>
            <HapticPressable
              onPress={() => setAttendees(Math.min(6, attendees + 1))}
              style={[styles.stepper, { backgroundColor: colors.fill2 }]}
            >
              <Plus size={Sizes.iconXs} color={colors.label} strokeWidth={Stroke.icon} />
            </HapticPressable>
          </View>

          {/* Notes */}
          <View style={[styles.notesWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.row}>
              <FileText size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={Stroke.icon} />
              <Text variant="subhead" tone="secondary">Notes (optional)</Text>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.notesInput, { color: colors.label }]}
              placeholder="Questions or requests..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={2}
            />
          </View>

          <HapticPressable onPress={handleSubmit} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <Text variant="body" style={{ color: colors.primaryForeground }}>Book now</Text>
          </HapticPressable>
        </Animated.View>
      ) : null}

      {/* ── Success Step ── */}
      {step === 'success' ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.successStack}>
          <CheckCircle2 size={Sizes.iconXl} color={colors.success} strokeWidth={Stroke.icon} />
          <Text variant="title3Emphasized">Booking Requested</Text>
          {safeTitle ? <Text variant="subhead" tone="secondary">{safeTitle}</Text> : null}
          {selectedDate && selectedSlot ? (
            <Text variant="subhead" tone="muted" style={styles.centered}>
              {formatDateLong(selectedDate)} · {formatTime(selectedSlot.startTime)}
            </Text>
          ) : null}
          <Text variant="subhead" tone="secondary" style={styles.centered}>
            The seller will confirm your test drive shortly.
          </Text>
          {confirmationToken ? (
            <Text
              variant="subheadEmphasized"
              selectable
              style={{ letterSpacing: 1.5, color: colors.label, textAlign: 'center' }}
            >
              {confirmationToken}
            </Text>
          ) : null}
          <HapticPressable
            onPress={() => router.push('/bookings')}
            style={[styles.primaryBtn, styles.fullWidth, { backgroundColor: colors.primary }]}
          >
            <Text variant="body" style={{ color: colors.primaryForeground }}>View Bookings</Text>
          </HapticPressable>
          <HapticPressable onPress={() => router.back()} style={styles.ghostBtn}>
            <Text variant="subhead" tone="secondary">Done</Text>
          </HapticPressable>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  errorBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  centered: {
    textAlign: 'center',
  },
  stack: {
    gap: Spacing.md,
  },
  successStack: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['2xl'],
  },
  // Calendar
  circleBtn: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    textAlign: 'center',
  },
  // Time slots
  emptySlots: {
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlot: {
    width: '30.5%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  // Confirm step
  summaryCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderCurve: 'continuous',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderCurve: 'continuous',
  },
  inputRowLabel: {
    flex: 1,
  },
  stepper: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeCount: {
    minWidth: 24,
    textAlign: 'center',
  },
  notesWrap: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderCurve: 'continuous',
  },
  notesInput: {
    padding: 0,
    minHeight: 44,
  },
  // Shared
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghostBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
});
