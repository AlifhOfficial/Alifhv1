/**
 * ExtendListingSheet — Extend a listing's expiry
 *
 * Users can extend by 7 or 14 days (only within last 2 days before expiry).
 * Calls sellCarUserApi.extend().
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CalendarPlus } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText, Supporting, Data } from '@/components/ui';
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

  const snapPoints = useMemo(() => ['50%'], []);

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

  const expiryDisplay = expiresAt ? formatExpiryCountdown(expiresAt) : null;

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
          <Heading size="medium">Extend Listing</Heading>
          <Pressable
            onPress={onClose}
            hitSlop={Spacing.md}
            disabled={loading}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.fill : colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Body size="medium" numberOfLines={1}>{listingTitle}</Body>
            {expiryDisplay && (
              <Supporting size="small" tone={expiryDisplay.isUrgent ? 'error' : 'secondary'}>
                {expiryDisplay.text}
              </Supporting>
            )}
          </View>
        </View>

        {/* Duration selector */}
        <View style={styles.durationRow}>
          {([7, 14] as const).map((days) => {
            const selected = selectedDays === days;
            return (
              <Pressable
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
                <Data size="large" style={selected ? { color: colors.primary } : undefined}>
                  {days}
                </Data>
                <Supporting size="small" tone={selected ? 'primary' : 'secondary'}>
                  days
                </Supporting>
              </Pressable>
            );
          })}
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}>
            <Body size="small" tone="error">{error}</Body>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            disabled={loading}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                backgroundColor: pressed ? colors.fill : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <ButtonText size="medium" tone="secondary">Cancel</ButtonText>
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: pressed ? colors.primary + 'DD' : colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <CalendarPlus size={18} color="#FFF" />
                <ButtonText size="medium" style={{ color: '#FFF' }}>
                  Extend {selectedDays} Days
                </ButtonText>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
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
    width: 32,
    height: 32,
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
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 4,
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
    gap: 2,
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
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
});
