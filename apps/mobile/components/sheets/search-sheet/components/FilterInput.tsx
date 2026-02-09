/**
 * FilterInput - Filter input for lists
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface FilterInputProps extends ThemedComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function FilterInput({
  value,
  onChangeText,
  placeholder = 'Filter...',
  colors,
}: FilterInputProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.fillSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name="search" size={16} color={colors.textTertiary} />
      <BottomSheetTextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.value,
    paddingVertical: 0,
  },
});
