/**
 * Superlike Confirmation Sheet
 * Shows quota info and confirms before using a superlike
 */

import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Data, Supporting } from '@/components/ui/text';
import { HapticPressable } from '@/components/ui/haptic-pressable';
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
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const snapPoints = useMemo(() => ['40%', '55%'], []);

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Zap size={Sizes.iconLg} color={colors.warning} fill={colors.warning} />
          </View>
          <View style={styles.headerText}>
            <Heading size="small">Superlike this listing?</Heading>
            {listingTitle && (
              <Supporting size="small" numberOfLines={1} style={{ marginTop: 2 }}>
                {listingTitle}
              </Supporting>
            )}
          </View>
          <View style={[styles.quotaBadge, { backgroundColor: remaining === 0 ? colors.warning + '20' : colors.bg2 }]}>
            <Data size="small" style={{ color: remaining === 0 ? colors.warning : colors.text2 }}>
              {remaining}/{total}
            </Data>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionBox, { backgroundColor: colors.bg2 }]}>
          <Supporting size="small" style={{ textAlign: 'center' }}>
            Superlikes notify sellers that you're highly interested. Use them wisely — you have limited superlikes each month.
          </Supporting>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Data size="medium" style={{ color: colors.text }}>Cancel</Data>
          </HapticPressable>
          <HapticPressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Zap size={Spacing.lg} color="#fff" />
            <Data size="medium" style={{ color: '#fff' }}>Confirm</Data>
          </HapticPressable>
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
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points
  const snapPoints = useMemo(() => ['35%', '50%'], []);

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.exhaustedHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Zap size={Sizes.iconXl} color={colors.warning} />
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
        <HapticPressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.button,
            styles.confirmButton,
            { backgroundColor: colors.primary, marginTop: Spacing.lg, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Data size="medium" style={{ color: '#fff' }}>Got it</Data>
        </HapticPressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
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
    width: Layout.hitTarget,
    height: Layout.hitTarget,
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
    height: Sizes.actionButtonLg,
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
