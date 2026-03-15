/**
 * EditStatusSheet — Quick-action menu for listing management
 *
 * Entry-point sheet that presents all available actions for a listing
 * based on its current status. Dispatches to the other sub-operation sheets.
 *
 * Actions shown conditionally:
 *   • Edit           → navigate to edit screen (always)
 *   • Mark as Sold   → if active/approved
 *   • Extend         → if active & near expiry
 *   • Archive        → if active/approved
 *   • Unarchive      → if archived
 *   • Delete         → always
 *   • Delete Forever → if already soft-deleted
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  Pencil,
  CheckCircle2,
  CalendarPlus,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  BarChart3,
  HelpCircle,
} from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { Heading, Body, ButtonText, Supporting } from '@/components/ui';
import type { ModerationStatus, LifecycleStatus } from '@/lib/sell-car-user-api';
import { formatListingStatus, getStatusColor } from '../utilities/listing-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EditStatusAction =
  | 'edit'
  | 'view_stats'
  | 'view_review_reason'
  | 'mark_sold'
  | 'extend'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'hard_delete';

export interface EditStatusSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Fired when user taps an action row */
  onAction: (action: EditStatusAction) => void;
  // Listing info
  listingId: string;
  listingTitle: string;
  listingThumbnail?: string | null;
  moderationStatus: ModerationStatus;
  lifecycleStatus: LifecycleStatus;
  isArchived: boolean;
  expiresAt?: string | null;
}

// ─── Action configuration ────────────────────────────────────────────────────

interface ActionRow {
  key: EditStatusAction;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: (colors: typeof Colors.dark) => string;
  /** Return true to show this action */
  visible: (props: {
    moderationStatus: ModerationStatus;
    lifecycleStatus: LifecycleStatus;
    isArchived: boolean;
    expiresAt?: string | null;
  }) => boolean;
}

const ACTION_ROWS: ActionRow[] = [
  {
    key: 'edit',
    label: 'Edit Listing',
    icon: Pencil,
    color: (c) => c.text,
    // Can't edit sold, expired, deleted, or rejected listings
    visible: ({ lifecycleStatus, moderationStatus }) =>
      lifecycleStatus !== 'expired' &&
      lifecycleStatus !== 'sold' &&
      lifecycleStatus !== 'deleted' &&
      moderationStatus !== 'rejected',
  },
  {
    key: 'view_stats',
    label: 'View Insights',
    icon: BarChart3,
    color: (c) => c.text,
    // Only show stats for listings that were/are live (approved)
    visible: ({ moderationStatus }) => moderationStatus === 'approved',
  },
  {
    key: 'view_review_reason',
    label: 'Why In Review?',
    icon: HelpCircle,
    color: (c) => c.warning,
    // Only show for listings currently pending review
    visible: ({ moderationStatus }) =>
      moderationStatus === 'submitted' || moderationStatus === 'pending_review',
  },
  {
    key: 'mark_sold',
    label: 'Mark as Sold',
    icon: CheckCircle2,
    color: (c) => c.success,
    visible: ({ moderationStatus, lifecycleStatus, isArchived }) =>
      moderationStatus === 'approved' &&
      lifecycleStatus === 'active' &&
      !isArchived,
  },
  {
    key: 'extend',
    label: 'Extend Listing',
    icon: CalendarPlus,
    color: (c) => c.primary,
    visible: ({ moderationStatus, lifecycleStatus, isArchived, expiresAt }) => {
      if (moderationStatus !== 'approved' || lifecycleStatus !== 'active' || isArchived) return false;
      if (!expiresAt) return false;
      const daysLeft = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 2;
    },
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: Archive,
    color: (c) => c.warning,
    visible: ({ lifecycleStatus, isArchived }) =>
      lifecycleStatus === 'active' && !isArchived,
  },
  {
    key: 'unarchive',
    label: 'Unarchive',
    icon: ArchiveRestore,
    color: (c) => c.primary,
    visible: ({ isArchived }) => isArchived,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: (c) => c.error,
    visible: ({ lifecycleStatus }) => lifecycleStatus !== 'deleted',
  },
  {
    key: 'hard_delete',
    label: 'Delete Forever',
    icon: AlertTriangle,
    color: (c) => c.error,
    visible: ({ lifecycleStatus }) => lifecycleStatus === 'deleted',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function EditStatusSheet({
  visible,
  onClose,
  onAction,
  listingId,
  listingTitle,
  listingThumbnail,
  moderationStatus,
  lifecycleStatus,
  isArchived,
  expiresAt,
}: EditStatusSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Filter actions based on current listing state
  const visibleActions = useMemo(
    () =>
      ACTION_ROWS.filter((a) =>
        a.visible({ moderationStatus, lifecycleStatus, isArchived, expiresAt }),
      ),
    [moderationStatus, lifecycleStatus, isArchived, expiresAt],
  );

  // Dynamic snap point based on number of actions
  const snapPoints = useMemo(() => {
    const baseHeight = 120; // header + preview card
    const rowHeight = 56;
    const totalHeight = baseHeight + visibleActions.length * rowHeight + insets.bottom + 40;
    const percentage = Math.min(Math.round((totalHeight / 812) * 100), 85);
    return [`${percentage}%`];
  }, [visibleActions.length, insets.bottom]);

  useEffect(() => {
    if (visible) {
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

  const handleAction = useCallback(
    (action: EditStatusAction) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      bottomSheetRef.current?.dismiss();
      // Small delay so dismiss animation completes before the next sheet opens
      setTimeout(() => onAction(action), 300);
    },
    [onAction],
  );

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

  const statusLabel = formatListingStatus(moderationStatus, lifecycleStatus);
  const statusColor = getStatusColor(moderationStatus, lifecycleStatus, colors);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Manage Listing</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.error },
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
          </HapticPressable>
        </View>

        {/* Listing preview with status badge */}
        <View style={[styles.previewCard, { backgroundColor: colors.surfaceSecondary }]}>
          {listingThumbnail ? (
            <Image source={{ uri: getAppThumbUrl(listingThumbnail) || listingThumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.fill }]}>
              <Ionicons name="image-outline" size={Sizes.iconLg} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.previewInfo}>
            <Body size="medium" numberOfLines={1}>{listingTitle}</Body>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Supporting size="small" style={{ color: statusColor }}>
                {statusLabel}
              </Supporting>
            </View>
          </View>
        </View>

        {/* Action rows */}
        <View style={styles.actionList}>
          {visibleActions.map((action, index) => {
            const IconComponent = action.icon;
            const iconColor = action.color(colors);
            const isDestructive = action.key === 'delete' || action.key === 'hard_delete';

            return (
              <HapticPressable
                key={action.key}
                onPress={() => handleAction(action.key)}
                style={[
                  styles.actionRow,
                  {
                    backgroundColor: 'transparent',
                    borderBottomWidth: index < visibleActions.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.actionIcon, { backgroundColor: isDestructive ? colors.errorMuted : colors.fillSecondary }]}>
                  <IconComponent size={Sizes.iconMd} color={iconColor} />
                </View>
                <Body
                  size="medium"
                  style={{ color: isDestructive ? colors.error : colors.text, flex: 1 }}
                >
                  {action.label}
                </Body>
                <Ionicons name="chevron-forward" size={Sizes.iconSm} color={colors.textMuted} />
              </HapticPressable>
            );
          })}
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
    marginBottom: Spacing.lg,
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
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Radius.sm,
  },
  actionList: {
    gap: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  actionIcon: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
