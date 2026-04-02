import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Sizes, Spacing, InputTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface FilterInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function FilterInput({ 
  value, 
  onChangeText, 
  placeholder = 'Search...', 
  autoFocus = false 
}: FilterInputProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.fill2, 
      borderColor: colors.border 
    }]}>
      <Ionicons name="search" size={Sizes.iconSm} color={colors.labelTertiary} />
      <TextInput
        style={[styles.input, { color: colors.label }]}
        placeholder={placeholder}
        placeholderTextColor={colors.labelTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <Ionicons 
          name="close-circle" 
          size={Sizes.iconSm} 
          color={colors.labelTertiary}
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    padding: Spacing.none,
    ...InputTypography,
  },
});
