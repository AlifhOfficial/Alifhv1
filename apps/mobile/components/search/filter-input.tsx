import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';
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
      backgroundColor: colors.fillSecondary, 
      borderColor: colors.border 
    }]}>
      <Ionicons name="search" size={18} color={colors.textTertiary} />
      <BottomSheetTextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <Ionicons 
          name="close-circle" 
          size={18} 
          color={colors.textTertiary}
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
    paddingHorizontal: 14,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    ...Typography.buttonMedium,
    padding: 0,
  },
});
