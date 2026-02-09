/**
 * HintText - Centered hint text
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Body } from '@/components/ui';
import type { ThemedComponentProps } from '../types';

interface HintTextProps extends ThemedComponentProps {
  text: string;
}

export function HintText({ text, colors }: HintTextProps) {
  return (
    <View style={styles.container}>
      <Body size="small" tone="muted">{text}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
});
