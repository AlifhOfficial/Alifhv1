/**
 * Saved Tube - Home screen quick access to saved listings
 * 
 * A compact tube/pill component that navigates to the Saved screen.
 * Matches notifications icon button styling.
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data } from '@/components/ui';

export function SavedTube() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/saved');
  };

  return (
    <HapticPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={handlePress}
      hitSlop={Layout.hitSlop}
    >
      {({ pressed }) => (
        <Data size="small" tone="secondary" style={{ opacity: pressed ? 0.7 : 1 }}>
          Saved
        </Data>
      )}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
