import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface SectionHeaderProps {
  title: string;
  onClear?: () => void;
  showClear?: boolean;
}

export function SectionHeader({ title, onClear, showClear = false }: SectionHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        {title}
      </Text>
      {showClear && onClear && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={[styles.clearText, { color: colors.primary }]}>
            Clear
          </Text>
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
  title: {
    ...Typography.dataMini,
  },
  clearText: {
    ...Typography.dataMini,
  },
});
