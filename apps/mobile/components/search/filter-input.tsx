import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
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
      <BottomSheetTextInput
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
    padding: 0,
  },
});
