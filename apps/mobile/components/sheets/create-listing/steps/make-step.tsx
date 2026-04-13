/**
 * MakeStepContent — Select car manufacturer
 *
 * Simple FlatList with search header.
 *
 * @module components/sheets/create-listing/steps/make-step
 */

import { Text, HapticPressable, TextInput } from '@/components/ui';
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X, Check } from 'lucide-react-native';

import { InputTypography, Colors, Spacing, Radius, Sizes, Layout, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { CAR_MAKES } from '@/lib/filter-constants';

import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const POPULAR_MAKES = [
  'Toyota', 'Mercedes-Benz', 'BMW', 'Nissan', 'Porsche',
  'Land Rover', 'Lexus', 'Ford', 'Chevrolet', 'Audi',
];

// ─────────────────────────────────────────────────────────────────────────────

export function MakeStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  // Build flat list: Selected first, then Popular, then rest alphabetically
  const makes = useMemo((): string[] => {
    const q = query.trim().toLowerCase();
    const selectedMake = data.make;

    if (q) {
      // When searching, still show selected first
      const filtered = CAR_MAKES.filter((m) => m.toLowerCase().includes(q));
      if (selectedMake && filtered.some(m => m === selectedMake)) {
        return [selectedMake, ...filtered.filter(m => m !== selectedMake)];
      }
      return filtered;
    }

    // No search: Selected first, then Popular, then rest alphabetically
    const allSorted = [...CAR_MAKES]
      .filter((m) => !POPULAR_MAKES.includes(m) && m !== selectedMake)
      .sort((a, b) => a.localeCompare(b));
    
    const popularWithoutSelected = POPULAR_MAKES.filter(m => m !== selectedMake);
    
    if (selectedMake) {
      return [selectedMake, ...popularWithoutSelected, ...allSorted];
    }
    return [...POPULAR_MAKES, ...allSorted];
  }, [query, data.make]);

  const handleSelect = useCallback(
    (make: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (make !== data.make) {
        onUpdate({ make, model: make === 'Other' ? 'Other' : '', trim: '' });
      } else {
        onUpdate({ make });
      }
    },
    [data.make, onUpdate]
  );

  const renderItem = useCallback(
    ({ item: make, index }: { item: string; index: number }) => {
      const isSelected = make === data.make;
      const isPopular = !query && index < POPULAR_MAKES.length;

      return (
        <HapticPressable
          onPress={() => handleSelect(make)}
          style={styles.item}
        >
          <View style={styles.itemContent}>
            <Text
              variant={isSelected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
              style={{ color: isSelected ? colors.label : colors.labelSecondary }}
            >
              {make}
            </Text>
            {isPopular && (
              <Text variant={SheetTypography.supporting} tone="muted">Popular</Text>
            )}
          </View>
          {isSelected && (
            <Check size={Sizes.iconMd} color={colors.primary} strokeWidth={2.5} />
          )}
        </HapticPressable>
      );
    },
    [data.make, colors, handleSelect, query]
  );

  return (
    <View style={styles.container}>
      {/* Search - outside FlatList to prevent focus loss */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}> 
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary }]}> 
          <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.label }]}
            placeholder="Search makes"
            placeholderTextColor={colors.labelQuaternary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Spacing.lg} color={colors.placeholder} strokeWidth={2} />
            </HapticPressable>
          )}
        </View>
      </View>

      <FlatList
        data={makes}
        keyExtractor={(item: string) => item}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing['3xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant={SheetTypography.rowLabel} tone="secondary">No makes found for &quot;{query}&quot;</Text>
          </View>
        }
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
  },
  searchInput: {
    flex: 1,
    ...InputTypography,
    paddingVertical: Spacing.none,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  itemContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});

export default MakeStepContent;
