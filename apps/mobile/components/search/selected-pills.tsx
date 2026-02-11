import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';

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
          <Data size="mini" tone="secondary">{label}</Data>
          {onClearAll && items.length > 1 && (
            <HapticPressable onPress={onClearAll} hitSlop={8}>
              <Data size="mini" tone="primary">Clear all</Data>
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
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
});
