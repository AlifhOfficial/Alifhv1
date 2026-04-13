import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Radius, SheetChrome, Sizes, Spacing } from '@/constants/theme';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

const GROUP_LABELS: Record<string, string> = {
  sort: 'Sort',
  q: 'Keyword',
  make: 'Make',
  model: 'Model',
  trim: 'Trim',
  partnerId: 'Partner',
  sellerId: 'Seller',
  tags: 'Tags',
  extras: 'Extras',
  price: 'Price',
  year: 'Year',
  mileage: 'Mileage',
  emirate: 'Location',
  specs: 'Regional Specs',
  bodyType: 'Body Type',
  fuelType: 'Fuel Type',
  transmission: 'Transmission',
  engineSize: 'Engine Size',
  exteriorColor: 'Exterior Color',
  interiorColor: 'Interior Color',
  condition: 'Condition',
  sellerType: 'Seller Type',
  exportStatus: 'Export Status',
  isNegotiable: 'Negotiable',
  isBlkListing: 'Black Listings',
  isBlackTierPartner: 'Black Members',
};

const GROUP_ORDER = [
  'sort',
  'q',
  'make',
  'model',
  'trim',
  'price',
  'year',
  'mileage',
  'emirate',
  'specs',
  'bodyType',
  'fuelType',
  'transmission',
  'engineSize',
  'exteriorColor',
  'interiorColor',
  'condition',
  'sellerType',
  'exportStatus',
  'isNegotiable',
  'isBlkListing',
  'isBlackTierPartner',
  'partnerId',
  'sellerId',
  'tags',
  'extras',
] as const;

function toStartCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getGroupLabel(key: string) {
  return GROUP_LABELS[key] ?? toStartCase(key);
}

export default function ActiveFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { getSearchChips, removeSearchParam, removeFilterParam, clearSearch, clearFilterParams, resetSort, sortBy } = useSearch();

  const chips = getSearchChips();

  const hasFilters = chips.length > 0;

  const removeChip = (chip: (typeof chips)[number]) => {
    if (chip.locked) return;
    if (chip.key === 'sort') {
      resetSort();
      return;
    }
    if (['make', 'model', 'trim', 'q', 'partnerId', 'sellerId', 'tags', 'extras'].includes(chip.key)) {
      removeSearchParam(chip.key as 'make' | 'model' | 'trim' | 'q' | 'partnerId' | 'sellerId' | 'tags' | 'extras', chip.index);
      return;
    }
    removeFilterParam(chip.key as 'price' | 'year' | 'mileage' | 'emirate' | 'bodyType' | 'fuelType' | 'transmission' | 'specs' | 'exteriorColor' | 'interiorColor' | 'engineSize' | 'condition' | 'isNegotiable' | 'isBlkListing' | 'isBlackTierPartner' | 'sellerType' | 'exportStatus', chip.index);
  };

  const clearAll = () => {
    clearSearch();
    clearFilterParams();
    if (sortBy !== 'relevance') {
      resetSort();
    }
    router.back();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof chips>();
    for (const chip of chips) {
      const key = chip.key;
      const current = map.get(key) ?? [];
      current.push(chip);
      map.set(key, current);
    }
    return Array.from(map.entries())
      .map(([key, groupChips]) => ({
        key,
        label: getGroupLabel(key),
        chips: [...groupChips].sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => {
        const aIndex = GROUP_ORDER.indexOf(a.key as (typeof GROUP_ORDER)[number]);
        const bIndex = GROUP_ORDER.indexOf(b.key as (typeof GROUP_ORDER)[number]);
        const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
        const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
        if (aRank !== bRank) return aRank - bRank;
        return a.label.localeCompare(b.label);
      });
  }, [chips]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.sheet, paddingBottom: getSheetBottomPadding(insets.bottom) },
      ]}
    > 
      <SheetHeader
        title="Active Filters"
        left={
          <HapticPressable
            onPress={clearAll}
            hitSlop={Spacing.sm}
          >
            <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
          </HapticPressable>
        }
        right={
          <HapticPressable
            onPress={() => router.back()}
            hitSlop={Spacing.sm}
            style={[styles.headerActionButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
        }
      />

      {!hasFilters ? (
        <View style={styles.emptyState}>
          <Text variant="subhead" style={{ color: colors.labelTertiary }}>No active filters</Text>
        </View>
      ) : (
        <View style={styles.sections}>
          {grouped.map((group) => (
            <View key={group.key} style={styles.category}>
              <Text
                variant="subheadEmphasized"
                style={{ color: colors.label }}
              >
                {group.label}
              </Text>
              <View style={styles.chips}>
                {group.chips.map((chip, idx) => (
                  <HapticPressable
                    key={`${chip.key}-${chip.value}-${chip.index ?? idx}`}
                    disabled={chip.locked}
                    onPress={() => removeChip(chip)}
                    style={[styles.chip, { backgroundColor: colors.fill2, borderColor: colors.border, opacity: chip.locked ? 0.7 : 1 }]}
                  >
                    <Text variant="subhead" style={{ color: colors.label }} numberOfLines={1}>{chip.label}</Text>
                    {!chip.locked ? (
                      <HapticPressable
                        onPress={() => removeChip(chip)}
                        hitSlop={Spacing.xs}
                        style={styles.clearIconWrap}
                      >
                        <Ionicons name="close" size={Spacing.md} color={colors.labelTertiary} />
                      </HapticPressable>
                    ) : null}
                  </HapticPressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
    paddingBottom: Spacing.lg,
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
  headerAction: {
    minWidth: 56,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sections: {
    marginTop: Spacing.md,
    gap: Spacing.md,
    flex: 1,
  },
  category: {
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionButton: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
