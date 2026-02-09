import React from 'react';
import { Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface FilterPillProps {
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  showRemove?: boolean;
  variant?: 'default' | 'primary';
}

export function FilterPill({ 
  label, 
  isSelected = false, 
  onPress, 
  showRemove = false,
  variant = 'default'
}: FilterPillProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isPrimary = variant === 'primary' || isSelected;

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: isPrimary ? colors.primary : colors.backgroundTertiary,
          borderColor: isPrimary ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.label, 
        { color: isPrimary ? colors.primaryForeground : colors.text }
      ]}>
        {label}
      </Text>
      {showRemove && (
        <Ionicons 
          name="close" 
          size={14} 
          color={isPrimary ? colors.primaryForeground : colors.textSecondary} 
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
