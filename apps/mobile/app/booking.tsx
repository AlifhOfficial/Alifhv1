import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Calendar1, CheckCircle2, Clock, Users, FileText } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { createBooking, getAvailableDates, getTimeSlots, type AvailableDate, type TimeSlot } from '@/lib/booking-api';

const BOOKING_TIME_ZONE = 'Asia/Dubai';

type BookingStep = 'date' | 'time' | 'confirm' | 'success';

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

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-AE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: BOOKING_TIME_ZONE,
  });
}

export default function BookingScreen() {
  const { listingId, listingTitle } = useLocalSearchParams<{ listingId?: string; listingTitle?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [step, setStep] = useState<BookingStep>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState(1);

  const safeTitle = Array.isArray(listingTitle) ? listingTitle[0] : listingTitle;

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
      await createBooking({
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
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  }, [listingId, selectedDate, selectedSlot, notes, attendees]);

  const selectableDates = useMemo(() => {
    return availableDates.filter((d) => d.hasSlots).slice(0, 21).map((d) => new Date(`${d.date}T00:00:00.000Z`));
  }, [availableDates]);

  if (availableDates.length === 0 && !isLoading && !error) {
    void loadDates();
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Book Test Drive</Text>
        <View style={styles.headerAction} />
      </View>

      {safeTitle ? <Text variant="subhead" tone="secondary">{safeTitle}</Text> : null}

      {error ? (
        <View style={[styles.card, { borderColor: colors.warning, backgroundColor: colors.warningMuted }]}> 
          <Text variant="subhead" style={{ color: colors.warning }}>{error}</Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : null}

      {step === 'date' && !isLoading ? (
        <View style={styles.stack}>
          <Text variant="subheadEmphasized">Pick a date</Text>
          <View style={styles.grid}>
            {selectableDates.map((date) => {
              const selected = selectedDate && toUtcDateKey(selectedDate) === toUtcDateKey(date);
              return (
                <HapticPressable
                  key={toUtcDateKey(date)}
                  style={[styles.pill, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primaryMuted : colors.surfaceSecondary }]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Calendar1 size={16} color={selected ? colors.primary : colors.labelSecondary} />
                  <Text variant="subhead" style={{ color: selected ? colors.primary : colors.label }}>{formatDateShort(date)}</Text>
                </HapticPressable>
              );
            })}
          </View>
          <HapticPressable
            onPress={() => selectedDate && loadSlots(selectedDate)}
            style={[styles.primaryBtn, { backgroundColor: selectedDate ? colors.primary : colors.fill2 }]}
            disabled={!selectedDate}
          >
            <Text variant="body" style={{ color: selectedDate ? colors.primaryForeground : colors.labelQuaternary }}>Continue</Text>
          </HapticPressable>
        </View>
      ) : null}

      {step === 'time' && !isLoading ? (
        <View style={styles.stack}>
          <Text variant="subheadEmphasized">Pick a time slot</Text>
          <View style={styles.grid}>
            {timeSlots.filter((s) => s.isAvailable).map((slot) => {
              const selected = selectedSlot?.id === slot.id;
              return (
                <HapticPressable
                  key={slot.id}
                  style={[styles.pill, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primaryMuted : colors.surfaceSecondary }]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Clock size={16} color={selected ? colors.primary : colors.labelSecondary} />
                  <Text variant="subhead" style={{ color: selected ? colors.primary : colors.label }}>{formatTime(slot.startTime)}</Text>
                </HapticPressable>
              );
            })}
          </View>
          <HapticPressable
            onPress={() => setStep('confirm')}
            style={[styles.primaryBtn, { backgroundColor: selectedSlot ? colors.primary : colors.fill2 }]}
            disabled={!selectedSlot}
          >
            <Text variant="body" style={{ color: selectedSlot ? colors.primaryForeground : colors.labelQuaternary }}>Continue</Text>
          </HapticPressable>
        </View>
      ) : null}

      {step === 'confirm' && !isLoading ? (
        <View style={styles.stack}>
          <Text variant="subheadEmphasized">Confirm booking</Text>
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}> 
            <View style={styles.row}><Calendar1 size={16} color={colors.labelSecondary} /><Text variant="subhead">{selectedDate ? formatDateShort(selectedDate) : '-'}</Text></View>
            <View style={styles.row}><Clock size={16} color={colors.labelSecondary} /><Text variant="subhead">{selectedSlot ? formatTime(selectedSlot.startTime) : '-'}</Text></View>
          </View>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}> 
            <Users size={16} color={colors.labelSecondary} />
            <TextInput
              value={String(attendees)}
              onChangeText={(v) => setAttendees(Math.min(6, Math.max(1, parseInt(v, 10) || 1)))}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.label }]}
              placeholder="1"
              placeholderTextColor={colors.placeholder}
            />
            <Text variant="subhead" tone="secondary">attendees</Text>
          </View>

          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}> 
            <FileText size={16} color={colors.labelSecondary} />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, { color: colors.label }]}
              placeholder="Optional notes"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <HapticPressable onPress={handleSubmit} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
            <Text variant="body" style={{ color: colors.primaryForeground }}>Book now</Text>
          </HapticPressable>
        </View>
      ) : null}

      {step === 'success' ? (
        <View style={styles.centered}>
          <CheckCircle2 size={28} color={colors.success} />
          <Text variant="subheadEmphasized">Booking requested</Text>
          <Text variant="subhead" tone="secondary" style={{ textAlign: 'center' }}>
            The seller will confirm your test drive shortly.
          </Text>
          <HapticPressable onPress={() => router.back()} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}> 
            <Text variant="body" style={{ color: colors.primaryForeground }}>Done</Text>
          </HapticPressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    minWidth: 48,
  },
  centered: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['2xl'],
  },
  stack: {
    gap: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});
