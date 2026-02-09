import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

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
        <Pressable onPress={onClear} hitSlop={8}>
          <Data size="mini" tone="primary">Clear</Data>
        </Pressable>
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
