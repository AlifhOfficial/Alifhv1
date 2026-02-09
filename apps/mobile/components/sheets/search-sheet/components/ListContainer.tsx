/**
 * ListContainer - Container for list items with rounded corners
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Radius } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface ListContainerProps extends ThemedComponentProps {
  children: React.ReactNode;
}

export function ListContainer({ children, colors }: ListContainerProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
