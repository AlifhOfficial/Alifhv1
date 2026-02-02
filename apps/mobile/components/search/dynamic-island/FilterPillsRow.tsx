/**
 * FilterPillsRow Component
 * 
 * Horizontal scrollable row of filter pills.
 */

import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Spacing } from '@/constants/theme';
import { FilterPill } from './FilterPill';
import { ISLAND_CONFIG } from './constants';
import type { FilterPillsRowProps, ActivePill } from './types';

export function FilterPillsRow({
  filters,
  activePill,
  onPillPress,
  onClearFilter,
  getPillLabel,
  isPillActive,
  colors,
}: FilterPillsRowProps) {
  const pills: Array<{ key: ActivePill; show: boolean; clearKeys: string[] }> = [
    { key: 'make', show: true, clearKeys: ['make', 'model'] },
    { key: 'model', show: !!filters.make, clearKeys: ['model'] },
    { key: 'price', show: true, clearKeys: ['priceMin', 'priceMax'] },
    { key: 'year', show: true, clearKeys: ['yearMin', 'yearMax'] },
    { key: 'mileage', show: true, clearKeys: ['mileageMax'] },
    { key: 'location', show: true, clearKeys: ['emirate'] },
    { key: 'more', show: true, clearKeys: ['condition', 'isBlkListing', 'isBlackTierPartner', 'isNegotiable', 'specs'] },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {pills.map(
        ({ key, show, clearKeys }) =>
          show && (
            <FilterPill
              key={key}
              label={getPillLabel(key)}
              hasValue={isPillActive(key)}
              isExpanded={activePill === key}
              onPress={() => onPillPress(key)}
              onClear={() => clearKeys.forEach((k) => onClearFilter(k))}
              colors={colors}
            />
          )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    height: ISLAND_CONFIG.PILLS_ROW_HEIGHT,
    maxHeight: ISLAND_CONFIG.PILLS_ROW_HEIGHT,
  },
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
    height: ISLAND_CONFIG.PILLS_ROW_HEIGHT,
  },
});
