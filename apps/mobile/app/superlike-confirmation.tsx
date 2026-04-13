import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useListingFavorite } from '@/context/favorites-context';
import { Colors, Layout, Radius, SheetChrome, Sizes, Spacing } from '@/constants/theme';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

export default function SuperlikeConfirmationScreen() {
  const { listingId, listingTitle } = useLocalSearchParams<{ listingId: string; listingTitle?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const favoriteState = useListingFavorite(listingId ?? '');

  const remaining = favoriteState.quota?.remaining ?? 0;
  const total = (favoriteState.quota?.maxSuperlikesPerMonth ?? 0) + (favoriteState.quota?.premiumSuperlikesBonus ?? 0);

  const safeTitle = useMemo(() => {
    if (!listingTitle) return undefined;
    return Array.isArray(listingTitle) ? listingTitle[0] : listingTitle;
  }, [listingTitle]);

  const handleConfirm = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    favoriteState.toggleSuperlike().catch(() => undefined);
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.sheet, paddingBottom: getSheetBottomPadding(insets.bottom) },
      ]}
    > 
      <SheetHeader title="Superlike" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warningMuted }]}> 
            <Zap size={Sizes.iconLg} color={colors.warning} fill={colors.warning} />
          </View>
          <View style={styles.headerText}>
            <Text variant="subheadEmphasized">Superlike this listing?</Text>
            {safeTitle ? (
              <Text variant="subhead" numberOfLines={1} style={{ marginTop: Spacing.xs }} tone="secondary">
                {safeTitle}
              </Text>
            ) : null}
          </View>
          <View style={[styles.quotaBadge, { backgroundColor: remaining === 0 ? colors.warningMuted : colors.backgroundSecondary }]}> 
            <Text variant="subhead" style={{ color: remaining === 0 ? colors.warning : colors.labelSecondary }}>
              {remaining}/{total}
            </Text>
          </View>
        </View>

        <View style={[styles.descriptionBox, { backgroundColor: colors.backgroundSecondary }]}> 
          <Text variant="subhead" style={{ textAlign: 'center' }} tone="secondary">
            Superlikes notify sellers that you are highly interested. Use them wisely; you have limited superlikes each month.
          </Text>
        </View>

        <View style={styles.actions}>
          <HapticPressable
            onPress={() => router.back()}
            style={[styles.secondaryBtn, { backgroundColor: 'transparent', borderColor: colors.border }]}
          >
            <Text variant="body" tone="secondary">Cancel</Text>
          </HapticPressable>
          <HapticPressable onPress={handleConfirm} style={[styles.primaryBtn, { backgroundColor: colors.warning }]}> 
            <Zap size={Sizes.iconSm} color={colors.primaryForeground} />
            <Text variant="body" style={{ color: colors.primaryForeground }}>Superlike</Text>
          </HapticPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  content: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  iconContainer: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotaBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  descriptionBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
});
