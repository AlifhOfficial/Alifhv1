/**
 * Notifications Header Component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCheck, Trash2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Heading, Body } from '@/components/ui';

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
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          <Heading size="large">Notifications</Heading>
          {unreadCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Body size="small" style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Body>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {unreadCount > 0 && (
            <HapticPressable
              onPress={onMarkAllRead}
              style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {({ pressed }) => (
                <CheckCheck size={18} color={colors.primary} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
              )}
            </HapticPressable>
          )}
          <HapticPressable
            onPress={onClearAll}
            style={[styles.actionButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {({ pressed }) => (
              <Trash2 size={18} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
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
    gap: 8,
    marginLeft: 12,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    minWidth: 22,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
