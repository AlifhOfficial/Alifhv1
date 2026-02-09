/**
 * LoadingState - Centered loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface LoadingStateProps extends ThemedComponentProps {}

export function LoadingState({ colors }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
});
