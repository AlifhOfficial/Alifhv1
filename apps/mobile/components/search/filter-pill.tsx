import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data } from '@/components/ui';

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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const isPrimary = variant === 'primary' || isSelected;

  return (
    <Pressable 
      style={[
        styles.container,
        { 
          backgroundColor: isPrimary ? colors.primary : colors.backgroundTertiary,
          borderColor: isPrimary ? colors.primary : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Data 
        size="small" 
        style={{ color: isPrimary ? colors.primaryForeground : colors.text }}
      >
        {label}
      </Data>
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
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 6,
  },
});
