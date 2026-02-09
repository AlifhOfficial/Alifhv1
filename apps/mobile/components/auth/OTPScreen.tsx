/**
 * OTP Verification Screen
 * Clean, minimal iOS-style OTP input
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { InlineLoader } from '@/components/ui/loaders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/context/theme-context';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

interface OTPScreenProps {
  email: string;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const CODE_LENGTH = 6;

export function OTPScreen({
  email,
  onBack,
  onVerify,
  onResend,
  isLoading = false,
  error,
}: OTPScreenProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === CODE_LENGTH && !isLoading) {
      onVerify(code);
    }
  }, [code]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setCanResend(false);
    setResendTimer(60);
    setCode('');
    await onResend();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }]}>
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
            <Text style={[styles.title, { color: colors.text }]}>Enter code</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sent to {email}
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: colors.errorMuted }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Code Input */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.codeSection}>
            <Pressable onPress={focusInput} style={styles.codeBoxes}>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const digit = code[index] || '';
                const isActive = index === code.length;
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      { 
                        backgroundColor: colors.input,
                        borderColor: error ? colors.error : isActive ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Text style={[styles.codeDigit, { color: colors.text }]}>
                      {digit}
                    </Text>
                    {isActive && !isLoading && (
                      <Animated.View 
                        entering={FadeIn.duration(150)}
                        style={[styles.cursor, { backgroundColor: colors.primary }]} 
                      />
                    )}
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoFocus
              style={styles.hiddenInput}
              editable={!isLoading}
            />
          </Animated.View>

          {/* Loading */}
          {isLoading && (
            <Animated.View entering={FadeIn.duration(150)} style={styles.loadingSection}>
              <InlineLoader size="sm" />
            </Animated.View>
          )}

          {/* Resend */}
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.resendSection}>
            {canResend ? (
              <Pressable onPress={handleResend} disabled={isLoading}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Resend code
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.resendTimer, { color: colors.textTertiary }]}>
                Resend in {resendTimer}s
              </Text>
            )}
          </Animated.View>

          {/* Help text */}
          <Animated.View entering={FadeIn.delay(350).duration(300)} style={styles.helpSection}>
            <Text style={[styles.helpText, { color: colors.textTertiary }]}>
              Check your spam folder if you don't see it
            </Text>
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
  titleSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.titleLarge,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
  },
  errorBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.bodyMini,
    textAlign: 'center',
  },
  codeSection: {
    position: 'relative',
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  codeBox: {
    width: 50,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeDigit: {
    ...Typography.title,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 26,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },
  resendSection: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  resendText: {
    ...Typography.link,
  },
  resendTimer: {
    ...Typography.helper,
  },
  helpSection: {
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
  },
  helpText: {
    ...Typography.helper,
    textAlign: 'center',
  },
});
