/**
 * GreetingNote Component
 * 
 * A personalized greeting with the user's name.
 * Uses theme tokens for all styling.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Spacing, Layout } from '@/constants/theme';
import { Display, Supporting } from '@/components/ui';

/**
 * Returns a time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

/**
 * Gets the user's first name for personalized greeting
 */
function getFirstName(user: { firstName?: string | null; name?: string } | null): string | null {
  if (!user) return null;
  
  if (user.firstName) return user.firstName;
  
  if (user.name) {
    const firstName = user.name.split(' ')[0];
    return firstName || null;
  }
  
  return null;
}

export function GreetingNote() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const greeting = getGreeting();
  const firstName = getFirstName(user);

  return (
    <View style={styles.container}>
      <Supporting size="medium" style={{ color: colors.textTertiary }}>
        {greeting}
      </Supporting>
      {firstName && (
        <Display size="medium" style={{ color: colors.text }}>
          {firstName}
        </Display>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.xs,
  },
});
