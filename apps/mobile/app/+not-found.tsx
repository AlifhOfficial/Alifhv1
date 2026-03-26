/**
 * Not Found Screen
 * Displayed when navigating to a route that doesn't exist
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText } from '@/components/ui/text';

export default function NotFoundScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/browse');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/browse');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <MapPinOff size={48} color={colors.primary} strokeWidth={1.5} />
        </View>

        {/* Title */}
        <Heading size="large" style={styles.title}>
          Page not found
        </Heading>

        {/* Description */}
        <Body size="medium" tone="secondary" style={styles.description}>
          The page you're looking for doesn't exist or may have been moved.
        </Body>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleGoHome}
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Home size={18} color="#fff" strokeWidth={2} />
            <ButtonText size="medium" style={{ color: '#fff' }}>Go Home</ButtonText>
          </Pressable>

          <Pressable
            onPress={handleGoBack}
            style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          >
            <ArrowLeft size={18} color={colors.text} strokeWidth={2} />
            <ButtonText size="medium" style={{ color: colors.text }}>Go Back</ButtonText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: Spacing.xl,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.lg,
  },
  primaryButton: {
    // backgroundColor set inline
  },
  secondaryButton: {
    borderWidth: 1,
  },
});
