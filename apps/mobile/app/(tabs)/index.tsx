/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader, SavedTube } from '@/components/home';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: insets.bottom + Layout.tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Tube */}
        <SavedTube />
        
        {/* Placeholder for more content */}
        <View style={styles.placeholder}>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            Browse the latest listings
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  text: {
    ...Typography.body,
  },
});
