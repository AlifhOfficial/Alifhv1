/**
 * YearSheet — Select vehicle year
 *
 * Scrollable year picker from current+1 to 1970.
 * Following proven sheet patterns.
 *
 * @module components/sheets/create-listing/sheets/year-sheet
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

import { CreateFlowSheet, CreateFlowListContent } from '../base-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

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

export function YearSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onBack,
  onClose,
}: SheetStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const listRef = useRef<FlatList>(null);
  const years = useMemo(() => generateYears(), []);

  const currentYear = new Date().getFullYear();

  // Scroll to selected year when sheet opens
  useEffect(() => {
    if (visible && data.year) {
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
  }, [visible]);

  const handleSelect = useCallback(
    (year: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ year });
    },
    [onUpdate]
  );

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'year');
  const progress = getProgress(stepIndex + 1);

  // ── Render ──

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
              <Supporting size="small" tone="muted">
                Recent
              </Supporting>
            )}
            {isClassic && (
              <Supporting size="small" tone="muted">
                Classic
              </Supporting>
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
    [data.year, colors, handleSelect, currentYear]
  );

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Year"
      showBack
      onBack={onBack}
      primaryLabel="Next"
      primaryDisabled={!data.year}
      onPrimary={onNext}
      progress={progress}
    >
      <CreateFlowListContent
        listRef={listRef}
        data={years}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        getItemLayout={(_: string[] | null | undefined, index: number) => ({
          length: 56 + Spacing.xs,
          offset: (56 + Spacing.xs) * index,
          index,
        })}
        onScrollToIndexFailed={(info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
      />
    </CreateFlowSheet>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
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

export default YearSheet;
