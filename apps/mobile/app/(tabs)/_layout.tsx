/**
 * Tab Layout - Revvup Mobile App
 * Main tabs: Home, Messages, Search
 * Profile, Saved, Settings are at root level (accessed via GlobalTabBar)
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: true,
          headerRight: () => <ThemeToggle />,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
