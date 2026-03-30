/**
 * KYC Verification Sheet
 * 
 * Simple sheet directing users to complete KYC on web.
 * Native KYC verification is not available yet.
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Sizes, Spacing, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// ============================================================================
// TYPES
// ============================================================================

interface KycVerificationSheetProps {
  visible: boolean;
  onClose: () => void;
  onVerified?: () => void;
  onRefreshProfile?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function KycVerificationSheet({
  visible,
  onClose,
}: KycVerificationSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => SheetSnapPoints.standard, []);

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

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => <SheetFloatingCloseHandle {...props} onPress={onClose} />,
    [onClose]
  );

  const openWebsite = useCallback(() => {
    Linking.openURL('https://revvup.ae');
  }, []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title3Emphasized">Identity Verification</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text variant="body">
            KYC verification is only available on our website for now.
          </Text>
          <Text variant="body" tone="muted">
            Visit revvup.ae, sign in, and complete verification from your profile settings. Takes less than 2 minutes.
          </Text>
        </View>

        {/* Link */}
        <HapticPressable
          onPress={openWebsite}
          style={styles.linkRow}
        >
          <Text variant="body" style={{ color: colors.primary }}>Go now</Text>
          <Ionicons name="arrow-forward" size={Sizes.iconSm} color={colors.primary} />
        </HapticPressable>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </View>
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
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  body: {
    gap: Spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
});
