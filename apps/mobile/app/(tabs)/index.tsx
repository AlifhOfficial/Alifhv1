/**
 * Home Tab Screen
 */

import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { YStack, Text } from 'tamagui';

import { HomeHeader } from '@/components/home/header';
import { AuthSheet, AuthSheetRef } from '@/components/sheets';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const authRef = useRef<AuthSheetRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = useCallback(() => {
    authRef.current?.presentSignIn();
  }, []);

  const handleCreateAccount = useCallback(() => {
    authRef.current?.presentSignUp();
  }, []);

  const handleSignInSubmit = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      console.log('Sign in:', email);
      // TODO: Call auth API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      authRef.current?.dismiss();
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignUpSubmit = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      console.log('Sign up:', name, email);
      // TODO: Call auth API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      authRef.current?.dismiss();
    } catch (error: any) {
      setAuthError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    console.log('Google auth');
    // TODO: Implement Google auth
  }, []);

  const handleMagicLink = useCallback(async (email: string) => {
    console.log('Magic link for:', email);
    // TODO: Implement magic link
  }, []);

  const handlePasskeySignIn = useCallback(async () => {
    console.log('Passkey sign in');
    // TODO: Implement passkey auth
    return { success: true };
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader 
        onSignIn={handleSignIn}
        onCreateAccount={handleCreateAccount}
      />
      <YStack flex={1} alignItems="center" justifyContent="center" padding={20}>
        <Text
          fontSize={16}
          fontFamily="Inter_400Regular"
          color="$textSecondary"
        >
          Browse the latest listings
        </Text>
      </YStack>

      {/* Auth Sheet */}
      <AuthSheet
        ref={authRef}
        onSignIn={handleSignInSubmit}
        onSignUp={handleSignUpSubmit}
        onGoogleAuth={handleGoogleAuth}
        onMagicLink={handleMagicLink}
        onPasskeySignIn={handlePasskeySignIn}
        onForgotPassword={(email) => console.log('Forgot password for:', email)}
        isLoading={isLoading}
        error={authError}
        clearError={clearError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
