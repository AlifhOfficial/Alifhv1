/**
 * Not Authenticated View for Saved Tab
 * Shown when user is not signed in
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Heart, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import type { ThemeColors } from './types';

interface NotAuthenticatedViewProps {
  colors: ThemeColors;
  topInset: number;
  onSignIn: () => void;
}

export function SavedNotAuthenticatedView({
  colors,
  topInset,
  onSignIn,
}: NotAuthenticatedViewProps) {
  const handleSignIn = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSignIn();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topInset + 80 },
      ]}
    >
      <Animated.View entering={FadeIn.duration(300)} style={styles.content}>
        {/* Icon placeholder */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]}
        >
          <Heart size={48} color={colors.textTertiary} strokeWidth={1.25} />
        </Animated.View>

        {/* Text content */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Your Saved Listings
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to save your favorite listings and superlikes across all your devices
          </Text>
        </Animated.View>

        {/* Sign in button */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Pressable
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.signInButton,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <LogIn size={18} color={colors.primaryForeground} strokeWidth={2} />
            <Text style={[styles.signInText, { color: colors.primaryForeground }]}>
              Sign In
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  signInText: {
    ...Typography.button,
  },
});
