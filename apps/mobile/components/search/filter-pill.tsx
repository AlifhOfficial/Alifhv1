import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

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
    <HapticPressable 
      style={[
        styles.container,
        { 
          backgroundColor: isPrimary ? colors.primary : colors.backgroundSecondary,
          borderColor: isPrimary ? colors.primary : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text 
        variant="subhead" 
        style={{ color: isPrimary ? colors.primaryForeground : colors.label }}
      >
        {label}
      </Text>
      {showRemove && (
        <Ionicons 
          name="close" 
          size={Sizes.iconXs} 
          color={isPrimary ? colors.primaryForeground : colors.labelSecondary} 
        />
      )}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Sizes.badgePaddingH,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.xs,
  },
});
