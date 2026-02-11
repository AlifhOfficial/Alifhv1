import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';

import { Data } from '@/components/ui';

interface SectionHeaderProps {
  title: string;
  onClear?: () => void;
  showClear?: boolean;
}

export function SectionHeader({ title, onClear, showClear = false }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Data size="mini" tone="secondary">{title}</Data>
      {showClear && onClear && (
        <HapticPressable onPress={onClear} hitSlop={8}>
          <Data size="mini" tone="primary">Clear</Data>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 16,
  },
});
