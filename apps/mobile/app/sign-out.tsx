import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LogOut } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

export default function SignOutScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await signOut();
      router.replace('/(tabs)/(browse)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Sign Out
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.errorMuted }]}>
          <LogOut size={Sizes.iconSm} color={colors.error} />
        </View>
        <View style={styles.copyWrap}>
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
            Are you sure you want to sign out?
          </Text>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted }}>
            You will need to sign in again to access profile, saved cars, and chats.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <HapticPressable
          onPress={handleCancel}
          disabled={isLoading}
          style={[styles.secondaryBtn, { backgroundColor: colors.fill2 }]}
        >
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Cancel
          </Text>
        </HapticPressable>

        <HapticPressable
          onPress={handleConfirm}
          disabled={isLoading}
          style={[styles.primaryBtn, { backgroundColor: colors.error, opacity: isLoading ? 0.7 : 1 }]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
              Sign Out
            </Text>
          )}
        </HapticPressable>
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: 'center',
  },
  card: {
    borderRadius: Radius.xl,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingVertical: SheetChrome.rowPaddingVertical,
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingVertical: SheetChrome.rowPaddingVertical,
  },
});
