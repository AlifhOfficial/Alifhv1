/**
 * Onboarding Flow - Multi-step sign-up experience
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A personal, step-by-step onboarding experience:
 * 
 * Step 1: Name     → Collect user's name
 * Step 2: Email    → Collect email address
 * Step 3: Password → Create secure password
 * Step 4: Email Sent → Confirmation screen
 * Step 5: OTP      → Verify email with code
 * Step 6: Welcome  → Celebrate and get started
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';

import * as AuthAPI from '@/lib/auth-api';

import { NameStep } from './NameStep';
import { EmailStep } from './EmailStep';
import { PasswordStep } from './PasswordStep';
import { EmailSentStep } from './EmailSentStep';
import { OTPScreen } from './OTPScreen';
import { AuthSuccessScreen } from './AuthSuccessScreen';

type OnboardingStep = 'name' | 'email' | 'password' | 'email-sent' | 'otp' | 'welcome';

const TOTAL_PROGRESS_STEPS = 6; // Visual progress indicator

interface OnboardingFlowProps {
  onComplete: (user?: { id: string; name: string; email: string }) => void;
  onBack: () => void;
}

export function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  // Current step
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // User data collected through steps
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation helpers
  const navigateTo = useCallback((step: OnboardingStep, dir: 'forward' | 'back' = 'forward') => {
    setDirection(dir);
    setError(null);
    setCurrentStep(step);
  }, []);

  // Get current step number for progress indicator
  const getStepNumber = (step: OnboardingStep): number => {
    const stepMap: Record<OnboardingStep, number> = {
      name: 1,
      email: 2,
      password: 3,
      'email-sent': 4,
      otp: 5,
      welcome: 6,
    };
    return stepMap[step];
  };

  // Step handlers
  const handleNameSubmit = (name: string) => {
    setUserName(name);
    navigateTo('email');
  };

  const handleEmailSubmit = (emailInput: string) => {
    setEmail(emailInput);
    navigateTo('password');
  };

  const handlePasswordSubmit = async (passwordInput: string) => {
    setPassword(passwordInput);
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthAPI.signUpWithEmail(userName, email, passwordInput);

      if (!result.success) {
        setError(result.error || 'Sign up failed');
        return;
      }

      if (result.user?.id) {
        setUserId(result.user.id);
      }

      // Move to email sent confirmation
      navigateTo('email-sent');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSentContinue = () => {
    navigateTo('otp');
  };

  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthAPI.verifyEmailOTP(email, code);

      if (!result.success) {
        setError(result.error || 'Invalid verification code');
        return;
      }

      // Auto sign-in after verification
      const signInResult = await AuthAPI.signInWithEmail(email, password);

      if (signInResult.success && signInResult.user) {
        setUserId(signInResult.user.id);
        setUserName(signInResult.user.name || userName);
      }

      // Go to welcome screen
      navigateTo('welcome');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await AuthAPI.resendVerificationOTP(email);
      if (!result.success) {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    }
  };

  const handleWelcomeContinue = () => {
    onComplete({ id: userId, name: userName, email });
  };

  // Back navigation per step
  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'name':
        onBack();
        break;
      case 'email':
        navigateTo('name', 'back');
        break;
      case 'password':
        navigateTo('email', 'back');
        break;
      case 'email-sent':
        navigateTo('password', 'back');
        break;
      case 'otp':
        navigateTo('email-sent', 'back');
        break;
      default:
        break;
    }
  }, [currentStep, navigateTo, onBack]);

  // Animation based on direction
  const entering = direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300);
  const exiting = direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300);

  const stepNumber = getStepNumber(currentStep);

  return (
    <View style={styles.container}>
      <Animated.View key={currentStep} entering={entering} exiting={exiting} style={styles.screen}>
        {currentStep === 'name' && (
          <NameStep
            onContinue={handleNameSubmit}
            onBack={handleBack}
            initialName={userName}
            currentStep={stepNumber}
            totalSteps={TOTAL_PROGRESS_STEPS}
          />
        )}

        {currentStep === 'email' && (
          <EmailStep
            userName={userName}
            onContinue={handleEmailSubmit}
            onBack={handleBack}
            initialEmail={email}
            error={error}
            currentStep={stepNumber}
            totalSteps={TOTAL_PROGRESS_STEPS}
          />
        )}

        {currentStep === 'password' && (
          <PasswordStep
            userName={userName}
            onContinue={handlePasswordSubmit}
            onBack={handleBack}
            isLoading={isLoading}
            error={error}
            currentStep={stepNumber}
            totalSteps={TOTAL_PROGRESS_STEPS}
          />
        )}

        {currentStep === 'email-sent' && (
          <EmailSentStep
            email={email}
            userName={userName}
            onContinue={handleEmailSentContinue}
            onBack={handleBack}
            onResend={handleResendOTP}
            currentStep={stepNumber}
            totalSteps={TOTAL_PROGRESS_STEPS}
          />
        )}

        {currentStep === 'otp' && (
          <OTPScreen
            email={email}
            onVerify={handleVerifyOTP}
            onBack={handleBack}
            onResend={handleResendOTP}
            isLoading={isLoading}
            error={error}
          />
        )}

        {currentStep === 'welcome' && (
          <AuthSuccessScreen userName={userName} onContinue={handleWelcomeContinue} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
