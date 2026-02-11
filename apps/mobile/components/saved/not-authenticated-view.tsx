/**
 * Not Authenticated View for Saved Tab
 * Shown when user is not signed in
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Heart, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Heading, Body, ButtonText } from '@/components/ui';
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
          <Heading size="large" style={styles.title}>
            Your Saved Listings
          </Heading>
          <Body size="large" tone="secondary" style={styles.subtitle}>
            Sign in to save your favorite listings and superlikes across all your devices
          </Body>
        </Animated.View>

        {/* Sign in button */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <HapticPressable
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
            <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
              Sign In
            </ButtonText>
          </HapticPressable>
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
    textAlign: 'center',
  },
  subtitle: {
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
});
