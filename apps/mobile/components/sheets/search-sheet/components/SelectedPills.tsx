/**
 * SelectedPills - Display selected items as removable pills
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/constants/theme';
import { Data, Body } from '@/components/ui';
import type { FacetBucket, ThemedComponentProps } from '../types';

interface SelectedPillsProps extends ThemedComponentProps {
  items: string[];
  facetData?: FacetBucket[];
  onRemove: (value: string) => void;
  onClearAll: () => void;
}

export function SelectedPills({
  items,
  facetData,
  onRemove,
  onClearAll,
  colors,
}: SelectedPillsProps) {
  if (items.length === 0) return null;

  const getLabel = (value: string): string => {
    const data = facetData?.find((f) => f.value === value);
    return data?.label || value;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Data size="mini" tone="secondary">
          Selected ({items.length})
        </Data>
        {items.length > 1 && (
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Data size="mini" tone="primary" style={styles.clearLink}>
              Clear all
            </Data>
          </Pressable>
        )}
      </View>
      <View style={styles.pillsRow}>
        {items.map((item) => (
          <Pressable
            key={item}
            style={[styles.pill, { backgroundColor: colors.primary }]}
            onPress={() => onRemove(item)}
          >
            <Body size="small" style={{ color: colors.primaryForeground }}>
              {getLabel(item)}
            </Body>
            <Ionicons name="close" size={14} color={colors.primaryForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  label: {},
  clearLink: {
    fontFamily: 'Inter_600SemiBold',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    gap: Spacing.xs,
  },
  pillText: {},
});
