/**
 * SelectedPills - Display selected items as removable pills
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '@/constants/theme';
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
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Selected ({items.length})
        </Text>
        {items.length > 1 && (
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text style={[styles.clearLink, { color: colors.primary }]}>
              Clear all
            </Text>
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
            <Text style={[styles.pillText, { color: colors.primaryForeground }]}>
              {getLabel(item)}
            </Text>
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
  label: {
    ...Typography.dataMini,
  },
  clearLink: {
    ...Typography.dataMini,
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
  pillText: {
    ...Typography.link,
  },
});
