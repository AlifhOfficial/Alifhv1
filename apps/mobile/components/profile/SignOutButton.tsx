/**
 * Sign Out Button Component
 * Simple sign out button for profile screen
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, Platform, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import type { ThemeColors } from './types';

interface SignOutButtonProps {
  colors: ThemeColors;
}

export function SignOutButton({ colors }: SignOutButtonProps) {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  return (
    <HapticPressable
      onPress={handleSignOut}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <LogOut size={Sizes.iconSm} color={colors.error} strokeWidth={2} />
      <Text variant="body" tone="error">Sign Out</Text>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    marginTop: Spacing.md,
  },
});
