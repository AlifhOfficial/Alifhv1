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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/context/theme-context';

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
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const colors = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    textTertiary: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
    primary: '#0066FF',
    inputBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
    inputBorder: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
    inputBorderActive: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)',
    error: '#FF3B30',
  };

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
            <Text style={[styles.title, { color: colors.text }]}>Enter code</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sent to {email}
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: `${colors.error}08` }]}>
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
                        backgroundColor: colors.inputBg,
                        borderColor: error ? colors.error : isActive ? colors.primary : colors.inputBorder,
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
              <ActivityIndicator color={colors.primary} size="small" />
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
  titleSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  errorBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  codeSection: {
    position: 'relative',
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  codeBox: {
    width: 50,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeDigit: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
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
    marginTop: 24,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  resendTimer: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  helpSection: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
