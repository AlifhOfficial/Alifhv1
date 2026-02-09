/**
 * Sign Out Button Component
 * Simple sign out button for profile screen
 */

import React from 'react';
import { StyleSheet, Text, Pressable, Platform, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
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
    <Pressable
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
      <Text style={[styles.text, { color: colors.error }]}>Sign Out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  text: {
    ...Typography.button,
  },
});
