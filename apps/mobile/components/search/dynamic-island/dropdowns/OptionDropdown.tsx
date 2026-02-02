/**
 * OptionDropdown Component
 * 
 * Searchable multi-select list of options (Make, Model, Location).
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Spacing, Radius, Typography } from '@/constants/theme';
import type { OptionDropdownProps } from '../types';

export function OptionDropdown({
  options,
  selectedValues = [],
  onToggle,
  onClear,
  searchPlaceholder,
  emptyMessage,
  colors,
}: OptionDropdownProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? options.filter((o) => o.value.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleToggle = useCallback((value: string) => {
    if (selectedValues.includes(value)) {
      // Remove
      onToggle(selectedValues.filter(v => v !== value));
    } else {
      // Add
      onToggle([...selectedValues, value]);
    }
  }, [selectedValues, onToggle]);

  const hasSelection = selectedValues.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Options List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {/* Clear Selection */}
        {hasSelection && (
          <TouchableOpacity
            style={[styles.item, styles.clearItem, { backgroundColor: colors.errorMuted }]}
            onPress={onClear}
          >
            <Text style={[styles.clearText, { color: colors.error }]}>
              Clear {selectedValues.length} selected
            </Text>
          </TouchableOpacity>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {emptyMessage || 'No options found'}
            </Text>
          </View>
        )}

        {/* Options */}
        {filtered.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={styles.item}
              onPress={() => handleToggle(option.value)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.itemText,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {option.value}
              </Text>
              {option.count > 0 && (
                <Text style={[styles.itemCount, { color: colors.textTertiary }]}>
                  {option.count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 280,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  clearItem: {
    marginBottom: Spacing.sm,
  },
  clearText: {
    ...Typography.subhead,
    fontFamily: 'Inter_500Medium',
  },
  itemText: {
    ...Typography.body,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  itemCount: {
    ...Typography.caption1,
    fontFamily: 'Inter_500Medium',
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
