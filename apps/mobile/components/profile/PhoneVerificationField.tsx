/**
 * Phone Verification Field Component
 * Handles phone number editing and OTP verification flow
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { PulseLoader } from '@/components/ui';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import { sendPhoneOTP, verifyPhoneOTP } from '@/lib/profile-api';
import type { ThemeColors } from './types';

type VerifyStep = 'idle' | 'edit' | 'sending' | 'otp' | 'verifying';

interface PhoneVerificationFieldProps {
  phone: string;
  isVerified: boolean;
  colors: ThemeColors;
  onPhoneChange: (phone: string) => void;
  onPhoneSave: () => Promise<void>;
  onVerified: () => void;
}

export function PhoneVerificationField({
  phone,
  isVerified,
  colors,
  onPhoneChange,
  onPhoneSave,
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
    // Clear the phone and save
    onPhoneChange('');
    await onPhoneSave();
    setStep('idle');
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
      <Pressable
        onPress={handleEditPress}
        style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
      >
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Phone Number
          </Text>
          {displayVerified ? (
            <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
          ) : phone ? (
            <Pressable onPress={handleSendOTP} hitSlop={8}>
              <Text style={[styles.verifyLink, { color: colors.primary }]}>
                Verify
              </Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.value, { color: phone ? colors.text : colors.textTertiary }]}>
          {phone ? `+971 ${phone}` : 'Tap to add'}
        </Text>
      </Pressable>
    );
  }

  // Edit state - Edit phone number
  if (step === 'edit') {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Phone Number
        </Text>
        <View style={styles.editRow}>
          <Text style={[styles.prefix, { color: colors.textSecondary }]}>+971</Text>
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
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        )}
        <View style={styles.actions}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Pressable onPress={handleRemovePhone} hitSlop={8}>
            <Text style={[styles.removeText, { color: colors.error }]}>
              Remove
            </Text>
          </Pressable>
          <Pressable onPress={handleSavePhone} hitSlop={8}>
            <Text style={[styles.saveText, { color: colors.primary }]}>
              Save
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // Sending state
  if (step === 'sending' || step === 'verifying') {
    return (
      <View style={[styles.fieldContainer, styles.loadingContainer, { borderBottomWidth: 0 }]}>
        <PulseLoader size="sm" variant="primary" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {step === 'sending' ? 'Sending code...' : 'Verifying...'}
        </Text>
      </View>
    );
  }

  // OTP state - Enter verification code
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={[styles.fieldContainer, { borderBottomWidth: 0 }]}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Phone Number
      </Text>
      <Text style={[styles.otpHint, { color: colors.textTertiary }]}>
        Enter the 6-digit code sent to +971 {phone}
      </Text>
      
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
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      />
      
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <View style={styles.otpActions}>
        <Pressable
          onPress={countdown > 0 ? undefined : handleSendOTP}
          disabled={countdown > 0}
          hitSlop={8}
        >
          <Text
            style={[
              styles.resendText,
              { color: countdown > 0 ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </Text>
        </Pressable>
        
        <View style={styles.otpButtonRow}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6}
            hitSlop={8}
          >
            <Text
              style={[
                styles.verifyButton,
                { color: otp.length === 6 ? colors.primary : colors.textTertiary },
              ]}
            >
              Verify
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  value: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontFamily: 'Inter_400Regular',
  },
  verifyLink: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  prefix: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: Typography.bodySmall.fontSize,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 12,
  },
  cancelText: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  removeText: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  saveText: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_400Regular',
  },
  otpHint: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    marginBottom: 12,
  },
  otpInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: Typography.title.fontSize,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  resendText: {
    fontSize: Typography.helper.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
  },
  otpButtonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  verifyButton: {
    fontSize: Typography.value.fontSize,
    lineHeight: Typography.value.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
  },
});
