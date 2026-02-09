/**
 * EmptyState - Empty state with title and subtitle
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Radius } from '@/constants/theme';
import { Heading, Body } from '@/components/ui';
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
      <Heading size="small" style={styles.title}>{title}</Heading>
      {subtitle && (
        <Body size="small" tone="secondary" style={styles.subtitle}>
          {subtitle}
        </Body>
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
});
