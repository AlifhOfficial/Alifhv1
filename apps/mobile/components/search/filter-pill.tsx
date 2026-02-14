import React from 'react';
import { StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
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
    <HapticPressable 
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
          size={Sizes.iconXs} 
          color={isPrimary ? colors.primaryForeground : colors.textSecondary} 
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
