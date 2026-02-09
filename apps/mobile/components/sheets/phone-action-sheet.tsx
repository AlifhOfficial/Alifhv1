/**
 * PhoneActionSheet - Bottom Sheet for phone actions
 * Simple modal with Call, WhatsApp, Copy options
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Phone, Copy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
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

  const snapPoints = useMemo(() => ['32%'], []);

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
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      stackBehavior="push"
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.content}>
        {/* Header with close */}
        <View style={styles.header}>
          <Text style={[styles.phoneNumber, { color: colors.text }]}>{phoneNumber}</Text>
          <Pressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.surfacePressed : colors.surface }
            ]}
          >
            <Ionicons name="close" size={18} color={colors.icon} />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfacePressed : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Phone size={22} color="#FFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Call</Text>
          </Pressable>

          <Pressable
            onPress={handleWhatsApp}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfacePressed : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>WhatsApp</Text>
          </Pressable>

          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.surfacePressed : 'transparent' },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
              <Copy size={22} color={colors.text} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Copy</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
  },
  background: {
    borderRadius: 24,
  },
  handleIndicator: {
    width: 36,
    height: 4,
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
  phoneNumber: {
    ...Typography.headingMedium,
  },
  closeButton: {
    width: 32,
    height: 32,
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    minWidth: 80,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...Typography.buttonSmall,
    textAlign: 'center',
  },
});
