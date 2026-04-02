import { Alert, Linking, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Phone, Copy } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function PhoneActionsScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const safePhone = phoneNumber ?? '';

  const handleCall = async () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const canOpen = await Linking.canOpenURL(`tel:${safePhone}`);
      if (canOpen) {
        await Linking.openURL(`tel:${safePhone}`);
      } else {
        Alert.alert('Phone Number', safePhone);
      }
    } catch {
      Alert.alert('Phone Number', safePhone);
    }
    router.back();
  };

  const handleWhatsApp = async () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const cleanPhone = safePhone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('971') ? cleanPhone : `971${cleanPhone}`;
    try {
      await Linking.openURL(`https://wa.me/${phone}`);
    } catch {
      Alert.alert('Error', 'Unable to open WhatsApp');
    }
    router.back();
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(safePhone);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title={safePhone || 'Phone Number'} />

      <View style={styles.actions}>
        <HapticPressable onPress={handleCall} style={styles.actionBtn}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}> 
            <Phone size={22} color={colors.primaryForeground} />
          </View>
          <Text variant="subhead" style={styles.actionLabel}>Call</Text>
        </HapticPressable>

        <HapticPressable onPress={handleWhatsApp} style={styles.actionBtn}>
          <View style={[styles.iconCircle, { backgroundColor: colors.whatsapp }]}> 
            <Ionicons name="logo-whatsapp" size={24} color={colors.primaryForeground} />
          </View>
          <Text variant="subhead" style={styles.actionLabel}>WhatsApp</Text>
        </HapticPressable>

        <HapticPressable onPress={handleCopy} style={styles.actionBtn}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}> 
            <Copy size={22} color={colors.label} />
          </View>
          <Text variant="subhead" style={styles.actionLabel}>Copy</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeAction: {
    minWidth: 48,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2xl'],
    marginTop: Spacing.xl,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    minWidth: 52,
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
