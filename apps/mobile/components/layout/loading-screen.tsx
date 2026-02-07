/**
 * Loading Screen
 * Full-screen branded loading state for the Revvup mobile app
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlowLoader } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading' }: LoadingScreenProps) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <GlowLoader size="xl" />
        {message && (
          <Text style={[styles.message, { color: isDark ? '#A1A1AA' : '#71717A' }]}>
            {message}
          </Text>
        )}
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
  },
  message: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '500',
  },
});
