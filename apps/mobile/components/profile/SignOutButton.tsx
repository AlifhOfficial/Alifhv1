/**
 * Sign Out Button Component
 * Simple sign out button for profile screen
 */

import React from 'react';
import { StyleSheet, Platform, Alert } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { ButtonText } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
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
      <LogOut size={18} color={colors.error} strokeWidth={2} />
      <ButtonText size="medium" tone="error">Sign Out</ButtonText>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    marginTop: Spacing.md,
  },
});
