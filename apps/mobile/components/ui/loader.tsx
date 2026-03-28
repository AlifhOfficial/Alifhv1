/**
 * Native Loaders
 * iOS: UIActivityIndicatorView  |  Android: CircularProgressIndicator
 * Uses React Native's ActivityIndicator — platform-native on both.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Body } from './text';

/** Full-screen or inline activity indicator with optional message */
export function Loader({ message, fullScreen = false }: { message?: string; fullScreen?: boolean }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (fullScreen) {
    return (
      <View style={[styles.container, { backgroundColor: colors.skeleton }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Body size="bodySm" tone="secondary" style={styles.message}>
            {message}
          </Body>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color={colors.primary} />
      {message && (
        <Body size="bodySm" tone="secondary" style={styles.inlineMessage}>
          {message}
        </Body>
      )}
    </View>
  );
}

/** Spinner with configurable size and color */
export function SpinnerLoader({ size = 40, color }: { size?: number; color?: string }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <ActivityIndicator
      size={size >= 36 ? 'large' : 'small'}
      color={color ?? colors.primary}
    />
  );
}

/** Compact spinner for inline/list use */
export function LogoLoader({ size = 32 }: { size?: number }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <ActivityIndicator
      size={size >= 36 ? 'large' : 'small'}
      color={colors.primary}
    />
  );
}

/** Spinner for pull-to-refresh footers */
export function RefreshLoader({ isRefreshing = false }: { size?: number; isRefreshing?: boolean }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (!isRefreshing) return null;

  return (
    <View style={styles.refreshContainer}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.lg,
  },
  inlineMessage: {
    marginTop: Spacing.md,
  },
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
});

