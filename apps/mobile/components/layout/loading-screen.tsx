/**
 * Loading Screen
 * Full-screen branded loading state for the Revvup mobile app
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export function LoadingScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.brandName, { color: colors.text }]}>
          Revvup
        </Text>
        <Text style={[styles.tagline, { color: colors.textTertiary }]}>
          Revved up
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
