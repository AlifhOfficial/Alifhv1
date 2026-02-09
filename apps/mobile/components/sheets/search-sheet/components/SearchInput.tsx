/**
 * SearchInput - Main search input with clear button
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface SearchInputProps extends ThemedComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  onFocus?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  onSubmitEditing,
  onFocus,
  placeholder = 'Search make, model, or keyword...',
  colors,
}: SearchInputProps) {
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
      <Ionicons name="search" size={18} color={colors.textTertiary} />
      <BottomSheetTextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          style={[styles.clearBtn, { backgroundColor: colors.fillSecondary }]}
        >
          <Ionicons name="close" size={12} color={colors.text} />
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
    height: 48,
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.button,
    paddingVertical: 0,
  },
  clearBtn: {
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
