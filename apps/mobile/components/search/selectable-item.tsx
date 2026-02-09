import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
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
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        )}
        <Text style={[
          styles.label, 
          { color: colors.text },
          isSelected && { fontWeight: '600' }
        ]}>
          {label}
        </Text>
      </View>
      
      <View style={styles.rightContent}>
        {count !== undefined && count > 0 && (
          <Text style={[styles.count, { color: colors.textTertiary }]}>
            {count.toLocaleString()}
          </Text>
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontSize: 14,
  },
});
