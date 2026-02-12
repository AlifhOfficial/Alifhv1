/**
 * Home Header - Profile, Notifications, Saved & Inventory
 * Revvup Design System + Inter font
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sun, Moon, Bookmark, Package } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ProfileMenu } from './profile-menu';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { Body, Data } from '@/components/ui';
import { fetchUnreadCount } from '@/lib/notifications-api';

export function HomeHeader() {
  const { colorScheme, toggleTheme } = useTheme();
  const { isAuthenticated, openAuthFlow } = useAuth();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count once when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [isAuthenticated]);

  const handleToggleTheme = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const handleNotificationPress = () => {
    router.push('/notifications' as any);
  };

  const handleSavedPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/saved');
  };

  const handleInventoryPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!isAuthenticated) {
      openAuthFlow();
      return;
    }
    router.push('/inventory');
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      {/* Left: Profile + Notifications + Saved + Inventory */}
      <View style={styles.leftGroup}>
        <ProfileMenu />
        <HapticPressable
          style={[
            styles.iconButton,
            { 
              borderColor: colors.border,
              backgroundColor: colors.background,
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
        <HapticPressable
          style={[
            styles.pillButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          onPress={handleSavedPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {({ pressed }) => (
            <View style={styles.pillContent}>
              <Bookmark size={16} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
              <Data size="small" tone="secondary" style={{ opacity: pressed ? 0.7 : 1 }}>
                Saved
              </Data>
            </View>
          )}
        </HapticPressable>
        <HapticPressable
          style={[
            styles.pillButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          onPress={handleInventoryPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {({ pressed }) => (
            <View style={styles.pillContent}>
              <Package size={16} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
              <Data size="small" tone="secondary" style={{ opacity: pressed ? 0.7 : 1 }}>
                Inventory
              </Data>
            </View>
          )}
        </HapticPressable>
      </View>

      {/* Right: Theme Toggle */}
      <HapticPressable
        style={[
          styles.iconButton,
          { 
            borderColor: colors.border,
            backgroundColor: colors.background,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
    flex: 1,
  },
  iconButton: {
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
