/**
 * TabBarContainer - Shared positioning/safe-area wrapper for all tab bars
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layout, Spacing } from '@/constants/theme';

interface TabBarContainerProps {
  children: React.ReactNode;
}

export function TabBarContainer({ children }: TabBarContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <View style={styles.navGroup}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Layout.headerPadding,
    paddingBottom: Spacing.md,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
