/**
 * YearStepContent — Select vehicle year
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/year-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Search, X, Check } from 'lucide-react-native';

import { InputTypography, Colors, Spacing, Radius, Sizes, Layout, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

function generateYears(): string[] {
  const maxYear = new Date().getFullYear() + 1;
  const years: string[] = [];
  for (let y = maxYear; y >= 1900; y--) {
    years.push(String(y));
  }
  return years;
}

const ALL_YEARS = generateYears();
const currentYear = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────

export function YearStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<string>>(null);
  const [query, setQuery] = useState('');

  // Filter years based on search query
  const years = useMemo(() => {
    const q = query.trim();
    if (!q) return ALL_YEARS;
    return ALL_YEARS.filter((year) => year.includes(q));
  }, [query]);

  // Scroll to selected year on mount (only when no search active)
  useEffect(() => {
    if (data.year && !query) {
      const index = years.indexOf(data.year);
      if (index !== -1) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.3,
          });
        }, 300);
      }
    }
  }, [data.year, years, query]);

  const handleSelect = useCallback(
    (year: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ year });
      setQuery(''); // Clear search after selection
    },
    [onUpdate]
  );

  const renderItem = useCallback(
    ({ item: year }: { item: string }) => {
      const isSelected = year === data.year;
      const yearNum = parseInt(year, 10);
      const isRecent = yearNum >= currentYear - 2;
      const isClassic = yearNum <= 1990;

      return (
        <HapticPressable onPress={() => handleSelect(year)} style={styles.item}>
          <View style={styles.itemContent}>
            <Text
              variant={isSelected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
              style={{ color: isSelected ? colors.label : colors.labelSecondary }}
            >
              {year}
            </Text>
            {isRecent && (
              <Text variant={SheetTypography.supporting} tone="muted">Recent</Text>
            )}
            {isClassic && (
              <Text variant={SheetTypography.supporting} tone="muted">Classic</Text>
            )}
          </View>
          {isSelected && (
            <Check size={Sizes.iconMd} color={colors.primary} strokeWidth={2.5} />
          )}
        </HapticPressable>
      );
    },
    [data.year, colors, handleSelect]
  );

  return (
    <View style={styles.container}>
      {/* Search - outside FlatList to prevent focus loss */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}> 
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary }]}> 
          <Search size={Sizes.iconSm} color={colors.placeholder} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.label }]}
            placeholder="Search years"
            placeholderTextColor={colors.labelQuaternary}
            value={query}
            onChangeText={setQuery}
            keyboardType="number-pad"
            autoCorrect={false}
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
        ref={listRef}
        data={years}
        keyExtractor={(item: string) => item}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing['3xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_: ArrayLike<string> | null | undefined, index: number) => ({
          length: 56 + Spacing.xs,
          offset: (56 + Spacing.xs) * index,
          index,
        })}
        onScrollToIndexFailed={(info: { index: number }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant={SheetTypography.rowLabel} tone="secondary">No year found for &quot;{query}&quot;</Text>
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
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    gap: Spacing.sm,
    height: Sizes.actionButtonLg,
  },
  searchInput: {
    flex: 1,
    ...InputTypography,
    paddingVertical: Spacing.none,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    minHeight: Spacing["5xl"],
  },
  itemContent: {
    gap: Spacing.xs,
  },
  emptyState: {
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
  },
});

export default YearStepContent;
