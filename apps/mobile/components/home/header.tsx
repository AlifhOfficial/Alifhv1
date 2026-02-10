/**
 * Home Header - Custom header with profile menu
 * Revvup Design System + Inter font
 */

import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { ProfileMenu } from './profile-menu';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Heading } from '@/components/ui';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
}

export function HomeHeader({ onNotificationPress }: HomeHeaderProps) {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const handleToggleTheme = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Title */}
      <Heading size="large">Home</Heading>

      {/* Right: Theme Toggle + Notifications + Profile Menu */}
      <View style={styles.actions}>
        <Pressable
          style={[
            styles.iconButton,
            { 
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }
          ]}
          onPress={handleToggleTheme}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {({ pressed }) => (
            <ThemeIcon 
              size={20} 
              color={colors.icon}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Pressable
          style={[
            styles.iconButton,
            { 
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }
          ]}
          onPress={onNotificationPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {({ pressed }) => (
            <Bell 
              size={20} 
              color={colors.icon}
              strokeWidth={2}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <ProfileMenu />
      </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
