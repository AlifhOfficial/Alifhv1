/**
 * PhoneActionSheet - Bottom Sheet for phone actions
 * Simple modal with Call, WhatsApp, Copy options
 */

import { Text, HapticPressable, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Phone, Copy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface PhoneActionSheetProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export function PhoneActionSheet({ visible, onClose, phoneNumber }: PhoneActionSheetProps) {
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

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleCall = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const canOpen = await Linking.canOpenURL(`tel:${phoneNumber}`);
      if (canOpen) {
        await Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert('Phone Number', phoneNumber);
      }
    } catch {
      Alert.alert('Phone Number', phoneNumber);
    }
    onClose();
  }, [phoneNumber, onClose]);

  const handleWhatsApp = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('971') ? cleanPhone : `971${cleanPhone}`;
    try {
      await Linking.openURL(`https://wa.me/${phone}`);
    } catch {
      Alert.alert('Error', 'Unable to open WhatsApp');
    }
    onClose();
  }, [phoneNumber, onClose]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(phoneNumber);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }, [phoneNumber, onClose]);

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

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => <SheetFloatingCloseHandle {...props} onPress={onClose} />,
    [onClose]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SheetSnapPoints.compact}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.sheet }]}
      handleComponent={renderHandle}
      stackBehavior="push"
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headline">{phoneNumber}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Phone size={Sizes.iconMd} color={colors.primaryForeground} />
            </View>
            <Text variant="subhead" style={styles.actionLabel}>Call</Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleWhatsApp}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.whatsapp }]}>
              <Ionicons name="logo-whatsapp" size={Sizes.iconLg} color={colors.primaryForeground} />
            </View>
            <Text variant="subhead" style={styles.actionLabel}>WhatsApp</Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
              <Copy size={Sizes.iconMd} color={colors.label} />
            </View>
            <Text variant="subhead" style={styles.actionLabel}>Copy</Text>
          </HapticPressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  background: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderCurve: 'continuous',
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2xl'],
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    minWidth: Spacing["5xl"],
  },
  iconCircle: {
    width: Spacing['5xl'] + Spacing.sm,
    height: Spacing['5xl'] + Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    textAlign: 'center',
  },
});
