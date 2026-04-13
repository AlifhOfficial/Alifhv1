import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { buildInventoryRouteParams, getStringParam, parseNumberParam } from '@/components/user-inventory-management/sub-operations/route-params';
import type { MyListingsFilter } from '@/lib/sell-car-user-api';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

const STATUS_OPTIONS: { value: MyListingsFilter; label: string; countKey: string }[] = [
  { value: 'all', label: 'All Listings', countKey: 'totalCount' },
  { value: 'public', label: 'Public', countKey: 'activeCount' },
  { value: 'draft', label: 'Drafts', countKey: 'draftCount' },
  { value: 'in_review', label: 'In Review', countKey: 'pendingCount' },
  { value: 'sold', label: 'Sold', countKey: 'soldCount' },
  { value: 'archived', label: 'Archived', countKey: 'archivedCount' },
];

function isMyListingsFilter(value: string | undefined): value is MyListingsFilter {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

export default function InventoryFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    activeTab?: string | string[];
    totalCount?: string | string[];
    activeCount?: string | string[];
    draftCount?: string | string[];
    pendingCount?: string | string[];
    soldCount?: string | string[];
    archivedCount?: string | string[];
  }>();

  const rawActiveTab = getStringParam(params.activeTab);
  const activeTab: MyListingsFilter = isMyListingsFilter(rawActiveTab) ? rawActiveTab : 'all';

  function handleSelect(nextTab: MyListingsFilter) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.dismissTo({
      pathname: '/inventory',
      params: buildInventoryRouteParams(nextTab),
    });
  }

  return (
    <View style={styles.container}>
      <SheetHeader title="Filter Listings" />

      <View style={styles.list}>
        {STATUS_OPTIONS.map((option) => {
          const selected = option.value === activeTab;
          const count = parseNumberParam(params[option.countKey as keyof typeof params], 0);

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
