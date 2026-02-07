/**
 * Not Authenticated View Component
 * Shown when user is not signed in
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { User, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import type { ThemeColors } from './types';

interface NotAuthenticatedViewProps {
  colors: ThemeColors;
  topInset: number;
  onSignIn: () => void;
}

export function NotAuthenticatedView({
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
        {/* Avatar placeholder */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}
        >
          <User size={48} color={colors.textTertiary} strokeWidth={1.25} />
        </Animated.View>

        {/* Text content */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to RevvUp
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to access your profile, manage listings, and connect with
            buyers
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: Typography.h2.fontWeight as any,
    letterSpacing: Typography.h2.letterSpacing,
  },
  subtitle: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.headline.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.subhead.fontWeight as any,
    letterSpacing: Typography.subhead.letterSpacing,
    textAlign: 'center',
    maxWidth: 280,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  signInText: {
    fontSize: Typography.buttonMedium.fontSize,
    lineHeight: Typography.buttonMedium.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: Typography.buttonMedium.fontWeight as any,
    letterSpacing: Typography.buttonMedium.letterSpacing,
  },
});
