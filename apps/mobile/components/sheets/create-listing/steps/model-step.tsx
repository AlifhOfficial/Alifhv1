/**
 * ModelStepContent — Select car model
 *
 * Simple FlatList with search header.
 *
 * @module components/sheets/create-listing/steps/model-step
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X, Check, AlertCircle } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { getModelsForMake } from '@/lib/filter-constants';

import type { StepContentProps } from '../create-listing-flow';

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
          style={[styles.item, { borderBottomColor: colors.border }]}
        >
          <Body
            size="medium"
            style={{
              color: isSelected ? colors.text : colors.text2,
              fontWeight: isSelected ? '600' : '400',
            }}
          >
            {model}
          </Body>
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
        <AlertCircle size={Sizes.iconLg} color={colors.textMuted} strokeWidth={1.5} />
        <Body size="medium" tone="secondary" style={{ textAlign: 'center' }}>
          Please select a make first
        </Body>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search - outside FlatList to prevent focus loss */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.fill2 }]}>
          <Search size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <BottomSheetTextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search ${data.make} models...`}
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
        <Supporting size="small" tone="muted" style={styles.modelCount}>
          {allModels.length} models
        </Supporting>
      </View>

      <BottomSheetFlatList
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
            <Body size="medium" tone="secondary">
              {query ? `No models found for "${query}"` : 'No models available'}
            </Body>
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
    fontWeight: '400',
    paddingVertical: 0,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
