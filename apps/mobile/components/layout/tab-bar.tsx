/**
 * Custom Tab Bar - Shop-style UI
 * Left pill with grouped tabs, right circular search button
 */

import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Home, MessageCircle, LayoutGrid } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const TAB_ICONS = {
  index: Home,
  messages: MessageCircle,
  search: LayoutGrid,
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const handlePress = (route: typeof state.routes[0], index: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab bar content */}
      <View style={[styles.tabBarContent, { paddingBottom: insets.bottom + 6 }]}>
        {/* Centered Pill Group with 3 tabs: Home, Messages, Browse */}
        <View style={[styles.pillWrapper, { backgroundColor: colors.background }]}>
          <View style={styles.pillContent}>
            {[state.routes[0], state.routes[1], state.routes[3]].map((route, idx) => {
              const actualIndex = idx === 2 ? 3 : idx;
              const isFocused = state.index === actualIndex;
              const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] || Home;

              // Active: contrasting color (white on dark, black on light) with fill
              // Inactive: grey tone with surface fill
              const iconColor = isFocused 
                ? (isDark ? '#FFFFFF' : '#000000')
                : (isDark ? '#666666' : '#999999');

              return (
                <Pressable
                  key={route.key}
                  onPress={() => handlePress(route, actualIndex)}
                  style={styles.pillTab}
                >
                  <Icon
                    size={22}
                    color={iconColor}
                    fill={isFocused ? iconColor : colors.surface}
                    strokeWidth={2}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  // Tab bar content wrapper
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },

  // Pill Group
  pillWrapper: {
    borderRadius: 18,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 4,
  },

  // Individual pill tab
  pillTab: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});
