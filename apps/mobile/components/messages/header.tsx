/**
 * Messages Header - Mobile Native
 * Matches ProfileHeader style for consistency
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface MessagesHeaderProps {
  unreadCount?: number;
}

export function MessagesHeader({ unreadCount = 0 }: MessagesHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.navTitle.fontSize,
    lineHeight: Typography.navTitle.lineHeight,
    fontWeight: Typography.navTitle.fontWeight,
    letterSpacing: Typography.navTitle.letterSpacing,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.lg,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.caption1.fontSize,
    lineHeight: Typography.caption1.lineHeight,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
