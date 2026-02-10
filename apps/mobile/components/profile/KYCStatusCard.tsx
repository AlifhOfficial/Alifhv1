/**
 * KYC Status Card Component
 * Shows identity verification status with action button
 */

import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Label, Data, Supporting, ButtonText } from '@/components/ui';
import type { ThemeColors, ProfileStatus } from './types';

interface KYCStatusCardProps {
  status: ProfileStatus;
  colors: ThemeColors;
  onAction?: () => void;
}

function getKycDisplayInfo(
  status: ProfileStatus,
  colors: ThemeColors
): {
  title: string;
  subtitle: string;
  titleColor: string;
  buttonText: string | null;
} {
  const isExpired = status.kycExpiryDate
    ? new Date() > status.kycExpiryDate
    : false;
  const daysUntilExpiry = status.kycExpiryDate
    ? Math.ceil(
        (status.kycExpiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const showResubmit = daysUntilExpiry !== null && daysUntilExpiry <= 60;

  if (status.kycVerified && !isExpired) {
    return {
      title: 'Identity Verified',
      subtitle: status.kycExpiryDate
        ? isExpiringSoon
          ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
          : `Valid until ${status.kycExpiryDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`
        : 'Your documents have been verified',
      titleColor: colors.success,
      buttonText: showResubmit ? 'Renew' : null,
    };
  }

  if (isExpired) {
    return {
      title: 'Verification Expired',
      subtitle: 'Please verify again to continue',
      titleColor: colors.error,
      buttonText: 'Verify Again',
    };
  }

  if (status.kycStatus === 'pending') {
    return {
      title: 'Under Review',
      subtitle: "We're reviewing your documents",
      titleColor: colors.warning,
      buttonText: null,
    };
  }

  if (status.kycStatus === 'rejected') {
    return {
      title: 'Verification Failed',
      subtitle: 'Please try again with valid documents',
      titleColor: colors.error,
      buttonText: 'Try Again',
    };
  }

  return {
    title: 'Not Verified',
    subtitle: 'Verify to build trust and unlock features',
    titleColor: colors.textSecondary,
    buttonText: 'Verify Identity',
  };
}

export function KYCStatusCard({ status, colors, onAction }: KYCStatusCardProps) {
  const display = getKycDisplayInfo(status, colors);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAction?.();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(350)}
      style={styles.wrapper}
    >
      <View style={styles.header}>
        <Label size="medium" tone="secondary" style={styles.sectionTitle}>
          Identity Verification
        </Label>
      </View>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.content}>
          <Data size="large" style={{ color: display.titleColor }}>
            {display.title}
          </Data>
          <Supporting size="medium" tone="muted">
            {display.subtitle}
          </Supporting>
        </View>

        {display.buttonText && (
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.surfaceSecondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ButtonText size="medium">
              {display.buttonText}
            </ButtonText>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    // textTransform and letterSpacing handled by <Label> component
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
