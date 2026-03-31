/**
 * Auth Flow - Main Authentication Navigator
 * Manages the complete authentication flow with smooth transitions
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import * as AuthAPI from '@/lib/auth-api';
import { WelcomeScreen } from './WelcomeScreen';
import { SignInScreen } from './SignInScreen';
import { OnboardingFlow } from './OnboardingFlow';
import { OTPScreen } from './OTPScreen';
import { AuthSuccessScreen } from './AuthSuccessScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

type AuthScreen = 
  | 'welcome' 
  | 'signin' 
  | 'signup' 
  | 'otp' 
  | 'forgot-password' 
  | 'success';

interface AuthFlowProps {
  onComplete: (user?: { id: string; name: string; email: string }) => void;
  onSkip: () => void;
  initialScreen?: AuthScreen;
}

export function AuthFlow({ 
  onComplete, 
  onSkip,
  initialScreen = 'welcome' 
}: AuthFlowProps) {
  const { colors, colorScheme } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colors.background).catch(() => {});
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark').catch(() => {});
    }

    return () => {
      if (Platform.OS === 'android') {
        try {
          NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light');
        } catch {
          // Ignore errors if activity is no longer available
        }
      }
    };
  }, [colorScheme, colors.background]);

  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Store for auto-login after OTP
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Navigation helpers
  const navigateTo = useCallback((screen: AuthScreen, dir: 'forward' | 'back' = 'forward') => {
    setDirection(dir);
    setError(null);
    setCurrentScreen(screen);
  }, []);

  const goBack = useCallback(() => {
    setError(null);
    if (currentScreen === 'signin' || currentScreen === 'signup') {
      navigateTo('welcome', 'back');
    } else if (currentScreen === 'otp') {
      // Go back to the screen they came from
      navigateTo(authMode === 'signup' ? 'signup' : 'signin', 'back');
    } else if (currentScreen === 'forgot-password') {
      setForgotPasswordSuccess(false);
      navigateTo('signin', 'back');
    }
  }, [currentScreen, navigateTo, authMode]);

  // Auth handlers - Connected to real API
  const handleSignIn = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(emailInput);
    setPassword(passwordInput);
    setAuthMode('signin');
    
    try {
      const result = await AuthAPI.signInWithEmail(emailInput, passwordInput);
      
      if (!result.success) {
        if (result.needsVerification) {
          // User needs to verify email first
          navigateTo('otp');
          // Trigger OTP resend
          await AuthAPI.resendVerificationOTP(emailInput);
        } else {
          setError(result.error || 'Sign in failed');
        }
        return;
      }

      // Sign in successful - always navigate to success
      setUserName(result.user?.name || emailInput.split('@')[0]);
      setUserId(result.user?.id || '');
      navigateTo('success');
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, emailInput: string, passwordInput: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(emailInput);
    setPassword(passwordInput);
    setUserName(name);
    setAuthMode('signup');
    
    try {
      const result = await AuthAPI.signUpWithEmail(name, emailInput, passwordInput);
      
      if (!result.success) {
        setError(result.error || 'Sign up failed');
        return;
      }

      // Store user ID for later
      if (result.user?.id) {
        setUserId(result.user.id);
      }

      // After signup, go to OTP verification
      navigateTo('otp');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      
      // After OTP verification, sign in automatically
      const signInResult = await AuthAPI.signInWithEmail(email, password);
      
      if (signInResult.success) {
        // Update user info if available
        if (signInResult.user) {
          setUserName(signInResult.user.name);
          setUserId(signInResult.user.id);
        }
        navigateTo('success');
      } else {
        // Verification worked but auto-login failed - still show success
        // User can sign in manually later
        navigateTo('success');
      }
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
      // Success - timer will reset in OTPScreen
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    }
  };

  const handleForgotPassword = async (emailInput: string) => {
    setIsLoading(true);
    setError(null);
    setEmail(emailInput);
    
    try {
      const result = await AuthAPI.requestPasswordReset(emailInput);
      
      if (!result.success) {
        setError(result.error || 'Failed to send reset email');
        return;
      }
      
      setForgotPasswordSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AuthAPI.signInWithGoogle();
      
      if (!result.success) {
        setError(result.error || 'Google sign in failed');
        return;
      }
      
      // Google sign in successful - update state and complete
      if (result.user) {
        setUserId(result.user.id);
        setUserName(result.user.name || '');
        setEmail(result.user.email);
        
        // Navigate to success screen
        setCurrentScreen('success');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Apple Sign In disabled for v1 - backend ready but requires dev build
      setError('Apple sign in coming soon');
    } catch (err: any) {
      setError(err?.message || 'Apple sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthComplete = useCallback(() => {
    onComplete({ id: userId, name: userName, email });
  }, [onComplete, userId, userName, email]);

  // Handle onboarding flow completion
  const handleOnboardingComplete = useCallback((user?: { id: string; name: string; email: string }) => {
    if (user) {
      onComplete(user);
    } else {
      onComplete({ id: userId, name: userName, email });
    }
  }, [onComplete, userId, userName, email]);

  // Animation config based on direction
  const entering = direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300);
  const exiting = direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <Animated.View 
            key="welcome" 
            entering={FadeIn.duration(400)} 
            exiting={FadeOut.duration(200)}
            style={styles.screenContainer}
          >
            <WelcomeScreen
              onGetStarted={() => navigateTo('signup')}
              onSignIn={() => navigateTo('signin')}
              onSkip={onSkip}
            />
          </Animated.View>
        );

      case 'signin':
        return (
          <Animated.View 
            key="signin" 
            entering={entering} 
            exiting={exiting}
            style={styles.screenContainer}
          >
            <SignInScreen
              onBack={goBack}
              onSignIn={handleSignIn}
              onForgotPassword={() => navigateTo('forgot-password')}
              onGoogleSignIn={handleGoogleAuth}
              onSwitchToSignUp={() => navigateTo('signup')}
              isLoading={isLoading}
              error={error}
            />
          </Animated.View>
        );

      case 'signup':
        return (
          <Animated.View 
            key="signup" 
            entering={entering} 
            exiting={exiting}
            style={styles.screenContainer}
          >
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              onBack={goBack}
            />
          </Animated.View>
        );

      case 'otp':
        return (
          <Animated.View 
            key="otp" 
            entering={entering} 
            exiting={exiting}
            style={styles.screenContainer}
          >
            <OTPScreen
              email={email}
              onBack={goBack}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              isLoading={isLoading}
              error={error}
            />
          </Animated.View>
        );

      case 'forgot-password':
        return (
          <Animated.View 
            key="forgot" 
            entering={entering} 
            exiting={exiting}
            style={styles.screenContainer}
          >
            <ForgotPasswordScreen
              onBack={goBack}
              onSubmit={handleForgotPassword}
              isLoading={isLoading}
              error={error}
              success={forgotPasswordSuccess}
            />
          </Animated.View>
        );

      case 'success':
        return (
          <Animated.View 
            key="success" 
            entering={FadeIn.duration(400)} 
            exiting={FadeOut.duration(200)}
            style={styles.screenContainer}
          >
            <AuthSuccessScreen
              userName={userName}
              onContinue={handleAuthComplete}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});
