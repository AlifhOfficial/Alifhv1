/**
 * CancelBookingSheet — Cancel booking confirmation bottom sheet
 *
 * Shows listing preview, reason picker, optional notes, confirmation buttons.
 * Follows the same pattern as DeleteListingSheet / MarkSoldSheet.
 *
 * @module components/bookings/cancel-booking-sheet
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { X as XIcon } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import {
  cancelBooking,
  type CancellationReason,
  type CancelBookingResult,
} from '@/lib/booking-api';
import { CANCELLATION_REASONS } from './utilities/booking-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CancelBookingSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: CancelBookingResult) => void;
  bookingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  partnerName: string;
  scheduledDate: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CancelBookingSheet({
  visible,
  onClose,
  onSuccess,
  bookingId,
  listingTitle,
  listingThumbnail,
  partnerName,
  scheduledDate,
}: CancelBookingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [notes, setNotes] = useState('');


  // Format the scheduled date for display
  const formattedDate = useMemo(() => {
    try {
      const d = new Date(scheduledDate);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return scheduledDate;
    }
  }, [scheduledDate]);

  useEffect(() => {
    if (visible) {
      setError(null);
      setSelectedReason(null);
      setNotes('');
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result = await cancelBooking(bookingId, {
        reason: selectedReason ?? undefined,
        notes: notes.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      bottomSheetRef.current?.dismiss();
    } catch (err: any) {
      setError(err.message ?? 'Failed to cancel booking');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [bookingId, selectedReason, notes, onSuccess]);

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

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <SheetFloatingCloseHandle {...props} onPress={onClose} disabled={loading} />
    ),
    [loading, onClose]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SheetSnapPoints.singleLg}
      enableDynamicSizing={false}
      enablePanDownToClose={!loading}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleComponent={renderHandle}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="subheadEmphasized">Cancel Booking</Text>
        </View>

        {/* Booking preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(listingThumbnail)! }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="car-outline" size={Sizes.iconLg} color={colors.labelQuaternary} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text variant="subheadEmphasized" numberOfLines={1}>{listingTitle}</Text>
            <Text variant="caption1Emphasized" tone="muted" uppercase>{partnerName}</Text>
            <Text variant="subhead" tone="secondary">{formattedDate}</Text>
          </View>
        </View>

        {/* Reason picker */}
        <View style={styles.section}>
          <Text variant="subhead" tone="secondary" style={{ marginBottom: Spacing.sm }}>
            Why are you cancelling?
          </Text>
          <ScrollView
            style={styles.reasonList}
            showsVerticalScrollIndicator={false}
          >
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
                  <View
                    style={[
                      styles.radioOuter,
                      {
                        borderColor: isSelected ? colors.primary : colors.labelQuaternary,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text variant="subhead">{reason.label}</Text>
                </HapticPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Notes input */}
        <View style={styles.section}>
          <Text variant="subhead" tone="secondary" style={{ marginBottom: Spacing.xs }}>
            Additional notes (optional)
          </Text>
          <BottomSheetTextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details…"
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

        {/* Error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}>
            <Text variant="subhead" tone="error">{error}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={onClose}
            disabled={loading}
            style={[
              styles.secondaryBtn,
              { backgroundColor: 'transparent', borderColor: colors.border },
            ]}
          >
            <Text variant="body" tone="secondary">Go Back</Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleConfirm}
            disabled={loading}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.error,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <XIcon size={Sizes.iconSm} color={colors.primaryForeground} />
                <Text variant="body" style={{ color: colors.primaryForeground }}>
                  Cancel Booking
                </Text>
              </>
            )}
          </HapticPressable>
        </View>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Layout.screenPadding,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
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
