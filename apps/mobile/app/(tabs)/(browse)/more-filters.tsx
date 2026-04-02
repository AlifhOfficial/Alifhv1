import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch, type BrowseViewMode } from '@/context/search-context';
import { BODY_TYPES, FUEL_TYPES, TRANSMISSION_TYPES, SPECS_TYPES, SELLER_TYPE_OPTIONS } from '@/lib/filter-constants';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function MoreFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { viewMode } = useLocalSearchParams<{ viewMode?: string }>();
  const { filterParams, updateFilterParams, triggerBrowseViewMode } = useSearch();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['popular']));

  const currentViewMode: BrowseViewMode = viewMode === 'list' ? 'list' : 'grid';

  const activeCount = useMemo(() => {
    let count = 0;
    if (filterParams.condition) count++;
    if (filterParams.isBlkListing) count++;
    if (filterParams.isBlackTierPartner) count++;
    if (filterParams.isNegotiable) count++;
    count += filterParams.specs?.length ?? 0;
    count += filterParams.bodyType?.length ?? 0;
    count += filterParams.fuelType?.length ?? 0;
    count += filterParams.transmission?.length ?? 0;
    if (filterParams.sellerType) count++;
    return count;
  }, [filterParams]);

  const toggleSection = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleArray = (key: 'specs' | 'bodyType' | 'fuelType' | 'transmission', value: string) => {
    const current = (filterParams[key] as string[] | undefined) ?? [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateFilterParams({ [key]: updated.length > 0 ? updated : undefined });
  };

  const setSellerType = (value: 'dealer' | 'private') => {
    updateFilterParams({ sellerType: filterParams.sellerType === value ? undefined : value });
  };

  const clearAll = () => {
    updateFilterParams({
      condition: undefined,
      isBlkListing: undefined,
      isBlackTierPartner: undefined,
      isNegotiable: undefined,
      specs: undefined,
      bodyType: undefined,
      fuelType: undefined,
      transmission: undefined,
      sellerType: undefined,
    });
  };

  const renderChipSection = (title: string, key: string, options: readonly { readonly value: string; readonly label: string }[], selected: string[] | undefined, onToggle: (value: string) => void) => {
    const isExpanded = expanded.has(key);
    return (
      <View style={styles.section}>
        <HapticPressable style={styles.sectionHeader} onPress={() => toggleSection(key)}>
          <Text variant="subhead">{title}</Text>
          <Text variant="subhead" tone="muted">{isExpanded ? 'Hide' : 'Show'}</Text>
        </HapticPressable>
        {isExpanded ? (
          <View style={styles.chipsRow}>
            {options.map((option) => {
              const isSelected = selected?.includes(option.value);
              return (
                <HapticPressable
                  key={option.value}
                  onPress={() => onToggle(option.value)}
                  style={[styles.chip, { backgroundColor: isSelected ? colors.label : colors.surfaceSecondary, borderColor: isSelected ? colors.label : colors.border }]}
                >
                  <Text variant="subhead" style={{ color: isSelected ? colors.background : colors.label }}>{option.label}</Text>
                </HapticPressable>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Filters" />

      <View style={{ alignItems: 'flex-end' }}>
        <HapticPressable onPress={clearAll} hitSlop={Spacing.md}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
      </View>

      <View style={styles.summaryRow}>
        <Text variant="subhead" tone="secondary">{activeCount} active filters</Text>
      </View>

      <View style={styles.section}>
        <Text variant="subheadEmphasized">View Mode</Text>
        <View style={styles.chipsRow}>
          {(['grid', 'list'] as const).map((mode) => {
            const selected = currentViewMode === mode;
            return (
              <HapticPressable
                key={mode}
                onPress={() => triggerBrowseViewMode(mode)}
                style={[styles.chip, { backgroundColor: selected ? colors.label : colors.surfaceSecondary, borderColor: selected ? colors.label : colors.border }]}
              >
                <Text variant="subhead" style={{ color: selected ? colors.background : colors.label }}>{mode === 'grid' ? 'Grid' : 'List'}</Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {renderChipSection('Regional Specs', 'specs', SPECS_TYPES, filterParams.specs, (v) => toggleArray('specs', v))}
      {renderChipSection('Body Type', 'bodyType', BODY_TYPES, filterParams.bodyType, (v) => toggleArray('bodyType', v))}
      {renderChipSection('Fuel Type', 'fuelType', FUEL_TYPES, filterParams.fuelType, (v) => toggleArray('fuelType', v))}
      {renderChipSection('Transmission', 'transmission', TRANSMISSION_TYPES, filterParams.transmission, (v) => toggleArray('transmission', v))}

      <View style={styles.section}>
        <Text variant="subheadEmphasized">Seller Type</Text>
        <View style={styles.chipsRow}>
          {SELLER_TYPE_OPTIONS.map((opt) => {
            const selected = filterParams.sellerType === opt.value;
            return (
              <HapticPressable
                key={opt.value}
                onPress={() => setSellerType(opt.value)}
                style={[styles.chip, { backgroundColor: selected ? colors.label : colors.surfaceSecondary, borderColor: selected ? colors.label : colors.border }]}
              >
                <Text variant="subhead" style={{ color: selected ? colors.background : colors.label }}>{opt.label}</Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
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
  summaryRow: {
    paddingVertical: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
