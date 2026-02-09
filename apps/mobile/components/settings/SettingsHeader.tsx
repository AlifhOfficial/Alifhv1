/**
 * Settings Header Component
 * Simple title header
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Typography } from '@/constants/theme';
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
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    ...Typography.title,
  },
});
