import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Trash2 } from 'lucide-react-native';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { deleteListing, hardDeleteListing } from '@/lib/sell-car-user-api';
import { buildInventoryRouteParams, getStringParam, parseBooleanParam, type InventorySheetRouteParams } from '@/components/user-inventory-management/sub-operations/route-params';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

export default function InventoryDeleteScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const queryClient = useQueryClient();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listingId = getStringParam(params.listingId) ?? '';
  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';
  const activeTab = getStringParam(params.activeTab);
  const hardDelete = parseBooleanParam(params.hardDelete);
  const description = hardDelete
    ? 'This action is irreversible. The listing and all its images will be permanently removed.'
    : 'This listing will be removed from public search. You can contact support to recover it.';

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      const result = hardDelete ? await hardDeleteListing(listingId) : await deleteListing(listingId);
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (result.action === 'soft_deleted' && activeTab !== 'deleted') {
        router.replace({ pathname: '/inventory', params: { tab: 'deleted' } });
        return;
      }

      router.replace({ pathname: '/inventory', params: buildInventoryRouteParams(activeTab) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete listing';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <SheetHeader title={hardDelete ? 'Delete Forever' : 'Delete Listing'} />

      {hardDelete ? (
        <View style={[styles.warningBanner, { backgroundColor: colors.errorMuted }]}> 
          <AlertTriangle size={16} color={colors.error} />
          <Text variant={SheetTypography.supporting} style={{ color: colors.error, flex: 1 }}>
            This cannot be undone. All photos will be permanently deleted.
          </Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}>
        <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={2}>
          {listingTitle}
        </Text>
        <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
          {description}
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
          style={[styles.primaryButton, { backgroundColor: colors.error, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <Trash2 size={16} color={colors.primaryForeground} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
                {hardDelete ? 'Delete Forever' : 'Delete'}
              </Text>
            </>
          )}
        </HapticPressable>
      </View>

      <View style={{ height: getSheetBottomPadding(insets.bottom) }} />
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
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
