import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function VerifyIdentityScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  function handleOpenWebsite() {
    Linking.openURL('https://revvup.ae');
  }

  return (
    <View style={styles.container}>
      <SheetHeader title="Identity Verification" />

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}> 
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}> 
          <Ionicons name="shield-checkmark-outline" size={Sizes.iconMd} color={colors.primary} />
        </View>
        <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
          Complete KYC on the web
        </Text>
        <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted, textAlign: 'center' }}>
          KYC verification is only available on our website for now. Visit revvup.ae, sign in, and complete verification from your profile settings. It takes less than 2 minutes.
        </Text>
      </View>

      <View style={styles.actions}>
        <HapticPressable
          onPress={() => router.back()}
          style={[styles.secondaryButton, { backgroundColor: colors.fill2 }]}
        >
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Close
          </Text>
        </HapticPressable>
        <HapticPressable
          onPress={handleOpenWebsite}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
            Go Now
          </Text>
          <Ionicons name="arrow-forward" size={Sizes.iconSm} color={colors.primaryForeground} />
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
    alignItems: 'center',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.full,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: SheetChrome.rowPaddingVertical,
    borderRadius: Radius.full,
  },
});