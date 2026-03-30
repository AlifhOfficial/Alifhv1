/**
 * ExtendListingSheet — Extend a listing's expiry
 *
 * Users can extend by 7 or 14 days (only within last 2 days before expiry).
 * Calls sellCarUserApi.extend().
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CalendarPlus } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { extendListing, type ExtendListingResponse } from '@/lib/sell-car-user-api';
import { formatExpiryCountdown } from '../utilities/listing-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExtendListingSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: ExtendListingResponse) => void;
  listingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  /** Current expiry date — used for countdown display */
  expiresAt?: string | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ExtendListingSheet({
  visible,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  listingThumbnail,
  expiresAt,
}: ExtendListingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedDays, setSelectedDays] = useState<7 | 14>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapPoints = useMemo(() => SheetSnapPoints.singleMd, []);

  useEffect(() => {
    if (visible) {
      setError(null);
      setSelectedDays(7);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await extendListing(listingId, selectedDays);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      bottomSheetRef.current?.dismiss();
    } catch (err: any) {
      setError(err.message ?? 'Failed to extend listing');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [listingId, selectedDays, onSuccess]);

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

  const expiryDisplay = expiresAt ? formatExpiryCountdown(expiresAt) : null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
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
          <Text variant="caption1Emphasized" tone="muted" uppercase>Listing</Text>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(listingThumbnail)! }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconLg} color={colors.labelQuaternary} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Text variant="body" numberOfLines={1}>{listingTitle}</Text>
            {expiryDisplay && (
              <Text variant="subhead" tone={expiryDisplay.isUrgent ? 'error' : 'secondary'}>
                {expiryDisplay.text}
              </Text>
            )}
          </View>
        </View>

        {/* Duration selector */}
        <View style={styles.durationRow}>
          {([7, 14] as const).map((days) => {
            const selected = selectedDays === days;
            return (
              <HapticPressable
                key={days}
                onPress={() => {
                  setSelectedDays(days);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={loading}
                style={[
                  styles.durationOption,
                  {
                    backgroundColor: selected ? colors.primaryMuted : colors.surfaceSecondary,
                    borderColor: selected ? colors.primary : colors.border,
                    borderWidth: selected ? 1.5 : 1,
                  },
                ]}
              >
                <Text variant="title3Emphasized" style={selected ? { color: colors.primary } : undefined}>
                  {days}
                </Text>
                <Text variant="subhead" tone={selected ? 'primary' : 'secondary'}>
                  days
                </Text>
              </HapticPressable>
            );
          })}
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
              {
                backgroundColor: 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <Text variant="body" tone="secondary">Cancel</Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleConfirm}
            disabled={loading}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <CalendarPlus size={Sizes.iconSm} color={colors.primaryForeground} />
                <Text variant="body" style={{ color: colors.primaryForeground }}>
                  Extend {selectedDays} Days
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
    paddingHorizontal: Spacing.xs,
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
    width: Sizes.avatarLg + Spacing.sm,
    height: Sizes.avatarLg + Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
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
