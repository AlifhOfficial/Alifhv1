/**
 * SearchBar Component
 * 
 * Clean search input with icon and clear button.
 * Part of the Dynamic Island system.
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, Typography } from '@/constants/theme';
import type { SearchBarProps } from './types';

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  isExpanded,
  onPress,
  colors,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name="search"
        size={18}
        color={colors.textTertiary}
      />
      
      {isExpanded ? (
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="Search cars..."
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
      ) : (
        <Text
          style={[styles.placeholder, { color: value ? colors.text : colors.textSecondary }]}
          numberOfLines={1}
        >
          {value || 'Search cars...'}
        </Text>
      )}

      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  placeholder: {
    flex: 1,
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
  },
  clearButton: {
    padding: Spacing.xs,
  },
});
