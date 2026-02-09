/**
 * Messages Header - Mobile Native
 * Matches ProfileHeader style for consistency
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Typography, Spacing } from '@/constants/theme';

export function MessagesHeader() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...Typography.headingLarge,
  },
});
