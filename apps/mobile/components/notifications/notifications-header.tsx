/**
 * Notifications Header Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCheck, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { Heading, Body, Supporting } from '@/components/ui';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationsHeader({ unreadCount, onMarkAllRead, onClearAll }: NotificationsHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          <Heading size="large">Notifications</Heading>
          {unreadCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Supporting size="small" style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Supporting>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {unreadCount > 0 && (
            <HapticPressable
              onPress={onMarkAllRead}
              style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              hitSlop={Layout.hitSlop}
            >
              {({ pressed }) => (
                <CheckCheck size={Sizes.iconSm} color={colors.primary} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
              )}
            </HapticPressable>
          )}
          <HapticPressable
            onPress={onClearAll}
            style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <Trash2 size={Sizes.iconSm} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
            )}
          </HapticPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  countBadge: {
    paddingHorizontal: Sizes.badgePaddingH,
    paddingVertical: Sizes.badgePaddingV,
    borderRadius: Radius.full,
    minWidth: Sizes.iconLg,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    width: Sizes.actionButtonMd,
    height: Sizes.actionButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
