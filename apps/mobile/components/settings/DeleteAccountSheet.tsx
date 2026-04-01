/**
 * Delete Account Sheet
 * Destructive confirmation sheet aligned with mobile sheet patterns
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, InputTypography, Radius, Sizes, Spacing, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface DeleteAccountSheetProps {
  visible: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountSheet({
  visible,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAccountSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [deleteText, setDeleteText] = useState('');


  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      setDeleteText('');
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

  const handleClose = useCallback(() => {
    setDeleteText('');
    onClose();
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        handleClose();
      }
    },
    [handleClose]
  );

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <SheetFloatingCloseHandle {...props} onPress={handleClose} disabled={isDeleting} />
    ),
    [handleClose, isDeleting]
  );

  const handleConfirm = useCallback(() => {
    if (deleteText !== 'DELETE' || isDeleting) return;
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onConfirm();
  }, [deleteText, isDeleting, onConfirm]);

  const canConfirm = deleteText === 'DELETE' && !isDeleting;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SheetSnapPoints.roomy}
      enableDynamicSizing={false}
      enablePanDownToClose={!isDeleting}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleComponent={renderHandle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Account</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.errorMuted }]}>
            <Trash2 size={Sizes.iconMd} color={colors.error} />
          </View>
          <View style={styles.heroCopy}>
            <Text variant="subheadEmphasized">Delete Account</Text>
            <Text variant="subhead" tone="secondary">
              This starts a permanent account deletion request.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>What Happens</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.infoRow}>
              <View style={[styles.bullet, { backgroundColor: colors.error }]} />
              <Text variant="subhead" style={styles.infoText}>
                Your account is deactivated immediately.
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.bullet, { backgroundColor: colors.error }]} />
              <Text variant="subhead" style={styles.infoText}>
                Your data is retained for 6 months for UAE compliance and dispute handling.
              </Text>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.bullet, { backgroundColor: colors.error }]} />
              <Text variant="subhead" style={styles.infoText}>
                This action cannot be undone once the deletion request is submitted.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Confirmation</Text>
          <Text variant="subhead" tone="secondary" style={styles.sectionDescription}>
            Type DELETE to confirm you want to remove this account.
          </Text>
          <TextInput
            value={deleteText}
            onChangeText={setDeleteText}
            placeholder="DELETE"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              InputTypography,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.label,
              },
            ]}
            autoCapitalize="characters"
            editable={!isDeleting}
          />
        </View>

        <View style={styles.actions}>
          <HapticPressable
            onPress={handleClose}
            disabled={isDeleting}
            style={[styles.secondaryButton, { backgroundColor: colors.fill2 }]}
          >
            <Text variant="subhead" style={{ color: colors.label }}>Cancel</Text>
          </HapticPressable>
          <HapticPressable
            onPress={handleConfirm}
            disabled={!canConfirm}
            style={[
              styles.primaryButton,
              {
                backgroundColor: canConfirm ? colors.error : colors.errorMuted,
              },
            ]}
          >
            {isDeleting ? (
              <Loader2 size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={2} />
            ) : (
              <Text variant="subheadEmphasized" style={{ color: canConfirm ? colors.primaryForeground : colors.error }}>
                Delete Account
              </Text>
            )}
          </HapticPressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionDescription: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    width: Spacing.xs + 2,
    height: Spacing.xs + 2,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  input: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1.2,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
