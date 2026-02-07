/**
 * Setting Row Component
 * A single setting item with title, description, and action - matches Profile EditableField styling
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Typography } from '@/constants/theme';
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
        <Text style={[styles.label, { color: colors.textTertiary }]}>{title}</Text>
        {description && (
          <Text style={[styles.value, { color: colors.text }]}>
            {description}
          </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  label: {
    fontSize: Typography.caption1.fontSize,
    lineHeight: Typography.caption1.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.caption1.letterSpacing,
  },
  value: {
    fontSize: Typography.callout.fontSize,
    lineHeight: Typography.callout.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.callout.fontWeight as any,
    letterSpacing: Typography.callout.letterSpacing,
  },
});
