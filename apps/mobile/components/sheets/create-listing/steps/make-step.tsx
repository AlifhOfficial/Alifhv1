/**
 * MakeStepContent — Select car manufacturer
 *
 * Simple FlatList with search header.
 *
 * @module components/sheets/create-listing/steps/make-step
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X, Check } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { CAR_MAKES } from '@/lib/filter-constants';

import type { StepContentProps } from '../create-listing-flow';

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
        onUpdate({ make, model: '', trim: '' });
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
          style={[styles.item, { borderBottomColor: colors.border }]}
        >
          <View style={styles.itemContent}>
            <Body
              size="medium"
              style={{
                color: isSelected ? colors.text : colors.textSecondary,
                fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }}
            >
              {make}
            </Body>
            {isPopular && (
              <Supporting size="small" tone="muted">Popular</Supporting>
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
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.fillSecondary }]}>
          <Search size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <BottomSheetTextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search makes..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Spacing.lg} color={colors.textMuted} strokeWidth={2} />
            </HapticPressable>
          )}
        </View>
      </View>

      <BottomSheetFlatList
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
            <Body size="medium" tone="secondary">No makes found for "{query}"</Body>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: Layout.hitTarget,
    borderRadius: Radius.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});

export default MakeStepContent;
