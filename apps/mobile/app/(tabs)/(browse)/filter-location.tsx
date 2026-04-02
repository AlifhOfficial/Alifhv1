import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { UAE_EMIRATES } from '@/lib/filter-constants';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function FilterLocationScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { filterParams, updateFilterParams } = useSearch();

  const selected = useMemo(() => filterParams.emirate ?? [], [filterParams.emirate]);

  const sortedOptions = useMemo(() => {
    const selectedSet = new Set(selected);
    const selectedOpts = UAE_EMIRATES.filter((o) => selectedSet.has(o.value));
    const rest = UAE_EMIRATES.filter((o) => !selectedSet.has(o.value));
    return [...selectedOpts, ...rest];
  }, [selected]);

  const toggle = (value: string) => {
    const updated = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    updateFilterParams({ emirate: updated.length > 0 ? updated : undefined });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Location" />

      <View style={{ alignItems: 'flex-end', marginBottom: Spacing.md }}>
        <HapticPressable onPress={() => updateFilterParams({ emirate: undefined })} hitSlop={Spacing.md}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
      </View>

      <View style={styles.list}>
        {sortedOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <HapticPressable
              key={option.value}
              onPress={() => toggle(option.value)}
              style={[styles.item, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary }]}
            >
              <Text variant={isSelected ? 'subheadEmphasized' : 'subhead'}>{option.label}</Text>
            </HapticPressable>
          );
        })}
      </View>
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
  list: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  item: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
