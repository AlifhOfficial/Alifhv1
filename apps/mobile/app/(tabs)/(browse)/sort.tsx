import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import type { SearchSortOption } from '@/lib/search-api';

const SORT_OPTIONS: { value: SearchSortOption; label: string }[] = [
  { value: 'relevance', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Recently Listed' },
  { value: 'oldest', label: 'Oldest Listings' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Lowest Mileage' },
  { value: 'mileage_high', label: 'Highest Mileage' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
];

export default function SortScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { sortBy, applySort } = useSearch();
  const insets = useSafeAreaInsets();

  function handleSelect(sort: SearchSortOption) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    applySort(sort);
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Sort By
        </Text>
      </View>

      <View style={styles.list}>
        {SORT_OPTIONS.map((option) => {
          const selected = sortBy === option.value;
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
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? colors.sheetLabelMuted : colors.sheetBorder },
                ]}
              >
                {selected && (
                  <View style={[styles.radioInner, { backgroundColor: colors.sheetLabelMuted }]} />
                )}
              </View>
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
  radio: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
});
