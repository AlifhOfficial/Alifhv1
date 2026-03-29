import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Layout, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  onClear?: () => void;
  showClear?: boolean;
}

export function SectionHeader({ title, onClear, showClear = false }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodySm" tone="secondary">{title}</Text>
      {showClear && onClear && (
        <HapticPressable onPress={onClear} hitSlop={Layout.hitSlopSmall}>
          <Text variant="bodySm" tone="primary">Clear</Text>
        </HapticPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
  },
});
