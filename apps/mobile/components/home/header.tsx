/**
 * Home Header - Custom header with profile menu
 * Revvup Design System + Inter font
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

import { ProfileMenu } from './profile-menu';
import { useTheme } from '@/context/theme-context';
import { Typography, Colors } from '@/constants/theme';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
}

export function HomeHeader({ onNotificationPress }: HomeHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        Home
      </Text>

      {/* Right: Notifications + Profile Menu */}
      <View style={styles.actions}>
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
              color="#8E8E93" 
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Typography.navTitle.fontSize,
    lineHeight: Typography.navTitle.lineHeight,
    fontFamily: 'Inter_700Bold',
    fontWeight: Typography.navTitle.fontWeight as any,
    letterSpacing: Typography.navTitle.letterSpacing,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
