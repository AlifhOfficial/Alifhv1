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
import { View, StyleSheet, Pressable, Image } from 'react-native';
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
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText, Supporting } from '@/components/ui';
import type { ModerationStatus, LifecycleStatus } from '@/lib/sell-car-user-api';
import { formatListingStatus, getStatusColor } from '../utilities/listing-helpers';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EditStatusAction =
  | 'edit'
  | 'view_stats'
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
    visible: () => true,
  },
  {
    key: 'view_stats',
    label: 'View Stats',
    icon: BarChart3,
    color: (c) => c.text,
    visible: () => true,
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
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Manage Listing</Heading>
          <Pressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.fill : colors.fillSecondary },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Listing preview with status badge */}
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
              <Pressable
                key={action.key}
                onPress={() => handleAction(action.key)}
                style={({ pressed }) => [
                  styles.actionRow,
                  {
                    backgroundColor: pressed ? colors.fill : 'transparent',
                    borderBottomWidth: index < visibleActions.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.actionIcon, { backgroundColor: isDestructive ? colors.errorMuted : colors.fillSecondary }]}>
                  <IconComponent size={20} color={iconColor} />
                </View>
                <Body
                  size="medium"
                  style={{ color: isDestructive ? colors.error : colors.text, flex: 1 }}
                >
                  {action.label}
                </Body>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
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
    marginHorizontal: 16,
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
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
