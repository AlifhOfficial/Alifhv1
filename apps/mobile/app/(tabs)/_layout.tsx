/**
 * Tab Layout - Revvup Mobile App
 * Main tabs: Home, Messages, Search
 * Profile, Saved, Settings are at root level (accessed via GlobalTabBar)
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
