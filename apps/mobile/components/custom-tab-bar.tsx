/**
 * Custom Tab Bar - Shop-style UI
 * Left pill with grouped tabs, right circular search button
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Home, MessageCircle, Heart, Search } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';

const TAB_ICONS = {
  index: Home,
  messages: MessageCircle,
  saved: Heart,
  search: Search,
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  // Split tabs: first 3 in pill, search separate
  const pillTabs = state.routes.slice(0, 3);
  const searchTab = state.routes[3];

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
    <View style={[
      styles.container, 
      isDark ? styles.containerDark : styles.containerLight,
      { paddingBottom: Math.max(insets.bottom, 12) }
    ]}>
      {/* Left Pill Group */}
      <View style={[styles.pillContainer, isDark ? styles.pillDark : styles.pillLight]}>
        {pillTabs.map((route, index) => {
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] || Home;

          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route, index)}
              style={[
                styles.pillTab,
                isFocused && (isDark ? styles.pillTabActiveDark : styles.pillTabActiveLight),
              ]}
            >
              <Icon
                size={22}
                color={isFocused 
                  ? (isDark ? '#FFFFFF' : '#000000')
                  : (isDark ? '#8E8E93' : '#8E8E93')
                }
                fill={isFocused ? (isDark ? '#FFFFFF' : '#000000') : 'transparent'}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Right Search Button */}
      {searchTab && (
        <Pressable
          onPress={() => handlePress(searchTab, 3)}
          style={[
            styles.searchButton,
            isDark ? styles.searchButtonDark : styles.searchButtonLight,
            state.index === 3 && (isDark ? styles.searchButtonActiveDark : styles.searchButtonActiveLight),
          ]}
        >
          <Search
            size={22}
            color={state.index === 3 
              ? (isDark ? '#FFFFFF' : '#000000')
              : (isDark ? '#8E8E93' : '#8E8E93')
            }
            strokeWidth={state.index === 3 ? 2.5 : 2}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    // paddingBottom is set dynamically via insets
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },

  // Pill container
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    padding: 4,
  },
  pillDark: {
    backgroundColor: '#1C1C1E',
  },
  pillLight: {
    backgroundColor: '#F2F2F7',
  },

  // Individual pill tab
  pillTab: {
    width: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pillTabActiveDark: {
    backgroundColor: '#2C2C2E',
  },
  pillTabActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Search button
  searchButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  searchButtonDark: {
    backgroundColor: '#1C1C1E',
  },
  searchButtonLight: {
    backgroundColor: '#F2F2F7',
  },
  searchButtonActiveDark: {
    backgroundColor: '#2C2C2E',
  },
  searchButtonActiveLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
