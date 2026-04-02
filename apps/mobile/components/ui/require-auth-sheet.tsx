import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth, type AuthSheetContext } from '@/context/auth-context';

import { HapticPressable } from './haptic-pressable';
import { Text } from './text';

interface RequireAuthSheetProps {
  context: AuthSheetContext;
}

export function RequireAuthSheet({ context }: RequireAuthSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { isAuthenticated, authSheetVisible, showAuthSheet } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated && !authSheetVisible) {
        showAuthSheet(context);
      }
    }, [authSheetVisible, context, isAuthenticated, showAuthSheet])
  );

  const handleSignInPress = () => {
    if (!authSheetVisible) {
      showAuthSheet(context);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text variant="subhead" tone="secondary" style={styles.copy}>
          Sign in to continue.
        </Text>
        <HapticPressable
          onPress={handleSignInPress}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>
            Sign In
          </Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: Radius.xl,
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    maxWidth: 420,
  },
  copy: {
    textAlign: 'center',
  },
  button: {
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
});
