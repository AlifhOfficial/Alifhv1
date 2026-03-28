/**
 * Name Step - First step of onboarding
 * Personal greeting to start the journey
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Sizes } from '@/constants/theme';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { Heading, Body, Data, ButtonText, Supporting } from '@/components/ui';
import { onboardingStyles, ONBOARDING_LAYOUT } from './onboarding-styles';

interface NameStepProps {
  onContinue: (name: string) => void;
  onBack: () => void;
  initialName?: string;
  isLoading?: boolean;
  currentStep: number;
  totalSteps: number;
}

export function NameStep({
  onContinue,
  onBack,
  initialName = '',
  isLoading = false,
  currentStep,
  totalSteps,
}: NameStepProps) {
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [name, setName] = useState(initialName);
  const isValid = name.trim().length >= 2;

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isValid && !isLoading) {
      onContinue(name.trim());
    }
  };

  return (
    <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
      <KeyboardAvoidingView behavior="padding" style={onboardingStyles.keyboardView}>
        <View
          style={[
            onboardingStyles.content,
            { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
        >
          {/* Header with progress */}
          <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [onboardingStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="chevron-back" size={Sizes.iconLg} color={colors.white} />
            </HapticPressable>

            <View style={onboardingStyles.progressContainer}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    onboardingStyles.progressBar,
                    {
                      backgroundColor:
                        index < currentStep ? colors.primary : colors.glassBorderDark,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Supporting size="bodySm" style={[onboardingStyles.greeting, { color: colors.primary }]}>
              Let's get started
            </Supporting>
            <Heading size="title" style={[onboardingStyles.title, { color: colors.white }]}>
              What's your name?
            </Heading>
            <Body size="bodySm" style={[onboardingStyles.subtitle, { color: colors.text2 }]}>
              We'd love to know what to call you
            </Body>
          </Animated.View>

          {/* Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.inputSection}>
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.white}08`,
                  borderColor: name.length > 0 ? colors.primary : `${colors.white}15`,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[onboardingStyles.inputInner, { color: colors.white }]}
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={colors.text3}
                keyboardAppearance="dark"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                textContentType="givenName"
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={handleContinue}
              />
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={onboardingStyles.buttonSection}>
            <HapticPressable
              onPress={handleContinue}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                onboardingStyles.continueButton,
                {
                  backgroundColor: isValid ? colors.primary : `${colors.white}10`,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <ButtonText style={{ color: isValid ? colors.primaryFg : colors.text3 }}>
                  Continue
                </ButtonText>
              )}
            </HapticPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
