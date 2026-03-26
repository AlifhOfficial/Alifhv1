/**
 * Tab Layout - Revvup Mobile App
 * 3 tabs: Home, Messages, Browse
 * Minimal flat tab bar — icons only, no labels.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MessageCircle, LayoutGrid } from 'lucide-react-native';
import { HapticPressable } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing } from '@/constants/theme';
import { ProfileMenu } from '@/components/home/profile-menu';

const TAB_CONFIG = [
  { name: '(home)', icon: Home, label: 'Home' },
  { name: '(messages)', icon: MessageCircle, label: 'Chats' },
  { name: '(browse)', icon: LayoutGrid, label: 'Browse' },
] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { backgroundColor: colors.bg, paddingBottom: insets.bottom, borderTopColor: colors.border }]}>
      {TAB_CONFIG.map((tab, index) => {
        const focused = state.index === index;
        const Icon = tab.icon;
        return (
          <HapticPressable
            key={tab.name}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[index].key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate(state.routes[index].name);
              }
            }}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
          >
            <Icon
              size={Sizes.iconLg}
              color={focused ? colors.text : colors.iconMuted}
              strokeWidth={focused ? 3 : 2}
              fill={focused ? colors.text : colors.iconMuted}
            />
          </HapticPressable>
        );
      })}
      <View style={styles.profileTab}>
        <ProfileMenu />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(messages)" />
      <Tabs.Screen name="(browse)" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  profileTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
});
