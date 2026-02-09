/**
 * Onboarding Flow - Main orchestrator
 * Manages step navigation and data collection
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body } from '@/components/ui';
import * as AuthAPI from '@/lib/auth-api';

import { IntroStep } from './IntroStep';
import { NameStep } from './NameStep';
import { EmailStep } from './EmailStep';
import { PasswordStep } from './PasswordStep';
import { CompleteStep } from './CompleteStep';
import type { OnboardingStep, OnboardingData } from './types';

interface OnboardingFlowProps {
  onComplete: (user?: { id: string; name: string; email: string }) => void;
  onSignIn: () => void;
  onVerifyOTP?: (email: string, password: string, name: string, userId?: string) => void;
}

export function OnboardingFlow({ onComplete, onSignIn, onVerifyOTP }: OnboardingFlowProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [step, setStep] = useState<OnboardingStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    password: '',
  });

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((newStep: OnboardingStep) => {
    setStep(newStep);
  }, []);

  const handleIntroNext = useCallback(() => {
    goToStep('name');
  }, [goToStep]);

  const handleNameNext = useCallback(() => {
    goToStep('email');
  }, [goToStep]);

  const handleNameBack = useCallback(() => {
    goToStep('intro');
  }, [goToStep]);

  const handleEmailNext = useCallback(() => {
    goToStep('password');
  }, [goToStep]);

  const handleEmailBack = useCallback(() => {
    goToStep('name');
  }, [goToStep]);

  const handlePasswordNext = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call the signup API
      const result = await AuthAPI.signUpWithEmail(data.name, data.email, data.password);
      
      if (!result.success) {
        Alert.alert('Sign Up Failed', result.error || 'Something went wrong. Please try again.');
        return;
      }

      // Check if OTP verification is required
      if (onVerifyOTP) {
        onVerifyOTP(data.email, data.password, data.name, result.user?.id);
      } else {
        // Go directly to complete step
        goToStep('complete');
      }
    } catch (error: any) {
      const message = error?.message || 'Something went wrong. Please try again.';
      Alert.alert('Sign Up Failed', message);
    } finally {
      setIsLoading(false);
    }
  }, [data, goToStep, onVerifyOTP]);

  const handlePasswordBack = useCallback(() => {
    goToStep('email');
  }, [goToStep]);

  const handleComplete = useCallback(() => {
    onComplete({ id: '', name: data.name, email: data.email });
  }, [onComplete, data.name, data.email]);

  // Loading overlay
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Body size="medium" tone="secondary" style={styles.loadingText}>
          Creating your account...
        </Body>
      </View>
    );
  }

  // Render current step directly - no animations
  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <IntroStep 
            onNext={handleIntroNext}
            onSignIn={onSignIn}
          />
        );
      case 'name':
        return (
          <NameStep 
            data={data}
            onUpdate={updateData}
            onNext={handleNameNext}
            onBack={handleNameBack}
          />
        );
      case 'email':
        return (
          <EmailStep 
            data={data}
            onUpdate={updateData}
            onNext={handleEmailNext}
            onBack={handleEmailBack}
          />
        );
      case 'password':
        return (
          <PasswordStep 
            data={data}
            onUpdate={updateData}
            onNext={handlePasswordNext}
            onBack={handlePasswordBack}
          />
        );
      case 'complete':
        return (
          <CompleteStep 
            data={data}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
});
