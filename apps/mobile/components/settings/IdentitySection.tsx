/**
 * Identity Verification Section Component
 * KYC status display using shared Section/SettingRow pattern
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

import { Body } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface KYCStatus {
  kycVerified: boolean;
  kycStatus: 'none' | 'pending' | 'rejected' | 'verified';
  kycExpiryDate: Date | null;
}

interface IdentitySectionProps {
  status: KYCStatus;
  colors: ThemeColors;
  onAction?: () => void;
  delay?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function getKycDisplayInfo(
  status: KYCStatus,
  colors: ThemeColors
): {
  statusLabel: string;
  statusColor: string;
  description: string;
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
      statusLabel: 'Verified',
      statusColor: colors.success,
      description: status.kycExpiryDate
        ? isExpiringSoon
          ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`
          : `Valid until ${status.kycExpiryDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}`
        : 'Your documents have been verified',
      buttonText: showResubmit ? 'Renew' : null,
    };
  }

  if (isExpired) {
    return {
      statusLabel: 'Expired',
      statusColor: colors.error,
      description: 'Please verify again to continue',
      buttonText: 'Verify Again',
    };
  }

  if (status.kycStatus === 'pending') {
    return {
      statusLabel: 'Under Review',
      statusColor: colors.warning,
      description: "We're reviewing your documents",
      buttonText: null,
    };
  }

  if (status.kycStatus === 'rejected') {
    return {
      statusLabel: 'Failed',
      statusColor: colors.error,
      description: 'Please try again with valid documents',
      buttonText: 'Try Again',
    };
  }

  return {
    statusLabel: 'Not Verified',
    statusColor: colors.labelSecondary,
    description: 'Verify to build trust and unlock features',
    buttonText: 'Verify Identity',
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function IdentitySection({
  status,
  colors,
  onAction,
  delay = 150,
}: IdentitySectionProps) {
  const display = getKycDisplayInfo(status, colors);

  return (
    <Section title="Identity Verification" colors={colors} delay={delay}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Body size="bodySm" tone="muted">Status</Body>
          <Body size="body" style={{ color: display.statusColor }}>
            {display.statusLabel}
          </Body>
          <Body size="bodySm" tone="muted" style={styles.description}>
            {display.description}
          </Body>
        </View>
        {display.buttonText && (
          <HapticPressable
            onPress={onAction}
            hitSlop={Spacing.md}
          >
            <Ionicons name="chevron-forward" size={Sizes.iconSm} color={colors.labelQuaternary} />
          </HapticPressable>
        )}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    marginRight: Spacing.md,
    gap: Spacing.xs,
  },
  description: {
    marginTop: Sizes.badgePaddingV,
  },
});
