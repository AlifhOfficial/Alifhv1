/**
 * Inventory Tube — Home screen quick access to My Inventory
 *
 * A compact tube/pill component that navigates to the Inventory screen.
 * Matches SavedTube styling. Auth-gated — triggers auth flow if not signed in.
 */

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Data } from '@/components/ui';

export function InventoryTube() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated, openAuthFlow } = useAuth();

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!isAuthenticated) {
      openAuthFlow();
      return;
    }

    router.push('/inventory');
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
          Inventory
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
