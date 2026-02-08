import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  onClear?: () => void;
  showClear?: boolean;
}

export function SectionHeader({ title, onClear, showClear = false }: SectionHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
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
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
