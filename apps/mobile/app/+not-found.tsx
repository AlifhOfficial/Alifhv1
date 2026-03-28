/**
 * Not Found Screen
 * Displayed when navigating to a route that doesn't exist
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText } from '@/components/ui/text';

export default function NotFoundScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)/(browse)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/(browse)');
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
        <Heading size="title" style={styles.title}>
          Page not found
        </Heading>

        {/* Description */}
        <Body size="body" tone="secondary" style={styles.description}>
          The page you're looking for doesn't exist or may have been moved.
        </Body>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleGoHome}
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Home size={18} color="#fff" strokeWidth={2} />
            <ButtonText size="body" style={{ color: '#fff' }}>Go Home</ButtonText>
          </Pressable>

          <Pressable
            onPress={handleGoBack}
            style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          >
            <ArrowLeft size={18} color={colors.text} strokeWidth={2} />
            <ButtonText size="body" style={{ color: colors.text }}>Go Back</ButtonText>
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
    width: Spacing["5xl"] * 2 + Spacing.xs,
    height: Spacing["5xl"] * 2 + Spacing.xs,
    borderRadius: (Spacing["5xl"] * 2 + Spacing.xs) / 2,
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
    maxWidth: Spacing["5xl"],
    marginBottom: Spacing.xl,
  },
  actions: {
    width: '100%',
    maxWidth: Spacing["5xl"],
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
  },
  primaryButton: {
    // backgroundColor set inline
  },
  secondaryButton: {
    borderWidth: 1,
  },
});
