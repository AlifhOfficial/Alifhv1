/**
 * Delete Account Sheet
 * Confirmation sheet for account deletion
 */

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui';
import { Trash2, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Layout, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, Data, ButtonText } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

interface DeleteAccountSheetProps {
  visible: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

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

  // Snap points
  const snapPoints = useMemo(() => ['70%', '93%'], []);

  // Show/hide based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
      setDeleteText('');
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

  const handleConfirm = useCallback(() => {
    if (deleteText === 'DELETE') {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      onConfirm();
    }
  }, [deleteText, onConfirm]);

  const canConfirm = deleteText === 'DELETE' && !isDeleting;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={!isDeleting}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.actionButtonSm }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.errorMuted }]}>
            <Trash2 size={Sizes.iconLg} color={colors.error} />
          </View>
          <Heading size="small" tone="error">Delete Account?</Heading>
        </View>

        {/* Description */}
        <Body size="medium" tone="secondary" style={styles.description}>
          Your account will be deactivated immediately and permanently deleted after 6 months. We retain your data during this period to comply with UAE regulations and resolve any potential disputes. This action cannot be undone.
        </Body>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Supporting size="small" tone="muted" style={styles.inputLabel}>
            Type "DELETE" to confirm
          </Supporting>
          <TextInput
            value={deleteText}
            onChangeText={setDeleteText}
            placeholder="DELETE"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              Typography.body,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            autoCapitalize="characters"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              { 
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Data size="medium" style={{ color: colors.text }}>Cancel</Data>
          </HapticPressable>
          <HapticPressable
            onPress={handleConfirm}
            disabled={!canConfirm}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              {
                backgroundColor: colors.error,
                opacity: !canConfirm ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isDeleting ? (
              <Loader2 size={Sizes.iconSm} color={colors.primaryFg} strokeWidth={2} />
            ) : (
              <Data size="medium" style={{ color: colors.primaryFg }}>Delete</Data>
            )}
          </HapticPressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Layout.screenPadding,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  iconContainer: {
    width: Sizes.avatarLg + Spacing.sm,
    height: Sizes.avatarLg + Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
});
