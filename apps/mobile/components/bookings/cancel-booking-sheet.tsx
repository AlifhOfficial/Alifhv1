/**
 * CancelBookingSheet — Cancel booking confirmation bottom sheet
 *
 * Shows listing preview, reason picker, optional notes, confirmation buttons.
 * Follows the same pattern as DeleteListingSheet / MarkSoldSheet.
 *
 * @module components/bookings/cancel-booking-sheet
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { X as XIcon } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getThumbUrl } from '@/lib/config';
import { Heading, Body, ButtonText, Supporting } from '@/components/ui';
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

  const snapPoints = useMemo(() => ['72%'], []);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!loading}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Cancel Booking</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Layout.hitSlop}
            disabled={loading}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
          </HapticPressable>
        </View>

        {/* Booking preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getThumbUrl(listingThumbnail) || listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="car-outline" size={Sizes.iconLg} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Body size="medium" numberOfLines={1}>{listingTitle}</Body>
            <Supporting size="small" tone="secondary">{partnerName}</Supporting>
            <Supporting size="small" tone="secondary">{formattedDate}</Supporting>
          </View>
        </View>

        {/* Reason picker */}
        <View style={styles.section}>
          <Body size="medium" style={{ marginBottom: Spacing.sm }}>
            Why are you cancelling?
          </Body>
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
                        borderColor: isSelected ? colors.primary : colors.textMuted,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Body size="small">{reason.label}</Body>
                </HapticPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Notes input */}
        <View style={styles.section}>
          <Body size="small" tone="secondary" style={{ marginBottom: Spacing.xs }}>
            Additional notes (optional)
          </Body>
          <BottomSheetTextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={2}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}>
            <Body size="small" tone="error">{error}</Body>
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
            <ButtonText size="medium" tone="secondary">Go Back</ButtonText>
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
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <XIcon size={Sizes.iconSm} color="#FFF" />
                <ButtonText size="medium" style={{ color: '#FFF' }}>
                  Cancel Booking
                </ButtonText>
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
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: Sizes.avatarSm,
    height: Sizes.avatarSm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 2,
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
