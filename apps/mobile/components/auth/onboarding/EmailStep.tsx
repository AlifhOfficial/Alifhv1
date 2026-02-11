/**
 * Email Step - Conversational email input
 * "Where can we reach you?"
 */

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Display, Body, Supporting, ButtonText } from '@/components/ui';
import { StepIndicator } from './StepIndicator';
import type { StepProps } from './types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  
  const [localEmail, setLocalEmail] = useState(data.email);
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);

  const isValid = EMAIL_REGEX.test(localEmail);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Show error only after user has typed something and lost focus
  const handleBlur = () => {
    setIsFocused(false);
    if (localEmail.length > 0 && !isValid) {
      setShowError(true);
    }
  };

  const handleChange = (text: string) => {
    setLocalEmail(text);
    if (showError && EMAIL_REGEX.test(text)) {
      setShowError(false);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      onUpdate({ email: localEmail.trim().toLowerCase() });
      onNext();
    } else {
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <HapticPressable onPress={onBack} hitSlop={20} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </HapticPressable>
          <StepIndicator currentStep="email" />
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Display size="medium">
              What's your email?
            </Display>
            <Body size="large" tone="secondary" style={styles.subtitle}>
              We'll use this to keep your account secure.
            </Body>
          </View>

          <View>
            <View 
              style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.surface,
                  borderColor: showError ? colors.error : (isFocused ? colors.primary : colors.border),
                }
              ]}
            >
              <Mail size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={inputRef}
                value={localEmail}
                onChangeText={handleChange}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input, 
                  { color: colors.text },
                  Typography.bodyLarge
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="done"
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onSubmitEditing={handleContinue}
              />
            </View>

            {showError && (
              <Animated.View entering={FadeIn.duration(200)}>
                <Supporting tone="error" style={styles.hint}>
                  Please enter a valid email address
                </Supporting>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <HapticPressable
            onPress={handleContinue}
            disabled={!localEmail.length}
            style={({ pressed }) => [
              styles.continueButton,
              { 
                backgroundColor: localEmail.length ? colors.primary : colors.surfaceSecondary,
                opacity: pressed && localEmail.length ? 0.9 : 1,
              }
            ]}
          >
            <ButtonText style={{ color: localEmail.length ? colors.primaryForeground : colors.textMuted }}>
              Continue
            </ButtonText>
            <ArrowRight 
              size={20} 
              color={localEmail.length ? colors.primaryForeground : colors.textMuted} 
            />
          </HapticPressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['3xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.md,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    marginBottom: Spacing['3xl'],
  },
  subtitle: {
    marginTop: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 2,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  hint: {
    marginTop: Spacing.md,
    marginLeft: Spacing.md,
  },
  footer: {
    paddingTop: Spacing.xl,
  },
  continueButton: {
    height: 56,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
