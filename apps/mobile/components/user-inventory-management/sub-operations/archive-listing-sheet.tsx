/**
 * ArchiveListingSheet — Archive / Unarchive a listing
 *
 * Bi-directional: if listing is active → archive, if archived → unarchive.
 * Calls sellCarUserApi.toggleArchive().
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Archive, ArchiveRestore } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText, Supporting } from '@/components/ui';
import { toggleArchiveListing, type UpdateListingResponse } from '@/lib/sell-car-user-api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ArchiveListingSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: UpdateListingResponse) => void;
  listingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  /** true = listing is currently archived (sheet will offer Unarchive) */
  isArchived: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ArchiveListingSheet({
  visible,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  listingThumbnail,
  isArchived,
}: ArchiveListingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapPoints = useMemo(() => ['40%'], []);

  const actionLabel = isArchived ? 'Unarchive' : 'Archive';
  const Icon = isArchived ? ArchiveRestore : Archive;
  const description = isArchived
    ? 'This listing will be restored and made visible to buyers again.'
    : 'This listing will be hidden from public search. You can unarchive it later.';

  useEffect(() => {
    if (visible) {
      setError(null);
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
      const result = await toggleArchiveListing(listingId, !isArchived);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      bottomSheetRef.current?.dismiss();
    } catch (err: any) {
      setError(err.message ?? `Failed to ${actionLabel.toLowerCase()} listing`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [listingId, isArchived, onSuccess, actionLabel]);

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
          <Heading size="medium">{actionLabel} Listing</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            disabled={loading}
            style={[
              styles.closeButton,
              { backgroundColor: colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.textSecondary} />
          </HapticPressable>
        </View>

        {/* Listing preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconLg} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Body size="medium" numberOfLines={1}>{listingTitle}</Body>
            <Supporting size="small" tone="secondary">{description}</Supporting>
          </View>
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
              {
                backgroundColor: 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <ButtonText size="medium" tone="secondary">Cancel</ButtonText>
          </HapticPressable>

          <HapticPressable
            onPress={handleConfirm}
            disabled={loading}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: isArchived ? colors.primary : colors.warning,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon size={Sizes.iconSm} color="#FFF" />
                <ButtonText size="medium" style={{ color: '#FFF' }}>
                  {actionLabel}
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
