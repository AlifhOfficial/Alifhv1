/**
 * Phone Verification Field Component
 * Handles phone number editing and OTP verification flow
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { PulseLoader } from '@/components/ui';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Body, Data, ButtonText } from '@/components/ui';
import { Typography, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import { sendPhoneOTP, verifyPhoneOTP } from '@/lib/profile-api';
import type { ThemeColors } from './types';

type VerifyStep = 'idle' | 'edit' | 'sending' | 'otp' | 'verifying';

interface PhoneVerificationFieldProps {
  phone: string;
  isVerified: boolean;
  colors: ThemeColors;
  onPhoneChange: (phone: string) => void;
  onPhoneSave: () => Promise<void>;
  onPhoneRemove: () => Promise<void>;
  onVerified: () => void;
}

export function PhoneVerificationField({
  phone,
  isVerified,
  colors,
  onPhoneChange,
  onPhoneSave,
  onPhoneRemove,
  onVerified,
}: PhoneVerificationFieldProps) {
  const [step, setStep] = useState<VerifyStep>('idle');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (step === 'edit') {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleEditPress = () => {
    if (isVerified || justVerified) {
      Alert.alert(
        'Cannot change verified phone',
        'Please email support@revvup.ae to change your verified phone number. This protects you from fraudulent activities.'
      );
    } else {
      setStep('edit');
      setError(null);
    }
  };

  const handleSavePhone = async () => {
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    
    await onPhoneSave();
    setStep('idle');
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemovePhone = async () => {
    await onPhoneRemove();
    setStep('idle');
  };

  const handleSendOTP = async () => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 9) {
      Alert.alert('Invalid Phone', 'Please enter a valid 9-digit phone number');
      return;
    }

    setStep('sending');
    setError(null);

    const fullPhone = `+971${cleanPhone}`;
    const result = await sendPhoneOTP(fullPhone);

    if (result.success) {
      setStep('otp');
      setCountdown(60);
      setOtp('');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setError(result.error || 'Failed to send code');
      setStep('idle');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setStep('verifying');
    setError(null);

    const cleanPhone = phone.replace(/[^\d]/g, '');
    const fullPhone = `+971${cleanPhone}`;
    const result = await verifyPhoneOTP(fullPhone, otp);

    if (result.success) {
      setJustVerified(true);
      setStep('idle');
      setOtp('');
      onVerified();
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Your phone number has been verified!');
    } else {
      setError(result.error || 'Invalid code');
      setStep('otp');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleCancel = () => {
    setStep('idle');
    setError(null);
    setOtp('');
  };

  const displayVerified = isVerified || justVerified;

  // Idle state - Display phone number
  if (step === 'idle') {
    return (
      <HapticPressable
        onPress={handleEditPress}
        style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
      >
        <View style={styles.labelRow}>
          <Body size="small" tone="muted">
            Phone Number
          </Body>
          {displayVerified ? (
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} strokeWidth={2} />
          ) : phone ? (
            <HapticPressable onPress={handleSendOTP} hitSlop={Layout.hitSlopSmall}>
              <ButtonText size="small" tone="primary">
                Verify
              </ButtonText>
            </HapticPressable>
          ) : null}
        </View>
        <Body size="medium" tone={phone ? 'default' : 'muted'}>
          {phone ? `+971 ${phone}` : 'Tap to add'}
        </Body>
      </HapticPressable>
    );
  }

  // Edit state - Edit phone number
  if (step === 'edit') {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
      >
        <Body size="small" tone="muted">
          Phone Number
        </Body>
        <View style={styles.editRow}>
          <Body size="medium" tone="secondary" style={styles.prefix}>+971</Body>
          <TextInput
            ref={inputRef}
            value={phone}
            onChangeText={(text) => onPhoneChange(text.replace(/[^\d]/g, '').slice(0, 9))}
            placeholder="50 000 0000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            maxLength={9}
            style={[
              styles.input,
              Typography.bodyLarge,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
        {error && (
          <Body size="small" tone="error">{error}</Body>
        )}
        <View style={styles.actions}>
          <HapticPressable onPress={handleCancel} hitSlop={Layout.hitSlopSmall}>
            <Body size="small" tone="secondary">
              Cancel
            </Body>
          </HapticPressable>
          <HapticPressable onPress={handleRemovePhone} hitSlop={Layout.hitSlopSmall}>
            <Body size="small" tone="error">
              Remove
            </Body>
          </HapticPressable>
          <HapticPressable onPress={handleSavePhone} hitSlop={Layout.hitSlopSmall}>
            <Data size="medium" tone="primary">
              Save
            </Data>
          </HapticPressable>
        </View>
      </Animated.View>
    );
  }

  // Sending state
  if (step === 'sending' || step === 'verifying') {
    return (
      <View style={[styles.fieldContainer, styles.loadingContainer, { borderBottomWidth: 0 }]}>
        <PulseLoader size="sm" variant="primary" />
        <Data size="medium" tone="secondary">
          {step === 'sending' ? 'Sending code...' : 'Verifying...'}
        </Data>
      </View>
    );
  }

  // OTP state - Enter verification code
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
    >
      <Body size="small" tone="muted">
        Phone Number
      </Body>
      <Body size="small" tone="muted" style={styles.otpHint}>
        Enter the 6-digit code sent to +971 {phone}
      </Body>
      
      <TextInput
        ref={otpInputRef}
        value={otp}
        onChangeText={(text) => setOtp(text.replace(/[^\d]/g, '').slice(0, 6))}
        placeholder="000000"
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
        maxLength={6}
        style={[
          styles.otpInput,
          Typography.headingMedium,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error ? colors.error : colors.border,
            letterSpacing: 8,
          },
        ]}
      />
      
      {error && (
        <Body size="small" tone="error" style={styles.errorText}>{error}</Body>
      )}

      <View style={styles.otpActions}>
        <HapticPressable
          onPress={countdown > 0 ? undefined : handleSendOTP}
          disabled={countdown > 0}
          hitSlop={Layout.hitSlopSmall}
        >
          <Body size="small" tone={countdown > 0 ? 'muted' : 'secondary'}>
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </Body>
        </HapticPressable>
        
        <View style={styles.otpButtonRow}>
          <HapticPressable onPress={handleCancel} hitSlop={Layout.hitSlopSmall}>
            <Body size="small" tone="secondary">
              Cancel
            </Body>
          </HapticPressable>
          <HapticPressable
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6}
            hitSlop={Layout.hitSlopSmall}
          >
            <ButtonText size="medium" tone={otp.length === 6 ? 'primary' : 'muted'}>
              Verify
            </ButtonText>
          </HapticPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  prefix: {
    // Typography handled by <Body> component
  },
  input: {
    flex: 1,
    height: Layout.hitTarget,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  otpHint: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  otpInput: {
    height: Layout.hitTarget + Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    marginTop: Spacing.sm,
  },
  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  otpButtonRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
});
