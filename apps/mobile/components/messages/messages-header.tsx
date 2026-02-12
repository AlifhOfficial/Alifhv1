/**
 * Messages Header - Mobile Native
 * Matches SettingsHeader style for consistency
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Layout } from '@/constants/theme';
import { Heading } from '@/components/ui';

export function MessagesHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Layout.headerPadding }]}>
      <Heading size="medium">Messages</Heading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
