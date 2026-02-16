/**
 * ModelSheet — Select car model
 *
 * Shows models based on selected make.
 * Clean, searchable list following proven sheet patterns.
 *
 * @module components/sheets/create-listing/sheets/model-sheet
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { getModelsForMake } from '@/lib/filter-constants';

import { CreateFlowSheet, CreateFlowListContent } from '../base-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

export function ModelSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onBack,
  onClose,
}: SheetStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');

  // Get models for selected make
  const allModels = useMemo(() => {
    if (!data.make) return [];
    return [...getModelsForMake(data.make)].sort();
  }, [data.make]);

  // Reset search when sheet opens
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  // Filter models: selected first, then alphabetical
  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    let models = q
      ? allModels.filter((m) => m.toLowerCase().includes(q))
      : [...allModels];

    // Put selected first
    if (data.model && models.includes(data.model)) {
      models.sort((a, b) => {
        if (a === data.model) return -1;
        if (b === data.model) return 1;
        return a.localeCompare(b);
      });
    }
    return models;
  }, [query, allModels, data.model]);

  const handleSelect = useCallback(
    (model: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (model !== data.model) {
        onUpdate({ model, trim: '' }); // Clear trim when model changes
      } else {
        onUpdate({ model });
      }
    },
    [data.model, onUpdate]
  );

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'model');
  const progress = getProgress(stepIndex + 1);

  // ── Render ──



  const renderItem = useCallback(
    ({ item: model }: { item: string }) => {
      const isSelected = model === data.model;

      return (
        <HapticPressable onPress={() => handleSelect(model)} style={styles.item}>
          <Body
            size="medium"
            style={{
              color: isSelected ? colors.text : colors.textSecondary,
              fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }}
          >
            {model}
          </Body>
          <View style={[
            styles.radio,
            { borderColor: isSelected ? colors.textMuted : colors.border },
          ]}>
            {isSelected && (
              <View style={[styles.radioInner, { backgroundColor: colors.textMuted }]} />
            )}
          </View>
        </HapticPressable>
      );
    },
    [data.model, colors, handleSelect]
  );

  // No make selected - show message
  if (!data.make) {
    return (
      <CreateFlowSheet
        visible={visible}
        onClose={onClose}
        title="Model"
        showBack
        onBack={onBack}
        progress={progress}
      >
        <View style={styles.emptyState}>
          <Body size="medium" tone="secondary">
            Select a make first
          </Body>
        </View>
      </CreateFlowSheet>
    );
  }

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Model"
      showBack
      onBack={onBack}
      primaryLabel="Next"
      primaryDisabled={!data.model}
      onPrimary={onNext}
      progress={progress}
    >
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBox, { backgroundColor: colors.fillSecondary }]}>
          <Search size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <BottomSheetTextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={data.make ? `Search ${data.make} models...` : 'Search models...'}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Spacing.lg} color={colors.textMuted} strokeWidth={2} />
            </HapticPressable>
          )}
        </View>
      </View>
      <CreateFlowListContent
        data={filteredModels}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Body size="medium" tone="secondary">
              {query ? `No models found for "${query}"` : 'No models available'}
            </Body>
          </View>
        }
      />
    </CreateFlowSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  radio: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
});

export default ModelSheet;
