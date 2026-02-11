/**
 * Superlike Confirmation Sheet
 * Shows quota info and confirms before using a superlike
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Data, Supporting } from '@/components/ui';
import type { FavoritesStatusData } from '@/lib/saved-api';

// ============================================================================
// TYPES
// ============================================================================

type SuperlikeQuota = FavoritesStatusData['quota'];

interface SuperlikeConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quota: SuperlikeQuota | null;
  listingTitle?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SuperlikeConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  quota,
  listingTitle,
}: SuperlikeConfirmationSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Show/hide based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  // Backdrop
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
    []
  );

  const handleConfirm = useCallback(() => {
    onConfirm();
    bottomSheetRef.current?.dismiss();
  }, [onConfirm]);

  const remaining = quota?.remaining ?? 0;
  const total = (quota?.maxSuperlikesPerMonth ?? 0) + (quota?.premiumSuperlikesBonus ?? 0);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['35%']}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Sparkles size={24} color={colors.warning} fill={colors.warning} />
          </View>
          <View style={styles.headerText}>
            <Heading size="small">Superlike this listing?</Heading>
            {listingTitle && (
              <Supporting size="small" numberOfLines={1} style={{ marginTop: 2 }}>
                {listingTitle}
              </Supporting>
            )}
          </View>
          <View style={[styles.quotaBadge, { backgroundColor: remaining === 0 ? colors.warning + '20' : colors.backgroundSecondary }]}>
            <Data size="small" style={{ color: remaining === 0 ? colors.warning : colors.textSecondary }}>
              {remaining}/{total}
            </Data>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionBox, { backgroundColor: colors.backgroundSecondary }]}>
          <Supporting size="small" style={{ textAlign: 'center' }}>
            Superlikes notify sellers that you're highly interested. Use them wisely — you have limited superlikes each month.
          </Supporting>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          >
            <Data size="medium" style={{ color: colors.text }}>Cancel</Data>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
          >
            <Sparkles size={16} color="#fff" />
            <Data size="medium" style={{ color: '#fff' }}>Confirm</Data>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// QUOTA EXHAUSTED SHEET
// ============================================================================

interface SuperlikeQuotaExhaustedSheetProps {
  visible: boolean;
  onClose: () => void;
  quota: SuperlikeQuota | null;
}

export function SuperlikeQuotaExhaustedSheet({
  visible,
  onClose,
  quota,
}: SuperlikeQuotaExhaustedSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

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
    []
  );

  const resetDate = quota?.periodEndDate 
    ? new Date(quota.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['32%']}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.exhaustedHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Sparkles size={28} color={colors.warning} />
          </View>
          <Heading size="medium" style={{ marginTop: Spacing.md }}>
            No Superlikes Left
          </Heading>
          <Supporting size="small" style={{ textAlign: 'center', marginTop: Spacing.xs }}>
            You've used all your superlikes for this month.
            {resetDate && ` They'll reset on ${resetDate}.`}
          </Supporting>
        </View>

        {/* Action */}
        <Pressable
          onPress={onClose}
          style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary, marginTop: Spacing.lg }]}
        >
          <Data size="medium" style={{ color: '#fff' }}>Got it</Data>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotaBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  descriptionBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  exhaustedHeader: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
});
