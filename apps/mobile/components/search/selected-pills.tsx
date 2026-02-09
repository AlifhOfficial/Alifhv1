import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { FilterPill } from './filter-pill';

interface SelectedPillsProps {
  items: string[];
  onRemove: (item: string) => void;
  onClearAll?: () => void;
  label?: string;
}

export function SelectedPills({ items, onRemove, onClearAll, label }: SelectedPillsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
          {onClearAll && items.length > 1 && (
            <Pressable onPress={onClearAll} hitSlop={8}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear all
              </Text>
            </Pressable>
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
  label: {
    ...Typography.valueSmall,
  },
  clearText: {
    ...Typography.valueSmall,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
});
