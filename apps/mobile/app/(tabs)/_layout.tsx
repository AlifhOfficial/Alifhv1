/**
 * Tab Layout - Revvup Mobile App
 * Tabs: Home, Messages, Saved, Search
 * Custom Shop-style tab bar UI
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CustomTabBar } from '@/components/layout/tab-bar';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {/* Top Safe Area Gradient - Global */}
      <TopSafeAreaGradient />
      
      {/* Bottom Safe Area Gradient - Global */}
      <BottomSafeAreaGradient />

      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
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
        name="saved"
        options={{
          title: 'Saved',
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
