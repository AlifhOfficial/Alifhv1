/**
 * Tab Layout - Alifh Mobile App
 * Tabs: Home, Messages, Saved, Search
 * Custom Shop-style tab bar UI
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/custom-tab-bar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { colorScheme } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThemeToggle />,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
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
        name="saved"
        options={{
          title: 'Saved',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
    </Tabs>
  );
}
