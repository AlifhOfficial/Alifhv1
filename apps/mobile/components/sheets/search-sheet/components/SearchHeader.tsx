/**
 * SearchHeader - Sheet header with title and cancel button
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Heading, ButtonText } from '@/components/ui';
import type { ThemedComponentProps } from '../types';

interface SearchHeaderProps extends ThemedComponentProps {
  title: string;
  onCancel: () => void;
}

export function SearchHeader({ title, onCancel, colors }: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      <Heading size="large">{title}</Heading>
      <Pressable onPress={onCancel} hitSlop={12}>
        <ButtonText size="medium" tone="primary">Cancel</ButtonText>
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
});
