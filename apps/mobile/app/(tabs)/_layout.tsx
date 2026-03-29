/**
 * Tab Layout - Revvup Mobile App
 * 3 tabs: Home, Messages, Browse
 * Floating pill tab bar — icons only, active pill highlight.
 */

import { HapticPressable } from '@/components/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MessageCircle, LayoutGrid } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing, Radius } from '@/constants/theme';

const TAB_CONFIG = [
  { name: '(home)', icon: Home, label: 'Home' },
  { name: '(messages)', icon: MessageCircle, label: 'Chats' },
  { name: '(browse)', icon: LayoutGrid, label: 'Browse' },
] as const;

const PILL_PADDING = 4;
const TAB_HEIGHT = 44;
const TAB_WIDTH = 52;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.md) },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.background + 'CC',
            borderColor: colors.border,
            shadowColor: colors.black,
          },
        ]}
      >
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
              style={[
                styles.tabBtn,
                focused && {
                  backgroundColor: colors.fill,
                  borderRadius: Radius.full,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
            >
              <Icon
                size={Sizes.iconMd}
                color={focused ? colors.label : colors.labelSecondary}
                strokeWidth={3.2}
                fill={tab.name === '(home)' || focused ? (focused ? colors.label : colors.labelSecondary) : 'transparent'}
              />
            </HapticPressable>
          );
        })}
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
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    padding: PILL_PADDING,
    gap: PILL_PADDING,
    // iOS shadow
    shadowOffset: { width: 0, height: Spacing.sm },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    // Android elevation
    elevation: 12,
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
