import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';

import { Layout, Spacing } from '@/constants/theme';
import { Data } from '@/components/ui';
import { FilterPill } from './filter-pill';

interface SelectedPillsProps {
  items: string[];
  onRemove: (item: string) => void;
  onClearAll?: () => void;
  label?: string;
}

export function SelectedPills({ items, onRemove, onClearAll, label }: SelectedPillsProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Data size="bodySm" tone="secondary">{label}</Data>
          {onClearAll && items.length > 1 && (
            <HapticPressable onPress={onClearAll} hitSlop={Layout.hitSlopSmall}>
              <Data size="bodySm" tone="primary">Clear all</Data>
            </HapticPressable>
          )}
        </View>
      )}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <FilterPill
            key={item}
            label={item}
            onPress={() => onRemove(item)}
            showRemove
            variant="primary"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
});
