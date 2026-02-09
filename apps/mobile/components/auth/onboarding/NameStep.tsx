/**
 * Name Step - Conversational name input
 * "What should we call you?"
 */

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Display, Body, Supporting, ButtonText } from '@/components/ui';
import { StepIndicator } from './StepIndicator';
import type { StepProps } from './types';

export function NameStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  
  const [localName, setLocalName] = useState(data.name);
  const [isFocused, setIsFocused] = useState(false);

  const isValid = localName.trim().length >= 2;

  useEffect(() => {
    // Auto-focus the input after animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isValid) {
      onUpdate({ name: localName.trim() });
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
          <StepIndicator currentStep="name" />
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Display size="medium">
              What's your name?
            </Display>
            <Body size="large" tone="secondary" style={styles.subtitle}>
              This is how you'll appear to others.
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
                value={localName}
                onChangeText={setLocalName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input, 
                  { color: colors.text },
                  Typography.headingMedium
                ]}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onSubmitEditing={handleContinue}
              />
            </View>

            {localName.length > 0 && !isValid && (
              <Animated.View entering={FadeIn.duration(200)}>
                <Supporting tone="error" style={styles.hint}>
                  Name must be at least 2 characters
                </Supporting>
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
              Continue
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
    borderRadius: Radius.xl,
    borderWidth: 2,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  input: {
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
