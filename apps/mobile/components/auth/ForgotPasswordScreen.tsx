/**
 * Forgot Password Screen
 * Clean, minimal password reset using design system tokens
 */

import React, { useState } from 'react';
import { 
  View, 
  Text as RNText,
  TextInput, 
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Display, Body, Data, ButtonText } from '@/components/ui';
import { authStyles } from './auth-styles';
import { ChevronLeftIcon } from './icons';

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
      <View style={[authStyles.container, { backgroundColor: colors.background }]}>
        <View style={[
          authStyles.content, 
          { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }
        ]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={authStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [authStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </HapticPressable>
          </Animated.View>

          {/* Success Content */}
          <View style={authStyles.centerSection}>
            <Animated.View entering={FadeIn.duration(300)} style={authStyles.successIcon}>
              <CheckCircle2 size={64} color={colors.success} strokeWidth={1.5} />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(150).duration(400)} 
              style={[authStyles.titleSection, { alignItems: 'center' }]}
            >
              <Display size="large">
                Check your email<RNText style={{ color: colors.success }}>.</RNText>
              </Display>
              <Body tone="secondary" style={authStyles.subtitle}>
                {"We've sent a reset link to"}
              </Body>
              <Data tone="primary" style={{ marginTop: Spacing.xs }}>{email}</Data>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={authStyles.buttonSection}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [
                authStyles.submitButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1, width: '100%' }
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
    <View style={[authStyles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior="padding"
        style={authStyles.keyboardView}
      >
        <View style={[
          authStyles.content, 
          { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }
        ]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={authStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [authStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </HapticPressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={authStyles.titleSection}>
            <Display size="large">
              Reset password<RNText style={{ color: colors.primary }}>.</RNText>
            </Display>
            <Body tone="secondary" style={authStyles.subtitle}>
              {"We'll send you a reset link"}
            </Body>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[authStyles.errorBox, { backgroundColor: colors.errorMuted }]}
            >
              <Body size="small" tone="error" style={authStyles.errorText}>{error}</Body>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={authStyles.form}>
            <View style={authStyles.inputGroup}>
              <Data size="mini" tone="secondary" style={authStyles.inputLabel}>Email</Data>
              <View style={[
                authStyles.inputWrapper, 
                { backgroundColor: colors.input, borderColor: colors.border }
              ]}>
                <TextInput
                  style={[authStyles.inputInner, { color: colors.text }]}
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
                authStyles.submitButton,
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
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={authStyles.footer}>
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
