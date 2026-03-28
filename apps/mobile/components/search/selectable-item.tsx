import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Data } from '@/components/ui';

interface SelectableItemProps {
  label: string;
  count?: number;
  isSelected: boolean;
  onPress: () => void;
  showCheckbox?: boolean;
  showChevron?: boolean;
}

export function SelectableItem({ 
  label, 
  count, 
  isSelected, 
  onPress, 
  showCheckbox = true,
  showChevron = false 
}: SelectableItemProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <HapticPressable 
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: pressed ? colors.bg2 : 'transparent',
          borderBottomColor: colors.border,
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        {showCheckbox && (
          <View style={[
            styles.checkbox,
            { 
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : 'transparent',
            }
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={Sizes.iconXs} color={colors.primaryFg} />
            )}
          </View>
        )}
        <Body 
          size="body" 
          style={isSelected ? styles.labelSelected : undefined}
        >
          {label}
        </Body>
      </View>
      
      <View style={styles.rightContent}>
        {count !== undefined && count > 0 && (
          <Data size="bodySm" tone="muted">{count.toLocaleString()}</Data>
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={Sizes.iconSm} color={colors.text3} />
        )}
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Sizes.badgePaddingH,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.badgePaddingH,
    flex: 1,
  },
  checkbox: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelSelected: {
    fontWeight: Fonts.semiBold,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
