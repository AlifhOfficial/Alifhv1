import { HapticPressable, SheetHeader, Text, TextInput } from '@/components/ui';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CircleX } from 'lucide-react-native';
import { Image } from 'expo-image';

import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useBookings } from '@/hooks/use-booking-query';
import { getAppThumbUrl } from '@/lib/config';
import { getSheetBottomPadding } from '@/lib/sheet-layout';
import {
  cancelBooking,
  type CancellationReason,
  type CancelBookingResult,
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.labelTertiary} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: colors.sheet }]}> 
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
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.sheet }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingBottom: getSheetBottomPadding(insets.bottom) }]}
    > 
        <SheetHeader title="Cancel Booking" />

        <View style={[styles.warningCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <View style={[styles.warningIconWrap, { backgroundColor: colors.errorMuted }]}> 
            <CircleX size={Sizes.iconSm} color={colors.error} />
          </View>
          <View style={styles.warningCopy}>
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Cancel this booking?</Text>
            <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
              This will notify the seller and remove the booking from your active schedule.
            </Text>
          </View>
        </View>

        <View style={[styles.previewCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          {booking.listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(booking.listingThumbnail)! }} style={styles.thumbnail} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}> 
              <Ionicons name="car-outline" size={Sizes.iconLg} color={colors.labelQuaternary} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text variant={SheetTypography.rowLabelSelected} numberOfLines={1} style={{ color: colors.sheetLabel }}>
              {booking.listingTitle}
            </Text>
            <Text variant="caption1" tone="muted">{booking.partnerName}</Text>
            <Text variant="subhead" tone="secondary">{formattedDate}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Why are you cancelling?</Text>
          <View style={styles.reasonList}>
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.value;
              return (
                <HapticPressable
                  key={reason.value}
                  onPress={() => setSelectedReason(reason.value as CancellationReason)}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected ? colors.errorMuted : colors.fill2,
                      borderColor: isSelected ? colors.error : colors.sheetBorder,
                    },
                  ]}
                >
                  <View style={[styles.radioOuter, { borderColor: isSelected ? colors.error : colors.labelQuaternary }]}> 
                    {isSelected ? <View style={[styles.radioInner, { backgroundColor: colors.error }]} /> : null}
                  </View>
                  <Text variant="subhead" style={{ color: colors.label }}>{reason.label}</Text>
                </HapticPressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>Additional notes</Text>
          <Text variant="footnote" tone="secondary">Optional</Text>
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
                backgroundColor: colors.fill2,
                color: colors.label,
                borderColor: colors.sheetBorder,
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
            style={[styles.secondaryBtn, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}
          >
            <Text variant="subheadEmphasized" style={{ color: colors.label }}>Go Back</Text>
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
                <CircleX size={Sizes.iconSm} color={colors.primaryForeground} />
                <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>Cancel Booking</Text>
              </>
            )}
          </HapticPressable>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
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
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
    gap: Spacing.md,
  },
  warningCard: {
    borderRadius: Radius.xl,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  warningIconWrap: {
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
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
  sectionCard: {
    gap: Spacing.sm,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  reasonList: {
    gap: Spacing.xs,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderCurve: 'continuous',
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
    borderCurve: 'continuous',
  },
  errorBanner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
  },
});
