import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function ActiveFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
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
  };

  const grouped = useMemo(() => {
    const map = new Map<string, typeof chips>();
    for (const chip of chips) {
      const key = chip.key;
      const current = map.get(key) ?? [];
      current.push(chip);
      map.set(key, current);
    }
    return Array.from(map.entries());
  }, [chips]);

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Active Filters</Text>
        <HapticPressable onPress={clearAll} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
      </View>

      {!hasFilters ? (
        <View style={styles.emptyState}>
          <Text variant="subhead" tone="muted">No active filters</Text>
        </View>
      ) : (
        <View style={styles.sections}>
          {grouped.map(([groupKey, groupChips]) => (
            <View key={groupKey} style={styles.category}>
              <Text variant="caption1Emphasized" tone="muted" uppercase>{groupKey}</Text>
              <View style={styles.chips}>
                {groupChips.map((chip, idx) => (
                  <HapticPressable
                    key={`${chip.key}-${chip.value}-${chip.index ?? idx}`}
                    disabled={chip.locked}
                    style={[styles.chip, { backgroundColor: colors.fill2, borderColor: colors.border, opacity: chip.locked ? 0.7 : 1 }]}
                  >
                    <Text variant="subhead" numberOfLines={1}>{chip.label}</Text>
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
    paddingHorizontal: Spacing.lg,
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
});
