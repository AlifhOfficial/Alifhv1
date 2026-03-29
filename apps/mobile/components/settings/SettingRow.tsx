/**
 * Setting Row Component
 * A single setting item with title, description, and action - matches Profile EditableField styling
 */

import { Text } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ThemeColors } from './types';

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  colors: ThemeColors;
  isLast?: boolean;
}

export function SettingRow({
  title,
  description,
  children,
  colors,
  isLast,
}: SettingRowProps) {
  return (
    <View
      style={[
        styles.container,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.content}>
        <Text variant="bodySm" tone="muted">{title}</Text>
        {description && (
          <Text variant="body">{description}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  },
});
