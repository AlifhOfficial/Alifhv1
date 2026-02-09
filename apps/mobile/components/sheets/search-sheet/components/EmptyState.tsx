/**
 * EmptyState - Empty state with title and subtitle
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface EmptyStateProps extends ThemedComponentProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle, colors }: EmptyStateProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
    paddingHorizontal: Spacing['2xl'],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  title: {
    ...Typography.headingSmall,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});
