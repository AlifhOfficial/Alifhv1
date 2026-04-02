import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { CAR_MAKES, getModelsForMake } from '@/lib/filter-constants';
import { Colors, Layout, Radius, Sizes, Spacing } from '@/constants/theme';

export default function FilterMakeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { searchParams, applySearch, clearSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const selected = useMemo(() => searchParams?.make ?? [], [searchParams?.make]);

  const filteredMakes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const selectedSet = new Set(selected);
      const selectedMakes = CAR_MAKES.filter((m) => selectedSet.has(m));
      const rest = CAR_MAKES.filter((m) => !selectedSet.has(m));
      return [...selectedMakes, ...rest];
    }
    return CAR_MAKES.filter((make) => make.toLowerCase().includes(q));
  }, [searchQuery, selected]);

  const handleToggle = (make: string) => {
    const current = searchParams ?? {};
    const currentMakes = current.make ?? [];
    const isSelected = currentMakes.includes(make);
    const updatedMakes = isSelected ? currentMakes.filter((m) => m !== make) : [...currentMakes, make];

    if (updatedMakes.length === 0) {
      const { make: _make, model: _model, trim: _trim, ...rest } = current;
      if (Object.keys(rest).length > 0) {
        applySearch(rest);
      } else {
        clearSearch();
      }
      return;
    }

    const currentModels = current.model ?? [];
    const validModels = currentModels.filter((m) => updatedMakes.some((mk) => getModelsForMake(mk).includes(m)));

    applySearch({
      ...current,
      make: updatedMakes,
      model: validModels.length > 0 ? validModels : undefined,
      trim: validModels.length > 0 ? current.trim : undefined,
    });
  };

  const clearAll = () => {
    const current = searchParams ?? {};
    const { make: _make, model: _model, trim: _trim, ...rest } = current;
    if (Object.keys(rest).length > 0) {
      applySearch(rest);
    } else {
      clearSearch();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Make" />

      <View style={{ alignItems: 'flex-end', marginBottom: Spacing.md }}>
        <HapticPressable onPress={clearAll} hitSlop={Spacing.md}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}> 
        <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.label }]}
          placeholder="Search makes..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 ? (
          <HapticPressable onPress={() => setSearchQuery('')} hitSlop={Layout.hitSlopSmall}>
            <X size={Spacing.lg} color={colors.placeholder} strokeWidth={2} />
          </HapticPressable>
        ) : null}
      </View>

      <View style={styles.list}>
        {filteredMakes.map((make) => {
          const isSelected = selected.includes(make);
          return (
            <HapticPressable
              key={make}
              onPress={() => handleToggle(make)}
              style={[styles.listItem, { backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary, borderColor: isSelected ? colors.primary : colors.border }]}
            >
              <Text variant={isSelected ? 'subheadEmphasized' : 'subhead'} style={{ color: isSelected ? colors.label : colors.labelSecondary }}>
                {make}
              </Text>
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
  searchContainer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: Sizes.actionButtonMd,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  list: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
