/**
 * SectionHeader - Section header with optional count and clear button
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Typography, Spacing } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface SectionHeaderProps extends ThemedComponentProps {
  title: string;
  count?: number;
  onClear?: () => void;
  clearLabel?: string;
}

export function SectionHeader({
  title,
  count,
  onClear,
  clearLabel = 'Clear',
  colors,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title}
        {count !== undefined && count > 0 && (
          <Text style={{ color: colors.textTertiary }}> ({count})</Text>
        )}
      </Text>
      {onClear && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={[styles.clearLink, { color: colors.primary }]}>
            {clearLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    ...Typography.valueSmall,
  },
  clearLink: {
    ...Typography.valueSmall,
    fontFamily: 'Inter_600SemiBold',
  },
});
