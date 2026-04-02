import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';

import { HapticPressable, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { CAR_MODELS } from '@/lib/filter-constants';
import { Colors, Layout, Radius, Sizes, Spacing } from '@/constants/theme';

type ModelOption = { model: string; make: string };

export default function FilterModelScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { searchParams, applySearch, clearSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedMakes = useMemo(() => searchParams?.make ?? [], [searchParams?.make]);
  const selectedModels = useMemo(() => searchParams?.model ?? [], [searchParams?.model]);

  const allModels = useMemo<ModelOption[]>(() => {
    const result: ModelOption[] = [];
    if (selectedMakes.length === 0) {
      for (const [make, models] of Object.entries(CAR_MODELS)) {
        for (const model of models) {
          result.push({ model, make });
        }
      }
      return result;
    }

    for (const make of selectedMakes) {
      const models = CAR_MODELS[make as keyof typeof CAR_MODELS] ?? [];
      for (const model of models) {
        result.push({ model, make });
      }
    }
    return result;
  }, [selectedMakes]);

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const selectedSet = new Set(selectedModels);
      const selectedItems = allModels.filter((m) => selectedSet.has(m.model));
      const rest = allModels.filter((m) => !selectedSet.has(m.model));
      return [...selectedItems, ...rest];
    }
    return allModels.filter((opt) => opt.model.toLowerCase().includes(q) || opt.make.toLowerCase().includes(q));
  }, [allModels, searchQuery, selectedModels]);

  const toggleModel = (model: string) => {
    const current = searchParams ?? {};
    const models = current.model ?? [];
    const updated = models.includes(model) ? models.filter((m) => m !== model) : [...models, model];

    if (updated.length === 0) {
      const { model: _model, trim: _trim, ...rest } = current;
      if (Object.keys(rest).length > 0) {
        applySearch(rest);
      } else {
        clearSearch();
      }
      return;
    }

    applySearch({ ...current, model: updated });
  };

  const clearAll = () => {
    const current = searchParams ?? {};
    const { model: _model, trim: _trim, ...rest } = current;
    if (Object.keys(rest).length > 0) {
      applySearch(rest);
    } else {
      clearSearch();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}> 
        <HapticPressable onPress={() => router.back()} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subhead" tone="muted">Close</Text>
        </HapticPressable>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Model</Text>
        <HapticPressable onPress={clearAll} hitSlop={Spacing.md} style={styles.headerAction}>
          <Text variant="subheadEmphasized" style={{ color: colors.error }}>Clear</Text>
        </HapticPressable>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}> 
        <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.label }]}
          placeholder="Search models..."
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
        {filteredModels.map((item) => {
          const isSelected = selectedModels.includes(item.model);
          return (
            <HapticPressable
              key={`${item.make}-${item.model}`}
              onPress={() => toggleModel(item.model)}
              style={[styles.listItem, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceSecondary }]}
            >
              <Text variant={isSelected ? 'subheadEmphasized' : 'subhead'}>{item.model}</Text>
              {selectedMakes.length !== 1 ? <Text variant="footnote" tone="muted">{item.make}</Text> : null}
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
    gap: Spacing.xs,
  },
});
