/**
 * KYC Verification Sheet
 * 
 * Simple sheet directing users to complete KYC on web.
 * Native KYC verification is not available yet.
 */

import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HapticPressable } from '@/components/ui';

import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting } from '@/components/ui';

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

  const snapPoints = useMemo(() => ['60%', '93%'], []);

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
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Heading size="medium">Identity Verification</Heading>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[styles.iconButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
          </HapticPressable>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Body size="medium">
            KYC verification is only available on our website for now.
          </Body>
          <Supporting size="medium" tone="muted">
            Visit revvup.ae, sign in, and complete verification from your profile settings. Takes less than 2 minutes.
          </Supporting>
        </View>

        {/* Link */}
        <HapticPressable
          onPress={openWebsite}
          style={styles.linkRow}
        >
          <Body size="medium" style={{ color: colors.primary }}>Go now</Body>
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
  iconButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
