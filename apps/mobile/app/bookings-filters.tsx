import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getUserBookings, type BookingFilter, type BookingStatus } from '@/lib/booking-api';

const STATUS_OPTIONS: { value: BookingFilter; label: string }[] = [
  { value: 'all', label: 'All Bookings' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no_show', label: 'No Show' },
];

function isBookingFilter(value: string | undefined): value is BookingFilter {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

function buildBookingsRouteParams(activeTab?: BookingFilter | string) {
  if (!activeTab || activeTab === 'all') {
    return {};
  }

  return { tab: activeTab };
}

export default function BookingsFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ activeTab?: string | string[] }>();

  const rawActiveTab = Array.isArray(params.activeTab) ? params.activeTab[0] : params.activeTab;
  const activeTab: BookingFilter = isBookingFilter(rawActiveTab) ? rawActiveTab : 'all';

  const countQueries = useQueries({
    queries: STATUS_OPTIONS.map((option) => ({
      queryKey: ['bookings', 'counts', option.value],
      queryFn: async () => {
        const response = await getUserBookings({
          status: option.value === 'all' ? undefined : (option.value as BookingStatus),
          limit: 1,
          offset: 0,
          sort: 'newest',
        });
        return response.total;
      },
      staleTime: 60 * 1000,
    })),
  });

  const countsByFilter: Partial<Record<BookingFilter, number>> = STATUS_OPTIONS.reduce((acc, option, index) => {
    const total = countQueries[index]?.data;
    if (typeof total === 'number') {
      acc[option.value] = total;
    }
    return acc;
  }, {} as Partial<Record<BookingFilter, number>>);

  function handleSelect(nextTab: BookingFilter) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.dismissTo({
      pathname: '/bookings',
      params: buildBookingsRouteParams(nextTab),
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Filter Bookings
        </Text>
      </View>

      <View style={styles.list}>
        {STATUS_OPTIONS.map((option) => {
          const selected = option.value === activeTab;
          const count = countsByFilter[option.value] ?? 0;

          return (
            <HapticPressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={styles.listItem}
            >
              <Text
                variant={selected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
                style={{ color: selected ? colors.sheetLabel : colors.sheetLabelMuted }}
              >
                {option.label}
              </Text>

              {count > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: selected ? colors.sheetLabel : colors.sheetBorder,
                    },
                  ]}
                >
                  <Text
                    variant="footnoteEmphasized"
                    style={{ color: selected ? colors.sheet : colors.sheetLabelMuted }}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </HapticPressable>
          );
        })}
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
  list: {
    gap: SheetChrome.rowGap,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SheetChrome.rowPaddingVertical,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
  },
  countBadge: {
    minWidth: Sizes.iconMd + Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
});
