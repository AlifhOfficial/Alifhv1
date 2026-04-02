import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarPlus } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { extendListing } from '@/lib/sell-car-user-api';
import { formatExpiryCountdown } from '@/components/user-inventory-management/utilities/listing-helpers';
import { getStringParam, type InventorySheetRouteParams } from '@/components/user-inventory-management/sub-operations/route-params';

export default function InventoryExtendScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const queryClient = useQueryClient();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listingId = getStringParam(params.listingId) ?? '';
  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';
  const expiresAt = getStringParam(params.expiresAt);
  const expiryDisplay = expiresAt ? formatExpiryCountdown(expiresAt) : null;

  const [selectedDays, setSelectedDays] = React.useState<7 | 14>(7);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await extendListing(listingId, selectedDays);
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extend listing';
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
          Extend Listing
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.sheetSurface }]}>
        <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }} numberOfLines={2}>
          {listingTitle}
        </Text>
        {expiryDisplay ? (
          <Text
            variant={SheetTypography.supporting}
            style={{ color: expiryDisplay.isUrgent ? colors.warning : colors.sheetLabelMuted }}
          >
            {expiryDisplay.text}
          </Text>
        ) : null}
      </View>

      <View style={styles.optionsRow}>
        {([7, 14] as const).map((days) => {
          const selected = selectedDays === days;
          return (
            <HapticPressable
              key={days}
              onPress={() => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedDays(days);
              }}
              disabled={loading}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.primaryMuted : colors.sheetSurface,
                  borderColor: selected ? colors.primary : colors.sheetBorder,
                  borderWidth: selected ? 1.5 : 1,
                },
              ]}
            >
              <Text
                variant={SheetTypography.rowLabelSelected}
                style={{ color: selected ? colors.primary : colors.sheetLabel }}
              >
                {days} days
              </Text>
            </HapticPressable>
          );
        })}
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
          style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <>
              <CalendarPlus size={16} color={colors.primaryForeground} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
                Extend {selectedDays} Days
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
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingVertical: SheetChrome.rowPaddingVertical,
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