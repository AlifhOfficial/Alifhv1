/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { HomeHeader } from '@/components/home/header';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader />
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Browse the latest listings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
