/**
 * Superlike Confirmation Sheet
 * Shows quota info and confirms before using a superlike
 */

import { Text, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, Layout, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => SheetSnapPoints.compact, []);

  // Show/hide based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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

  const handleCancel = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <SheetFloatingCloseHandle {...props} onPress={handleCancel} />
    ),
    [handleCancel]
  );

  const handleConfirm = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      onChange={handleSheetChanges}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Zap size={Sizes.iconLg} color={colors.warning} fill={colors.warning} />
          </View>
          <View style={styles.headerText}>
            <Text variant="subheadEmphasized">Superlike this listing?</Text>
            {listingTitle && (
              <Text variant="subhead" numberOfLines={1} style={{ marginTop: Spacing.xs }} tone="secondary">
                {listingTitle}
              </Text>
            )}
          </View>
          <View style={[styles.quotaBadge, { backgroundColor: remaining === 0 ? colors.warning + '20' : colors.backgroundSecondary }]}>
            <Text variant="subhead" style={{ color: remaining === 0 ? colors.warning : colors.labelSecondary }}>
              {remaining}/{total}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionBox, { backgroundColor: colors.backgroundSecondary }]}>
          <Text variant="subhead" style={{ textAlign: 'center' }} tone="secondary">
            Superlikes notify sellers that you&apos;re highly interested. Use them wisely — you have limited superlikes each month.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={handleCancel}
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
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.warning },
            ]}
          >
            <Zap size={Sizes.iconSm} color={colors.primaryForeground} />
            <Text variant="body" style={{ color: colors.primaryForeground }}>Superlike</Text>
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => SheetSnapPoints.peek, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <SheetFloatingCloseHandle {...props} onPress={handleClosePress} />
    ),
    [handleClosePress]
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
      onChange={handleSheetChanges}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.exhaustedHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Zap size={Sizes.iconXl} color={colors.warning} />
          </View>
          <Text variant="subheadEmphasized" style={{ marginTop: Spacing.md }}>
            No Superlikes Left
          </Text>
          <Text variant="subhead" style={{ textAlign: 'center', marginTop: Spacing.xs }} tone="secondary">
            You&apos;ve used all your superlikes for this month.
            {resetDate && ` They’ll reset on ${resetDate}.`}
          </Text>
        </View>

        {/* Action */}
        <HapticPressable
          onPress={handleClosePress}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, marginTop: Spacing.lg, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text variant="body" style={{ color: colors.primaryForeground }}>Got it</Text>
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
  exhaustedHeader: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
});
