/**
 * Auth Sheet - Compact Sign In & Sign Up Flow
 * Simple 2-step authentication
 */

import { forwardRef, useImperativeHandle, useState, useCallback, useRef, useEffect } from 'react';
import { Keyboard, Platform, Animated, TextInput, useWindowDimensions } from 'react-native';
import { Sheet, YStack, XStack, Text, Input, Button, Separator, ScrollView } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Fingerprint } from 'lucide-react-native';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import Svg, { Path } from 'react-native-svg';

// Icons
const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </Svg>
);

// Types
type AuthMode = 'signin' | 'signup';
type AuthStep = 'start' | 'password';

export interface AuthSheetRef {
  presentSignIn: () => void;
  presentSignUp: () => void;
  dismiss: () => void;
}

interface AuthSheetProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onPasskeySignIn?: () => Promise<{ success: boolean }>;
  onMagicLink?: (email: string) => Promise<void>;
  onForgotPassword?: (email: string) => void;
  onGoogleAuth?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  clearError?: () => void;
  onDismiss?: () => void;
}

export const AuthSheet = forwardRef<AuthSheetRef, AuthSheetProps>(
  ({ 
    onSignIn, onSignUp, onPasskeySignIn, onMagicLink, onForgotPassword,
    onGoogleAuth, isLoading = false, error, clearError, onDismiss,
  }, ref) => {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<AuthMode>('signin');
    const [step, setStep] = useState<AuthStep>('start');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
    
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const nameRef = useRef<TextInput>(null);
    const slideAnim = useRef(new Animated.Value(0)).current;
    
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    
    const iconColor = isDark ? '#FAFAFA' : '#0D0D0D';
    const mutedColor = isDark ? 'rgba(250,250,250,0.4)' : 'rgba(13,13,13,0.4)';

    // Keyboard
    useEffect(() => {
      const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
      const s1 = Keyboard.addListener(show, (e) => setKeyboardHeight(e.endCoordinates.height));
      const s2 = Keyboard.addListener(hide, () => setKeyboardHeight(0));
      return () => { s1.remove(); s2.remove(); };
    }, []);

    const snapPoints = keyboardHeight > 0 
      ? [Math.min(85, ((screenHeight - keyboardHeight + 60) / screenHeight) * 100)]
      : [55];

    useImperativeHandle(ref, () => ({
      presentSignIn: () => { reset(); setMode('signin'); setOpen(true); },
      presentSignUp: () => { reset(); setMode('signup'); setOpen(true); },
      dismiss: () => { setOpen(false); reset(); },
    }));

    const reset = useCallback(() => {
      setEmail(''); setPassword(''); setName('');
      setShowPassword(false); setStep('start'); clearError?.();
    }, [clearError]);

    const animate = useCallback((dir: 'forward' | 'back') => {
      slideAnim.setValue(dir === 'forward' ? 20 : -20);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 150, friction: 12 }).start();
    }, [slideAnim]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) { Keyboard.dismiss(); reset(); onDismiss?.(); }
    }, [onDismiss, reset]);

    const handleContinue = useCallback(() => {
      if (!email.trim() || (mode === 'signup' && !name.trim())) return;
      clearError?.(); Keyboard.dismiss();
      setStep('password'); animate('forward');
      setTimeout(() => passwordRef.current?.focus(), 150);
    }, [email, name, mode, clearError, animate]);

    const handleBack = useCallback(() => {
      clearError?.(); Keyboard.dismiss();
      setStep('start'); animate('back');
    }, [clearError, animate]);

    const handleSubmit = useCallback(async () => {
      if (isLoading) return;
      Keyboard.dismiss();
      if (mode === 'signin') {
        if (email.trim() && password) await onSignIn(email.trim(), password);
      } else {
        if (name.trim() && email.trim() && password.length >= 8) {
          await onSignUp(name.trim(), email.trim(), password);
        }
      }
    }, [mode, email, password, name, isLoading, onSignIn, onSignUp]);

    const handlePasskey = useCallback(async () => {
      if (isPasskeyLoading || isLoading || !onPasskeySignIn) return;
      setIsPasskeyLoading(true);
      try { await onPasskeySignIn(); } catch {} 
      finally { setIsPasskeyLoading(false); }
    }, [onPasskeySignIn, isPasskeyLoading, isLoading]);

    const switchMode = useCallback(() => {
      clearError?.();
      setMode(mode === 'signin' ? 'signup' : 'signin');
      setStep('start'); setPassword(''); animate('forward');
    }, [mode, clearError, animate]);

    const isEmailValid = email.trim().length > 0 && email.includes('@');
    const canContinue = mode === 'signin' ? isEmailValid : (isEmailValid && name.trim().length > 0);
    const canSubmit = mode === 'signin' ? password.length > 0 : password.length >= 8;

    // ========== START STEP ==========
    const renderStart = () => (
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        <YStack gap={14}>
          <Text fontSize={22} fontFamily="Inter_600SemiBold" color="$textPrimary">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </Text>

          {error && (
            <YStack backgroundColor="$errorBackground" borderRadius={8} paddingVertical={8} paddingHorizontal={10}>
              <Text fontSize={13} fontFamily="Inter_400Regular" color="$error">{error}</Text>
            </YStack>
          )}

          {mode === 'signup' && (
            <Input
              ref={nameRef as any}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              height={46}
              borderRadius={10}
              backgroundColor="$surfaceSecondary"
              borderColor="$borderColor"
              focusStyle={{ borderColor: '$primary' }}
              fontFamily="Inter_400Regular"
              fontSize={15}
              editable={!isLoading}
            />
          )}

          <XStack alignItems="center">
            <Input
              ref={emailRef as any}
              flex={1}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={canContinue ? handleContinue : undefined}
              height={46}
              borderRadius={10}
              backgroundColor="$surfaceSecondary"
              borderColor="$borderColor"
              focusStyle={{ borderColor: '$primary' }}
              fontFamily="Inter_400Regular"
              fontSize={15}
              paddingRight={onPasskeySignIn && mode === 'signin' ? 42 : 12}
              editable={!isLoading}
            />
            {onPasskeySignIn && mode === 'signin' && (
              <Button unstyled position="absolute" right={10} onPress={handlePasskey} pressStyle={{ opacity: 0.7 }}>
                <Fingerprint size={18} color={mutedColor} strokeWidth={2} />
              </Button>
            )}
          </XStack>

          <Button
            height={46}
            backgroundColor={canContinue ? '$primary' : '$surfaceSecondary'}
            borderRadius={10}
            pressStyle={{ opacity: 0.9 }}
            onPress={handleContinue}
            disabled={!canContinue || isLoading}
          >
            <Text fontSize={15} fontFamily="Inter_600SemiBold" color={canContinue ? 'white' : '$textTertiary'}>
              Continue
            </Text>
          </Button>

          {(onGoogleAuth || onMagicLink) && (
            <>
              <XStack alignItems="center" gap={10}>
                <Separator flex={1} backgroundColor="$borderColor" />
                <Text fontSize={11} fontFamily="Inter_400Regular" color="$textTertiary">or</Text>
                <Separator flex={1} backgroundColor="$borderColor" />
              </XStack>

              <XStack gap={8}>
                {onGoogleAuth && (
                  <Button
                    unstyled flex={1} height={42} borderRadius={10}
                    backgroundColor="$surfaceSecondary" borderWidth={1} borderColor="$borderColor"
                    alignItems="center" justifyContent="center" flexDirection="row" gap={6}
                    pressStyle={{ opacity: 0.7 }} onPress={onGoogleAuth} disabled={isLoading}
                  >
                    <GoogleIcon />
                    <Text fontSize={13} fontFamily="Inter_500Medium" color="$textPrimary">Google</Text>
                  </Button>
                )}
                {onMagicLink && mode === 'signin' && (
                  <Button
                    unstyled flex={1} height={42} borderRadius={10}
                    backgroundColor="$surfaceSecondary" borderWidth={1} borderColor="$borderColor"
                    alignItems="center" justifyContent="center"
                    pressStyle={{ opacity: 0.7 }} 
                    onPress={() => isEmailValid && onMagicLink(email.trim())} 
                    disabled={isLoading}
                    opacity={isEmailValid ? 1 : 0.5}
                  >
                    <Text fontSize={13} fontFamily="Inter_500Medium" color="$textPrimary">Magic Link</Text>
                  </Button>
                )}
              </XStack>
            </>
          )}

          <XStack justifyContent="center">
            <Text fontSize={12} fontFamily="Inter_400Regular" color="$textSecondary">
              {mode === 'signin' ? "No account? " : "Have an account? "}
            </Text>
            <Button unstyled onPress={switchMode} pressStyle={{ opacity: 0.7 }}>
              <Text fontSize={12} fontFamily="Inter_600SemiBold" color="$primary">
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Animated.View>
    );

    // ========== PASSWORD STEP ==========
    const renderPassword = () => (
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        <YStack gap={14}>
          <XStack alignItems="center" gap={10}>
            <Button
              unstyled width={34} height={34} borderRadius={17}
              backgroundColor="$surfaceSecondary" alignItems="center" justifyContent="center"
              pressStyle={{ opacity: 0.7 }} onPress={handleBack}
            >
              <ArrowLeft size={16} color={iconColor} strokeWidth={2} />
            </Button>
            <YStack flex={1}>
              <Text fontSize={16} fontFamily="Inter_600SemiBold" color="$textPrimary">
                {mode === 'signin' ? 'Enter password' : 'Set password'}
              </Text>
              <Text fontSize={12} fontFamily="Inter_400Regular" color="$textSecondary" numberOfLines={1}>
                {email}
              </Text>
            </YStack>
          </XStack>

          {error && (
            <YStack backgroundColor="$errorBackground" borderRadius={8} paddingVertical={8} paddingHorizontal={10}>
              <Text fontSize={13} fontFamily="Inter_400Regular" color="$error">{error}</Text>
            </YStack>
          )}

          <YStack gap={4}>
            <XStack alignItems="center">
              <Input
                ref={passwordRef as any}
                flex={1}
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'signup' ? 'Min 8 characters' : 'Password'}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={canSubmit ? handleSubmit : undefined}
                height={46}
                borderRadius={10}
                backgroundColor="$surfaceSecondary"
                borderColor="$borderColor"
                focusStyle={{ borderColor: '$primary' }}
                fontFamily="Inter_400Regular"
                fontSize={15}
                paddingRight={42}
                editable={!isLoading}
              />
              <Button unstyled position="absolute" right={12} onPress={() => setShowPassword(!showPassword)} pressStyle={{ opacity: 0.7 }}>
                <Text fontSize={12} fontFamily="Inter_500Medium" color="$textTertiary">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Button>
            </XStack>
            
            {mode === 'signup' && password.length > 0 && password.length < 8 && (
              <Text fontSize={11} fontFamily="Inter_400Regular" color="$textTertiary">
                {8 - password.length} more needed
              </Text>
            )}
          </YStack>

          <Button
            height={46}
            backgroundColor={canSubmit ? '$primary' : '$surfaceSecondary'}
            borderRadius={10}
            pressStyle={{ opacity: 0.9 }}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            <Text fontSize={15} fontFamily="Inter_600SemiBold" color={canSubmit ? 'white' : '$textTertiary'}>
              {isLoading ? (mode === 'signin' ? 'Signing in...' : 'Creating...') : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </Text>
          </Button>

          {mode === 'signin' && onForgotPassword && (
            <Button unstyled alignSelf="center" onPress={() => onForgotPassword(email)} pressStyle={{ opacity: 0.7 }}>
              <Text fontSize={12} fontFamily="Inter_500Medium" color="$textSecondary">Forgot password?</Text>
            </Button>
          )}

          {mode === 'signup' && (
            <Text fontSize={10} fontFamily="Inter_400Regular" color="$textTertiary" textAlign="center">
              By signing up, you agree to our Terms & Privacy Policy
            </Text>
          )}
        </YStack>
      </Animated.View>
    );

    return (
      <Sheet
        modal
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={snapPoints}
        dismissOnSnapToBottom
        dismissOnOverlayPress
        animation="medium"
        zIndex={100_000}
      >
        <Sheet.Overlay animation="quick" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} backgroundColor="rgba(0,0,0,0.5)" />
        <Sheet.Handle backgroundColor="$borderColor" opacity={0.5} marginTop={6} />
        <Sheet.Frame backgroundColor="$surface" borderTopLeftRadius={20} borderTopRightRadius={20}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            <YStack paddingHorizontal={20} paddingTop={20} paddingBottom={insets.bottom + 8}>
              {step === 'start' ? renderStart() : renderPassword()}
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    );
  }
);

AuthSheet.displayName = 'AuthSheet';

export type SignInSheetRef = AuthSheetRef;
export type SignUpSheetRef = AuthSheetRef;
export const SignInSheet = AuthSheet;
export const SignUpSheet = AuthSheet;
