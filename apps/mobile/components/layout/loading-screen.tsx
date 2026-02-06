/**
 * Loading Screen
 * Full-screen branded loading state for the Revvup mobile app
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader } from '@/components/ui/loader';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading' }: LoadingScreenProps) {
  const { colorScheme } = useTheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Loader message={message} fullScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
