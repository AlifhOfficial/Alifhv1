/**
 * SectionHeader - Section header with optional count and clear button
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Data } from '@/components/ui';
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
      <Data size="mini" tone="secondary">
        {title}
        {count !== undefined && count > 0 && (
          <Data size="mini" tone="muted"> ({count})</Data>
        )}
      </Data>
      {onClear && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Data size="mini" tone="primary" style={styles.clearLink}>
            {clearLabel}
          </Data>
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
  clearLink: {
    fontFamily: 'Inter_600SemiBold',
  },
});
