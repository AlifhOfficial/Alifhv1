/**
 * DeleteListingSheet — Soft-delete / Hard-delete confirmation
 *
 * Two modes controlled by `hardDelete` prop:
 *   • false (default) → soft-delete (recoverable, listing hidden)
 *   • true            → permanent delete (R2 images wiped, irreversible)
 *
 * Calls sellCarUserApi.delete() or sellCarUserApi.hardDelete().
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Trash2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import {
  deleteListing,
  hardDeleteListing,
  type DeleteListingResponse,
} from '@/lib/sell-car-user-api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DeleteListingSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: DeleteListingResponse) => void;
  listingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  /**
   * false → soft-delete (default, listing can be recovered)
   * true  → permanent delete (listing + images wiped from R2)
   */
  hardDelete?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DeleteListingSheet({
  visible,
  onClose,
  onSuccess,
  listingId,
  listingTitle,
  listingThumbnail,
  hardDelete = false,
}: DeleteListingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapPoints = useMemo(() => SheetSnapPoints.singleSm, []);

  const description = hardDelete
    ? 'This action is irreversible. The listing and all its images will be permanently removed.'
    : 'This listing will be removed from public search. You can contact support to recover it.';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const result = hardDelete
        ? await hardDeleteListing(listingId)
        : await deleteListing(listingId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.(result);
      bottomSheetRef.current?.dismiss();
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete listing');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [listingId, hardDelete, onSuccess]);

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

        {/* Warning banner for hard delete */}
        {hardDelete && (
          <View style={[styles.warningBanner, { backgroundColor: colors.errorMuted }]}>
            <Ionicons name="warning" size={Sizes.iconSm} color={colors.error} />
            <Text variant="subhead" tone="error" style={{ flex: 1 }}>
              This cannot be undone. All photos will be permanently deleted.
            </Text>
          </View>
        )}

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
            <Text variant="subhead" tone="secondary">{description}</Text>
          </View>
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
                backgroundColor: colors.error,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Trash2 size={Sizes.iconSm} color={colors.primaryForeground} />
                <Text variant="body" style={{ color: colors.primaryForeground }}>
                  {hardDelete ? 'Delete Forever' : 'Delete'}
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
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
