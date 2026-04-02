import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { markListingSold } from '@/lib/sell-car-user-api';
import { getStringParam, type InventorySheetRouteParams } from '@/components/user-inventory-management/sub-operations/route-params';

import React from 'react';

export default function InventoryMarkSoldScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const queryClient = useQueryClient();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listingId = getStringParam(params.listingId) ?? '';
  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await markListingSold(listingId);
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Mark as Sold
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}>
        <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={2}>
          {listingTitle}
        </Text>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
          This listing will be marked as sold and removed from public search.
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorMuted }]}>
          <Text variant={SheetTypography.supporting} style={{ color: colors.error }}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <HapticPressable
          onPress={() => router.back()}
          disabled={loading}
          style={[styles.secondaryButton, { borderColor: colors.sheetBorder }]}
        >
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted }}>
            Cancel
          </Text>
        </HapticPressable>

        <HapticPressable
          onPress={handleConfirm}
          disabled={loading}
          style={[styles.primaryButton, { backgroundColor: colors.success, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <CheckCircle2 size={Sizes.iconSm} color={colors.primaryForeground} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
                Confirm Sold
              </Text>
            </>
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
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
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
    borderWidth: 1,
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