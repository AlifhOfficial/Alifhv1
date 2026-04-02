import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing['2xl'],
            paddingBottom: Math.max(insets.bottom + Spacing.xl, Spacing['3xl']),
          },
        ]}
      >
        <Image
          source={require('@/assets/images/Revvup-wordmark-white.png')}
          style={styles.wordmark}
          resizeMode="contain"
        />

        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/revvupab.png')}
            style={styles.heroArtwork}
            resizeMode="contain"
          />
          <Text variant="title2Emphasized" style={[styles.title, { color: colors.label }]}>
            Buy, sell, and connect without the old auth maze.
          </Text>
          <Text variant="body" style={[styles.subtitle, { color: colors.labelSecondary }]}>
            Start with a simple account sheet when you need it, or continue browsing first.
          </Text>
        </View>

        <View style={styles.actions}>
          <HapticPressable
            onPress={onCreateAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <Text variant="bodyEmphasized" style={{ color: colors.primaryForeground }}>
              Create Account
            </Text>
          </HapticPressable>

          <HapticPressable
            onPress={onSignIn}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text variant="bodyEmphasized" style={{ color: colors.label }}>
              Sign In
            </Text>
          </HapticPressable>

          <HapticPressable onPress={onContinueAsGuest} style={styles.guestButton}>
            <Text variant="subhead" style={{ color: colors.labelSecondary }}>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  wordmark: {
    width: 140,
    height: 34,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  heroArtwork: {
    width: '100%',
    height: 280,
    maxWidth: 360,
  },
  title: {
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButton: {
    minHeight: Sizes.actionButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
});