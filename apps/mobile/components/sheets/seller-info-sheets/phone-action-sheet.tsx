/**
 * PhoneActionSheet - Bottom Sheet for phone actions
 * Simple modal with Call, WhatsApp, Copy options
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Linking, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Phone, Copy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface PhoneActionSheetProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export function PhoneActionSheet({ visible, onClose, phoneNumber }: PhoneActionSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['40%', '60%'], []);

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
    >
      <BottomSheetView style={styles.content}>
        {/* Header with close */}
        <View style={styles.header}>
          <Text variant="title3Emphasized">{phoneNumber}</Text>
          <HapticPressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={[
              styles.closeButton,
              { backgroundColor: colors.error }
            ]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
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
    borderRadius: Radius['3xl'],
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
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
