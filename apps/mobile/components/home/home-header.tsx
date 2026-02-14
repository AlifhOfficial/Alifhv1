/**
 * Home Header - Profile, Notifications, Saved & Inventory
 * Revvup Design System + Inter font
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sun, Moon, Bookmark, Package, CalendarDays } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ProfileMenu } from './profile-menu';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Colors, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
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

  const handleBookingsPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!isAuthenticated) {
      openAuthFlow();
      return;
    }
    router.push('/bookings');
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      {/* Left: Profile + Notifications + Saved + Inventory + Bookings (Scrollable) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.leftGroup}
        style={styles.scrollView}
      >
        <ProfileMenu />
        <View
          style={[
            styles.iconButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable
            style={styles.iconButtonInner}
            onPress={handleNotificationPress}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <View>
                <Bell 
                  size={Sizes.iconSm} 
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
        </View>
        <View
          style={[
            styles.pillButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable
            style={styles.pillButtonInner}
            onPress={handleSavedPress}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <View style={styles.pillContent}>
                <Bookmark size={Sizes.iconXs} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
                <Data size="small" style={{ opacity: pressed ? 0.7 : 1 }}>
                  Saved
                </Data>
              </View>
            )}
          </HapticPressable>
        </View>
        <View
          style={[
            styles.pillButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable
            style={styles.pillButtonInner}
            onPress={handleInventoryPress}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <View style={styles.pillContent}>
                <Package size={Sizes.iconXs} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
                <Data size="small" style={{ opacity: pressed ? 0.7 : 1 }}>
                  Inventory
                </Data>
              </View>
            )}
          </HapticPressable>
        </View>
        <View
          style={[
            styles.pillButton,
            styles.glass,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            },
          ]}
        >
          <HapticPressable
            style={styles.pillButtonInner}
            onPress={handleBookingsPress}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <View style={styles.pillContent}>
                <CalendarDays size={Sizes.iconXs} color={colors.icon} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
                <Data size="small" style={{ opacity: pressed ? 0.7 : 1 }}>
                  Bookings
                </Data>
              </View>
            )}
          </HapticPressable>
        </View>
        <View
          style={[
            styles.iconButton,
            styles.glass,
            { 
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassBackground,
            }
          ]}
        >
          <HapticPressable
            style={styles.iconButtonInner}
            onPress={handleToggleTheme}
            hitSlop={Layout.hitSlop}
          >
            {({ pressed }) => (
              <ThemeIcon 
                size={Sizes.iconSm} 
                color={colors.icon}
                strokeWidth={2}
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </HapticPressable>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.headerGap,
  },
  glass: {
    borderWidth: 1,
  },
  iconButton: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButton: {
    height: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    borderRadius: Sizes.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillButtonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -Spacing.xs,
    right: -Spacing.xs,
    minWidth: Spacing.md,
    height: Spacing.md,
    borderRadius: Spacing.md / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs / 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    lineHeight: 10,
  },
});
