/**
 * Setting Row Component
 * A single setting item with title, description, and action - matches Profile EditableField styling
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Supporting, Body } from '@/components/ui';
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
        <Supporting size="medium" tone="muted">{title}</Supporting>
        {description && (
          <Body size="large">{description}</Body>
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
});
