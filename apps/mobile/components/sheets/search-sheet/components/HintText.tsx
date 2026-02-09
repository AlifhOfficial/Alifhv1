/**
 * HintText - Centered hint text
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface HintTextProps extends ThemedComponentProps {
  text: string;
}

export function HintText({ text, colors }: HintTextProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.textTertiary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  text: {
    ...Typography.link,
  },
});
