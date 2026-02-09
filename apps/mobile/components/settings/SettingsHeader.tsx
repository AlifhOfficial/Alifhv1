/**
 * Settings Header Component
 * Simple title header
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Heading } from '@/components/ui';
import type { ThemeColors } from './types';

interface SettingsHeaderProps {
  colors: ThemeColors;
  topInset: number;
}

export function SettingsHeader({ 
  topInset, 
}: SettingsHeaderProps) {
  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
      <Heading size="large">Settings</Heading>
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
});
