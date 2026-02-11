/**
 * Settings Header Component
 * Simple title header
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
  topInset, 
}: SettingsHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: topInset + Layout.headerPadding }]}>
      <Heading size="large">Settings</Heading>
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
