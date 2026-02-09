/**
 * Browse Header - Custom header for Browse screen
 * Revvup Design System + Inter font
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SlidersHorizontal } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Typography, Colors, Spacing, Radius } from '@/constants/theme';

interface BrowseHeaderProps {
  onFiltersPress?: () => void;
}

export function BrowseHeader({ onFiltersPress }: BrowseHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        Browse
      </Text>

      {/* Right: Filters Button */}
      <Pressable
        style={[
          styles.filterButton,
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onFiltersPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {({ pressed }) => (
          <SlidersHorizontal 
            size={20} 
            color={colors.icon} 
            strokeWidth={2}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.title,
  },
  filterButton: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
