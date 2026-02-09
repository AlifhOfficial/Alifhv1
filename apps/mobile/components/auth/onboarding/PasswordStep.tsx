/**
 * Password Step - Secure your account
 * Shows password requirements with visual feedback
 */

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Display, Body, Supporting, ButtonText } from '@/components/ui';
import { StepIndicator } from './StepIndicator';
import type { StepProps } from './types';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
];

export function PasswordStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  
  const [localPassword, setLocalPassword] = useState(data.password);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const passedRequirements = REQUIREMENTS.filter(r => r.test(localPassword));
  const isValid = passedRequirements.length === REQUIREMENTS.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string) => {
    setLocalPassword(text);
    if (!hasInteracted && text.length > 0) {
      setHasInteracted(true);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      onUpdate({ password: localPassword });
      onNext();
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
          <Pressable onPress={onBack} hitSlop={20} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <StepIndicator currentStep="password" />
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Display size="medium">
              Create a password
            </Display>
            <Body size="large" tone="secondary" style={styles.subtitle}>
              Make it secure with at least 8 characters.
            </Body>
          </View>

          <View>
            <View 
              style={[
                styles.inputContainer, 
                { 
                  backgroundColor: colors.surface,
                  borderColor: isFocused ? colors.primary : colors.border,
                }
              ]}
            >
              <TextInput
                ref={inputRef}
                value={localPassword}
                onChangeText={handleChange}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input, 
                  { color: colors.text },
                  Typography.bodyLarge
                ]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                autoComplete="password-new"
                returnKeyType="done"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={handleContinue}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)} 
                hitSlop={10}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textMuted} />
                ) : (
                  <Eye size={20} color={colors.textMuted} />
                )}
              </Pressable>
            </View>

            {/* Requirements */}
            {hasInteracted && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.requirements}>
                {REQUIREMENTS.map((req, index) => {
                  const passed = req.test(localPassword);
                  return (
                    <View key={index} style={styles.requirement}>
                      {passed ? (
                        <Check size={16} color={colors.success} />
                      ) : (
                        <X size={16} color={colors.textMuted} />
                      )}
                      <Supporting tone={passed ? 'success' : 'muted'}>
                        {req.label}
                      </Supporting>
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!isValid}
            style={({ pressed }) => [
              styles.continueButton,
              { 
                backgroundColor: isValid ? colors.primary : colors.surfaceSecondary,
                opacity: pressed && isValid ? 0.9 : 1,
              }
            ]}
          >
            <ButtonText style={{ color: isValid ? colors.primaryForeground : colors.textMuted }}>
              Create Account
            </ButtonText>
            <ArrowRight 
              size={20} 
              color={isValid ? colors.primaryForeground : colors.textMuted} 
            />
          </Pressable>
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
  input: {
    flex: 1,
    padding: 0,
  },
  eyeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  requirements: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
