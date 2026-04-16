/**
 * ModelStepContent — Select car model
 *
 * Simple FlatList with search header.
 *
 * @module components/sheets/create-listing/steps/model-step
 */

import { Text, HapticPressable, TextInput } from '@/components/ui';
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X, Check, AlertCircle } from 'lucide-react-native';

import { InputTypography, Colors, Spacing, Radius, Sizes, Layout, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getModelsForMake } from '@/lib/filter-constants';

import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function ModelStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  // Get models for selected make
  const allModels = useMemo(() => {
    if (!data.make) return [];
    return [...getModelsForMake(data.make)].sort();
  }, [data.make]);

  // Filter models by search - selected first
  const models = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    if (q) {
      // When searching, still show selected first
      const filtered = allModels.filter((m) => m.toLowerCase().includes(q));
      if (data.model && filtered.includes(data.model)) {
        return [data.model, ...filtered.filter(m => m !== data.model)];
      }
      return filtered;
    }
    
    // No search: selected first, then rest
    if (data.model && allModels.includes(data.model)) {
      return [data.model, ...allModels.filter(m => m !== data.model)];
    }
    return allModels;
  }, [query, allModels, data.model]);

  const handleSelect = useCallback(
    (model: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (model !== data.model) {
        onUpdate({ model, trim: '' });
      } else {
        onUpdate({ model });
      }
    },
    [data.model, onUpdate]
  );

  const renderItem = useCallback(
    ({ item: model }: { item: string }) => {
      const isSelected = model === data.model;

      return (
        <HapticPressable
          onPress={() => handleSelect(model)}
          style={styles.item}
        >
          <Text
            variant={isSelected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
            style={{ color: isSelected ? colors.label : colors.labelSecondary }}
          >
            {model}
          </Text>
          {isSelected && (
            <Check size={Sizes.iconMd} color={colors.primary} strokeWidth={2.5} />
          )}
        </HapticPressable>
      );
    },
    [data.model, colors, handleSelect]
  );

  // No make selected state
  if (!data.make) {
    return (
      <View style={styles.noMakeState}>
        <AlertCircle size={Sizes.iconLg} color={colors.labelQuaternary} strokeWidth={1.5} />
        <Text variant={SheetTypography.rowLabel} tone="secondary" style={{ textAlign: 'center' }}>
          Please select a make first
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search - outside FlatList to prevent focus loss */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.sheet }]}> 
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary }]}> 
          <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.label }]}
            placeholder={`Search ${data.make} models`}
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
        <Text variant={SheetTypography.supporting} tone="muted" style={styles.modelCount}>
          {allModels.length} models
        </Text>
      </View>

      <FlatList
        data={models}
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
            <Text variant={SheetTypography.rowLabel} tone="secondary">
              {query ? `No models found for "${query}"` : 'No models available'}
            </Text>
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
    gap: Spacing.sm,
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
  modelCount: {
    textAlign: 'right',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  noMakeState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
});

export default ModelStepContent;
