/**
 * Settings Header Component
 * Title header matching HomeHeader icon styling
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Spacing, Layout } from '@/constants/theme';
import type { ThemeColors } from './types';

interface SettingsHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function SettingsHeader({
  colors,
  topInset,
}: SettingsHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: topInset + Layout.headerPadding }]}>
      <Heading size="medium">Settings</Heading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },
});
