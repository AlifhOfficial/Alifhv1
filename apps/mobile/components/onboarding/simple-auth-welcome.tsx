import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Radius, Sizes, Spacing } from '@/constants/theme';

interface SimpleAuthWelcomeProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
  onContinueAsGuest: () => void;
}

export function SimpleAuthWelcome({
  onCreateAccount,
  onSignIn,
  onContinueAsGuest,
}: SimpleAuthWelcomeProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top panel — primitive surface with bottom rounded corners */}
      <View style={styles.topPanel}>
        <Image
          source={require('@/assets/images/Revvup-wordmark-white.png')}
          style={styles.wordmark}
          resizeMode="contain"
        />
      </View>

      {/* Bottom content */}
      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing['3xl']),
          },
        ]}
      >
        <View style={styles.copy}>
          <Text variant="title1Emphasized" style={styles.title}>
            Your next car{'\n'}starts here.
          </Text>
          <Text variant="subhead" style={styles.subtitle}>
            {"Free to list. No fees, no buried ads."}
          </Text>
        </View>

        <View style={styles.actions}>
          <HapticPressable
            onPress={onCreateAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <Text variant="bodyEmphasized" style={styles.primaryButtonText}>
              Create Account
            </Text>
          </HapticPressable>

          <HapticPressable
            onPress={onSignIn}
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <Text variant="bodyEmphasized" style={styles.secondaryButtonText}>
              Sign In
            </Text>
          </HapticPressable>

          <HapticPressable onPress={onContinueAsGuest} style={styles.guestButton}>
            <Text variant="subhead" style={styles.guestText}>
              Continue as guest
            </Text>
          </HapticPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topPanel: {
    height: '42%',
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    width: 180,
    height: 44,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing['2xl'],
    justifyContent: 'flex-end',
  },
  copy: {
    gap: Spacing.sm,
  },
  title: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
  },
  actions: {
    gap: Spacing.sm,
  },
  primaryButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  guestButton: {
    minHeight: Sizes.actionButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    color: 'rgba(255,255,255,0.45)',
  },
});