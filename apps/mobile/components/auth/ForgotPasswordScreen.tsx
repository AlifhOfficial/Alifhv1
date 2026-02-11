/**
 * Forgot Password Screen
 * Clean, minimal password reset
 */

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text as RNText,
  TextInput, 
  
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ButtonLoader } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CheckCircle2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Display, Body, Data, ButtonText } from '@/components/ui';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

export function ForgotPasswordScreen({
  onBack,
  onSubmit,
  isLoading = false,
  error,
  success = false,
}: ForgotPasswordScreenProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!email || isLoading) return;
    await onSubmit(email);
  };

  const isValid = email.length > 0 && email.includes('@');

  // Success state
  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </HapticPressable>
          </Animated.View>

          {/* Success Content */}
          <View style={styles.centerSection}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.successIcon}>
              <CheckCircle2 size={64} color={colors.success} strokeWidth={1.5} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.titleSection, { alignItems: 'center' }]}>
              <Display size="large">
                Check your email<RNText style={{ color: colors.success }}>.</RNText>
              </Display>
              <Body tone="secondary" style={styles.subtitle}>
                {"We've sent a reset link to"}
              </Body>
              <Data tone="primary" style={styles.emailText}>{email}</Data>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.buttonSection}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <ButtonText style={{ color: colors.primaryForeground }}>Back to sign in</ButtonText>
            </HapticPressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </HapticPressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
            <Display size="large">
              Reset password<RNText style={{ color: colors.primary }}>.</RNText>
            </Display>
            <Body tone="secondary" style={styles.subtitle}>
              {"We'll send you a reset link"}
            </Body>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: colors.errorMuted }]}>
              <Body size="small" tone="error" style={styles.errorText}>{error}</Body>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Data size="mini" tone="secondary" style={styles.label}>Email</Data>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, { color: colors.text, backgroundColor: colors.input }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  selectionColor={colors.primary}
                  underlineColorAndroid="transparent"
                  autoFocus
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Submit Button */}
            <HapticPressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                { 
                  backgroundColor: (!isValid || isLoading) ? colors.surface : colors.primary,
                  opacity: pressed ? 0.9 : 1 
                }
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <ButtonText
                  style={{ color: (!isValid || isLoading) ? colors.textTertiary : colors.primaryForeground }}
                >
                  Send reset link
                </ButtonText>
              )}
            </HapticPressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.footer}>
            <Body size="small" tone="secondary">
              Remember your password?{' '}
            </Body>
            <HapticPressable onPress={onBack}>
              <Data tone="primary">Sign in</Data>
            </HapticPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  header: {
    height: 52,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: Spacing['2xl'],
  },
  titleSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  emailText: {
    marginTop: Spacing.xs,
  },
  errorBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  errorText: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    height: 54,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    height: 54,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  buttonSection: {
    paddingBottom: Spacing['4xl'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
  },
});
