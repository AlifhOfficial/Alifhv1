/**
 * SearchDropdown Component
 * 
 * Shows search suggestions - clean and minimal.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Spacing, Typography, Radius } from '@/constants/theme';
import { formatSuggestionType } from '../utils';
import type { SearchDropdownProps } from '../types';

export function SearchDropdown({
  suggestions,
  loading,
  searchValue,
  onSuggestionPress,
  colors,
}: SearchDropdownProps) {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {searchValue.length < 2 ? 'Start typing to search...' : 'No results found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.list}
    >
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={`${suggestion.type}-${suggestion.text}-${index}`}
          style={styles.item}
          onPress={() => onSuggestionPress(suggestion)}
          activeOpacity={0.6}
        >
          <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
            {suggestion.text}
          </Text>
          <View style={styles.right}>
            <Text style={[styles.type, { color: colors.textTertiary }]}>
              {formatSuggestionType(suggestion.type)}
            </Text>
            {suggestion.count !== undefined && (
              <Text style={[styles.count, { color: colors.textTertiary }]}>
                {suggestion.count}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  list: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  text: {
    ...Typography.body,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  type: {
    ...Typography.footnote,
    fontFamily: 'Inter_400Regular',
  },
  count: {
    ...Typography.caption1,
    fontFamily: 'Inter_500Medium',
  },
});
