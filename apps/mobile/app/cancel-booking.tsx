import { Text, HapticPressable } from '@/components/ui';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { X as XIcon } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useBookings } from '@/hooks/use-booking-query';
import { getAppThumbUrl } from '@/lib/config';
import {
  cancelBooking,
  type CancellationReason,
  type CancelBookingResult,
  type UserBooking,
} from '@/lib/booking-api';
import { CANCELLATION_REASONS } from '@/components/bookings/utilities/booking-helpers';

type RouteParams = {
  bookingId?: string | string[];
};

function getBookingIdFromParams(rawBookingId?: string | string[]): string | null {
  const value = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;
  return value || null;
}

export default function CancelBookingScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<RouteParams>();
  const bookingId = getBookingIdFromParams(params.bookingId);
  const { bookings, isLoading } = useBookings({ filter: 'all', enabled: !!bookingId });
  const booking = bookingId ? bookings.find((item) => item.id === bookingId) ?? null : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [notes, setNotes] = useState('');

  const formattedDate = useMemo(() => {
    if (!booking?.scheduledDate) return '';

    try {
      const d = new Date(booking.scheduledDate);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return booking.scheduledDate;
    }
  }, [booking?.scheduledDate]);

  useEffect(() => {
    setError(null);
    setSelectedReason(null);
    setNotes('');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!booking) return;

    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result: CancelBookingResult = await cancelBooking(booking.id, {
        reason: selectedReason ?? undefined,
        notes: notes.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      router.back();
      return result;
    } catch (err: any) {
      setError(err.message ?? 'Failed to cancel booking');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [booking, selectedReason, notes, queryClient]);

  if (isLoading && bookingId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
        <View collapsable={false} style={[styles.headerBar, { borderBottomColor: colors.sheetBorder }]}> 
          <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
            <Text variant="subhead" tone="muted">Close</Text>
          </HapticPressable>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Cancel Booking</Text>
          <View style={styles.headerAction} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.labelTertiary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: colors.sheet }]}> 
        <View collapsable={false} style={[styles.headerBar, { borderBottomColor: colors.sheetBorder }]}> 
          <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
            <Text variant="subhead" tone="muted">Close</Text>
          </HapticPressable>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Cancel Booking</Text>
          <View style={styles.headerAction} />
        </View>

        <View style={styles.fallbackBody}>
          <Text variant="subhead" tone="muted">Booking details are unavailable.</Text>
          <HapticPressable onPress={() => router.back()} style={[styles.fallbackButton, { backgroundColor: colors.fill2 }]}> 
            <Text variant="subhead">Go back</Text>
          </HapticPressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View collapsable={false} style={[styles.headerBar, { borderBottomColor: colors.sheetBorder }]}> 
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Cancel Booking</Text>
        <View style={styles.headerAction} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.md }]}
      > 
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}> 
          {booking.listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(booking.listingThumbnail)! }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}> 
              <Ionicons name="car-outline" size={Sizes.iconLg} color={colors.labelQuaternary} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text variant="subheadEmphasized" numberOfLines={1}>{booking.listingTitle}</Text>
            <Text variant="caption1Emphasized" tone="muted" uppercase>{booking.partnerName}</Text>
            <Text variant="subhead" tone="secondary">{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subhead" tone="secondary" style={{ marginBottom: Spacing.sm }}>Why are you cancelling?</Text>
          <ScrollView style={styles.reasonList} showsVerticalScrollIndicator={false}>
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.value;
              return (
                <HapticPressable
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value as CancellationReason)}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.radioOuter, { borderColor: isSelected ? colors.primary : colors.labelQuaternary }]}> 
                    {isSelected ? <View style={[styles.radioInner, { backgroundColor: colors.primary }]} /> : null}
                  </View>
                  <Text variant="subhead">{reason.label}</Text>
                </HapticPressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="subhead" tone="secondary" style={{ marginBottom: Spacing.xs }}>Additional notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={2}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.label,
                borderColor: colors.border,
              },
            ]}
          />
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}> 
            <Text variant="subhead" tone="error">{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <HapticPressable
            onPress={() => router.back()}
            disabled={loading}
            style={[styles.secondaryBtn, { backgroundColor: 'transparent', borderColor: colors.border }]}
          >
            <Text variant="body" tone="secondary">Go Back</Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleConfirm}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: colors.error, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <XIcon size={Sizes.iconSm} color={colors.primaryForeground} />
                <Text variant="body" style={{ color: colors.primaryForeground }}>Cancel Booking</Text>
              </>
            )}
          </HapticPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  headerAction: {
    minWidth: 56,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    flex: 1,
  },
  fallbackBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  fallbackButton: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  thumbnail: {
    width: Spacing['5xl'] + Spacing.sm,
    height: Spacing['5xl'] + Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.md,
  },
  reasonList: {
    maxHeight: Spacing['5xl'] * 3 + Spacing['4xl'],
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  radioOuter: {
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Spacing.sm + 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Spacing.xs + 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: Spacing['5xl'] + Spacing.md,
    textAlignVertical: 'top',
  },
  errorBanner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});