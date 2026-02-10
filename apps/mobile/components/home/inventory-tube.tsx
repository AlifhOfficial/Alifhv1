/**
 * Inventory Tube — Home screen quick access to My Inventory
 *
 * A compact tube/pill component that navigates to the Inventory screen.
 * Matches SavedTube styling. Auth-gated — triggers auth flow if not signed in.
 */

import React from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
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
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {({ pressed }) => (
        <Data size="small" tone="secondary" style={{ opacity: pressed ? 0.7 : 1 }}>
          Inventory
        </Data>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
