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
import { ArrowUpDown, Home, LayoutGrid, Menu, MessageCircle } from 'lucide-react-native';
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

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const { getActiveFilterCount, sortBy, triggerBrowseDrawer, triggerBrowseSort } = useSearch();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const isBrowseTabActive = state.routes[state.index]?.name === '(browse)';
  const activeFilterCount = getActiveFilterCount();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.md) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.barRow}>
        {isBrowseTabActive ? (
          <HapticPressable
            onPress={triggerBrowseDrawer}
            style={[
              styles.sideBtn,
              styles.shell,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.black,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open browse drawer"
          >
            <Menu size={Sizes.iconMd} color={colors.label} strokeWidth={2.8} />
            {activeFilterCount > 0 ? (
              <View style={[styles.statusDot, { backgroundColor: colors.labelQuaternary, borderColor: colors.surface }]} />
            ) : null}
          </HapticPressable>
        ) : (
          <View style={styles.sidePlaceholder} />
        )}

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

        {isBrowseTabActive ? (
          <HapticPressable
            onPress={triggerBrowseSort}
            style={[
              styles.sideBtn,
              styles.shell,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.black,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open browse sort"
          >
            <View style={styles.sideIconWrap}>
              <ArrowUpDown size={Sizes.iconMd} color={colors.label} strokeWidth={2.8} />
              {sortBy !== 'relevance' ? (
                <View style={[styles.statusDot, { backgroundColor: colors.labelQuaternary, borderColor: colors.surface }]} />
              ) : null}
            </View>
          </HapticPressable>
        ) : (
          <View style={styles.sidePlaceholder} />
        )}
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
  sideBtn: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sidePlaceholder: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
  },
  sideIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Sizes.iconMd,
    height: Sizes.iconMd,
  },
  statusDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
});
