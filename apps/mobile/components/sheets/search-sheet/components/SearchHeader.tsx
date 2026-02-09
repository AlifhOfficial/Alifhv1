/**
 * SearchHeader - Sheet header with title and cancel button
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Typography, Spacing } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface SearchHeaderProps extends ThemedComponentProps {
  title: string;
  onCancel: () => void;
}

export function SearchHeader({ title, onCancel, colors }: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Pressable onPress={onCancel} hitSlop={12}>
        <Text style={[styles.cancelBtn, { color: colors.primary }]}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title,
  },
  cancelBtn: {
    ...Typography.button,
  },
});
