/**
 * Tab Layout - Revvup Mobile App
 * 3 tabs: Home, Messages, Browse
 * Floating pill tab bar — icons only, active pill highlight.
 */

import { HapticPressable } from '@/components/ui';
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router/tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, LayoutGrid, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Shadows, Sizes, Spacing, Radius, ZIndex } from '@/constants/theme';

const TAB_CONFIG = [
  { name: '(home)', icon: Home, label: 'Home' },
  { name: '(messages)', icon: MessageCircle, label: 'Chats' },
  { name: '(browse)', icon: LayoutGrid, label: 'Browse' },
] as const;

const PILL_PADDING = Spacing.xs;
const TAB_HEIGHT = Sizes.actionButtonLg;
const TAB_WIDTH = Sizes.actionButtonLg + Spacing.md;
const DOUBLE_TAP_MS = 320;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const { triggerScrollToTop } = useSearch();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const lastPressRef = useRef<{ name: string; time: number }>({ name: '', time: 0 });

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.md) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.barRow}>
        <View
          style={[
            styles.pill,
            styles.shell,
            {
              backgroundColor: colors.background,
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
                  const now = Date.now();
                  const isDoubleTap =
                    focused &&
                    tab.name === '(browse)' &&
                    lastPressRef.current.name === tab.name &&
                    now - lastPressRef.current.time <= DOUBLE_TAP_MS;

                  lastPressRef.current = { name: tab.name, time: now };

                  if (isDoubleTap) {
                    triggerScrollToTop();
                    return;
                  }

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
                    backgroundColor: colorScheme === 'light' ? colors.background : colors.fill,
                    borderRadius: Radius.full,
                    borderWidth: colorScheme === 'light' ? StyleSheet.hairlineWidth : 0,
                    borderColor: colorScheme === 'light' ? colors.border : 'transparent',
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
    zIndex: ZIndex.overlay + 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shell: {
    borderWidth: 1,
    ...Shadows.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    padding: PILL_PADDING,
    gap: PILL_PADDING,
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
