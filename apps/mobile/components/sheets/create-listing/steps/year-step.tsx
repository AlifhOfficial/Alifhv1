/**
 * YearStepContent — Select vehicle year
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/year-step
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

function generateYears(): string[] {
  const maxYear = new Date().getFullYear() + 1;
  const years: string[] = [];
  for (let y = maxYear; y >= 1970; y--) {
    years.push(String(y));
  }
  return years;
}

// ─────────────────────────────────────────────────────────────────────────────

export function YearStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const years = useMemo(() => generateYears(), []);
  const currentYear = new Date().getFullYear();

  // Scroll to selected year on mount
  useEffect(() => {
    if (data.year) {
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
  }, [data.year, years]);

  const handleSelect = useCallback(
    (year: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ year });
    },
    [onUpdate]
  );

  const renderHeader = useMemo(
    () => (
      <View style={[styles.infoRow, { backgroundColor: colors.fillSecondary }]}>
        <Calendar size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
        <Supporting size="medium" tone="muted">
          {currentYear + 1} to 1970 available
        </Supporting>
      </View>
    ),
    [colors, currentYear]
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
            <Body
              size="large"
              style={{
                color: isSelected ? colors.text : colors.textSecondary,
                fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }}
            >
              {year}
            </Body>
            {isRecent && (
              <Supporting size="small" tone="muted">Recent</Supporting>
            )}
            {isClassic && (
              <Supporting size="small" tone="muted">Classic</Supporting>
            )}
          </View>
          <View style={[
            styles.radio,
            { borderColor: isSelected ? colors.primary : colors.border },
          ]}>
            {isSelected && (
              <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
            )}
          </View>
        </HapticPressable>
      );
    },
    [data.year, colors, handleSelect, currentYear]
  );

  return (
    <BottomSheetFlatList
      ref={listRef}
      data={years}
      keyExtractor={(item: string) => item}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing['3xl'] }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      getItemLayout={(_: string[] | null | undefined, index: number) => ({
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
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
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
    minHeight: 56,
  },
  itemContent: {
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
});

export default YearStepContent;
