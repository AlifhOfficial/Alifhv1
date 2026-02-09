/**
 * Forgot Password Screen
 * Clean, minimal password reset
 */

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ButtonLoader } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CheckCircle2 } from 'lucide-react-native';

import { useTheme } from '@/context/theme-context';
import { Colors, Typography } from '@/constants/theme';

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
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');

  const themeColors = Colors[colorScheme];
  const colors = {
    bg: themeColors.background,
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    textTertiary: themeColors.textTertiary,
    primary: themeColors.primary,
    primarySoft: isDark ? 'rgba(0,102,255,0.12)' : 'rgba(0,102,255,0.04)',
    inputBg: themeColors.surface,
    inputBorder: themeColors.border,
    inputFocusBorder: isDark ? 'rgba(0,102,255,0.5)' : 'rgba(0,102,255,0.2)',
    error: themeColors.error,
    success: themeColors.success,
    successSoft: isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.06)',
    border: themeColors.border,
  };

  const handleSubmit = async () => {
    if (!email || isLoading) return;
    await onSubmit(email);
  };

  const isValid = email.length > 0 && email.includes('@');

  // Success state
  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </Pressable>
          </Animated.View>

          {/* Success Content */}
          <View style={styles.centerSection}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.successIcon}>
              <CheckCircle2 size={64} color={colors.success} strokeWidth={1.5} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.titleSection, { alignItems: 'center' }]}>
              <Text style={[styles.title, { color: colors.text }]}>Check your email<Text style={{ color: colors.success, opacity: 0.9 }}>.</Text></Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {"We've sent a reset link to"}
              </Text>
              <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.buttonSection}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>Back to sign in</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Reset password<Text style={{ color: colors.primary, opacity: 0.8 }}>.</Text></Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {"We'll send you a reset link"}
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: `${colors.error}08` }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, { color: colors.text, backgroundColor: colors.inputBg }]}
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
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: (!isValid || isLoading) ? 0.4 : pressed ? 0.9 : 1 }
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>Send reset link</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <Pressable onPress={onBack}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
            </Pressable>
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
    paddingHorizontal: 24,
  },
  header: {
    height: 52,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: Typography.titleLarge.fontSize,
    lineHeight: Typography.titleLarge.lineHeight,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  emailText: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  errorBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_500Medium',
    marginLeft: 4,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: Typography.body.fontSize,
    fontFamily: 'Inter_400Regular',
  },
  inputWrapper: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: Typography.body.fontSize,
    fontFamily: 'Inter_400Regular',
    backgroundColor: 'transparent',
  },
  submitButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: Typography.body.fontSize,
    fontFamily: 'Inter_600SemiBold',
    // Color applied inline
  },
  buttonSection: {
    paddingBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.labelSmall.lineHeight,
    fontFamily: 'Inter_600SemiBold',
  },
});
