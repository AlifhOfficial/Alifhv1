/**
 * Home Header - Custom header with profile menu
 * Revvup Design System + Inter font
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ProfileMenu } from './profile-menu';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Heading, Body } from '@/components/ui';
import { fetchUnreadCount } from '@/lib/notifications-api';

export function HomeHeader() {
  const { colorScheme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread count every 30s when authenticated
  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  const handleToggleTheme = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const handleNotificationPress = () => {
    router.push('/notifications' as any);
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Left: Title */}
      <Heading size="large">Home</Heading>

      {/* Right: Theme Toggle + Notifications + Profile Menu */}
      <View style={styles.actions}>
        <HapticPressable
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
        </HapticPressable>
        <HapticPressable
          style={[
            styles.iconButton,
            { 
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }
          ]}
          onPress={handleNotificationPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {({ pressed }) => (
            <View>
              <Bell 
                size={20} 
                color={colors.icon}
                strokeWidth={2}
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Body size="small" style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Body>
                </View>
              )}
            </View>
          )}
        </HapticPressable>
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
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    lineHeight: 12,
  },
});
