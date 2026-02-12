/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopSafeAreaGradient } from '@/components/layout';

import { HomeHeader } from '@/components/home';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { Body } from '@/components/ui';
import { useTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <TopSafeAreaGradient />
      <HomeHeader />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingTop: insets.top + Layout.headerPadding + Layout.hitTarget + Spacing.md + Spacing.md, paddingBottom: insets.bottom + Layout.tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder for more content */}
        <View style={styles.placeholder}>
          <Body size="large" tone="secondary" style={styles.text}>
            Browse the latest listings
          </Body>
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
  },
});
