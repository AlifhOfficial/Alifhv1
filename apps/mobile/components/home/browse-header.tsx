/**
 * Browse Header - Custom header for Browse screen
 * Revvup Design System + Inter font
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Heading } from '@/components/ui';

interface BrowseHeaderProps {
  onSettingsPress?: () => void;
}

export function BrowseHeader({ onSettingsPress }: BrowseHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Title */}
      <Heading size="large">Browse</Heading>

      {/* Right: Settings */}
      <Pressable
        style={[
          styles.settingsButton,
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onSettingsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {({ pressed }) => (
          <Settings2 
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
  settingsButton: {
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
