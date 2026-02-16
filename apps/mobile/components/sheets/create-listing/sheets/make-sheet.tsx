/**
 * MakeSheet — Select car manufacturer
 *
 * Clean, searchable list following proven sheet patterns.
 *
 * @module components/sheets/create-listing/sheets/make-sheet
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Search, X, Check } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { CAR_MAKES } from '@/lib/filter-constants';

import { CreateFlowSheet, CreateFlowListContent } from '../base-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const POPULAR_MAKES = [
  'Toyota', 'Mercedes-Benz', 'BMW', 'Nissan', 'Porsche',
  'Land Rover', 'Lexus', 'Ford', 'Chevrolet', 'Audi',
];

// ─────────────────────────────────────────────────────────────────────────────

export function MakeSheet({
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

  // Reset search when sheet opens
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  // Filter and sort: selected → popular → alphabetical
  const filteredMakes = useMemo(() => {
    const q = query.trim().toLowerCase();
    let makes = [...CAR_MAKES];

    if (q) {
      makes = makes.filter((m) => m.toLowerCase().includes(q));
    } else {
      makes.sort((a, b) => {
        if (a === data.make) return -1;
        if (b === data.make) return 1;
        const aIdx = POPULAR_MAKES.indexOf(a);
        const bIdx = POPULAR_MAKES.indexOf(b);
        if (aIdx !== -1 && bIdx === -1) return -1;
        if (bIdx !== -1 && aIdx === -1) return 1;
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        return a.localeCompare(b);
      });
    }
    return makes;
  }, [query, data.make]);

  const handleSelect = useCallback(
    (make: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Clear model when make changes
      if (make !== data.make) {
        onUpdate({ make, model: '', trim: '' });
      } else {
        onUpdate({ make });
      }
    },
    [data.make, onUpdate]
  );

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'make');
  const progress = getProgress(stepIndex + 1);

  // ── Render ──



  const renderItem = useCallback(
    ({ item: make }: { item: string }) => {
      const isSelected = make === data.make;
      const isPopular = !query && POPULAR_MAKES.includes(make);

      return (
        <HapticPressable onPress={() => handleSelect(make)} style={styles.item}>
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
    [data.make, colors, handleSelect, query]
  );

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Make"
      showBack
      onBack={onBack}
      primaryLabel="Next"
      primaryDisabled={!data.make}
      onPrimary={onNext}
      progress={progress}
    >
      <View style={styles.searchWrapper}>
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
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Spacing.lg} color={colors.textMuted} strokeWidth={2} />
            </HapticPressable>
          )}
        </View>
      </View>
      <CreateFlowListContent
        data={filteredMakes}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Body size="medium" tone="secondary">No makes found</Body>
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
  itemContent: {
    flex: 1,
    gap: 2,
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
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
});

export default MakeSheet;
