/**
 * OTP Verification Screen
 * Clean, minimal iOS-style OTP input using design system tokens
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HapticPressable } from '@/components/ui';
import { InlineLoader } from '@/components/ui/loaders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Display, Body, Heading, Data, Supporting } from '@/components/ui';
import { authStyles } from './auth-styles';
import { ChevronLeftIcon } from './icons';

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
            <Display size="large">Enter code</Display>
            <Body tone="secondary" style={authStyles.subtitle}>
              Sent to {email}
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

          {/* Code Input */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={authStyles.codeSection}>
            <HapticPressable onPress={focusInput} style={authStyles.codeBoxes}>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const digit = code[index] || '';
                const isActive = index === code.length;
                
                return (
                  <View
                    key={index}
                    style={[
                      authStyles.codeBox,
                      { 
                        backgroundColor: colors.input,
                        borderColor: error ? colors.error : isActive ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <Heading size="large">{digit}</Heading>
                    {isActive && !isLoading && (
                      <Animated.View 
                        entering={FadeIn.duration(150)}
                        style={[authStyles.codeCursor, { backgroundColor: colors.primary }]} 
                      />
                    )}
                  </View>
                );
              })}
            </HapticPressable>

            {/* Hidden input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoFocus
              style={authStyles.codeHiddenInput}
              editable={!isLoading}
            />
          </Animated.View>

          {/* Loading */}
          {isLoading && (
            <Animated.View entering={FadeIn.duration(150)} style={authStyles.loadingSection}>
              <InlineLoader size="sm" />
            </Animated.View>
          )}

          {/* Resend */}
          <Animated.View entering={FadeIn.delay(250).duration(300)} style={authStyles.resendSection}>
            {canResend ? (
              <HapticPressable onPress={handleResend} disabled={isLoading}>
                <Data tone="primary">Resend code</Data>
              </HapticPressable>
            ) : (
              <Supporting size="small" tone="muted">
                Resend in {resendTimer}s
              </Supporting>
            )}
          </Animated.View>

          {/* Help text */}
          <Animated.View entering={FadeIn.delay(350).duration(300)} style={authStyles.helpSection}>
            <Supporting size="small" tone="muted" style={authStyles.helpText}>
              Check your spam folder if you don't see it
            </Supporting>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
