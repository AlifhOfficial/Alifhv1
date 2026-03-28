/**
 * VinStepContent — Enter and verify VIN
 *
 * Content-only component for the unified flow.
 * VIN is required to prevent abuse. Users can control visibility.
 *
 * @module components/sheets/create-listing/steps/vin-step
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

import { Typography, Fonts, Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { checkVin } from '@/lib/sell-car-user-api';
import { validateVin } from '../types';

import type { StepContentProps } from '../create-listing-flow';
import { StepContainer } from '../step-container';

// ─────────────────────────────────────────────────────────────────────────────

type VinStatus = 'idle' | 'checking' | 'verified' | 'taken' | 'invalid';

function getStatusColor(
  status: VinStatus,
  colors: { success: string; error: string; border: string }
): string {
  switch (status) {
    case 'verified':
      return colors.success;
    case 'taken':
    case 'invalid':
      return colors.error;
    default:
      return colors.border;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export function VinStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [localVin, setLocalVin] = useState(data.vin || '');
  const [status, setStatus] = useState<VinStatus>(data.vinVerified ? 'verified' : 'idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastChecked = useRef<string>('');

  // Keep in sync with data
  useEffect(() => {
    if (data.vin !== localVin && data.vin) {
      setLocalVin(data.vin);
      setStatus(data.vinVerified ? 'verified' : 'idle');
    }
  }, [data.vin, data.vinVerified]);

  const verifyVin = useCallback(
    async (vin: string) => {
      if (vin.length !== 17 || vin === lastChecked.current) return;
      lastChecked.current = vin;

      const error = validateVin(vin);
      if (error) {
        setStatus('invalid');
        setErrorMsg(error);
        onUpdate({ vinVerified: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setStatus('checking');
      setErrorMsg(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const result = await checkVin(vin);

        if (!result.isUnique) {
          setStatus('taken');
          setErrorMsg('A listing with this VIN already exists');
          onUpdate({ vinVerified: false });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }

        setStatus('verified');
        onUpdate({ vin, vinVerified: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-fill decoded data if available
        if (result.nhtsa?.make) onUpdate({ make: result.nhtsa.make });
        if (result.nhtsa?.model) onUpdate({ model: result.nhtsa.model });
        if (result.nhtsa?.year) onUpdate({ year: result.nhtsa.year });
        if (result.nhtsa?.trim) onUpdate({ trim: result.nhtsa.trim });
      } catch {
        setStatus('invalid');
        setErrorMsg('Failed to verify VIN. Please try again.');
        onUpdate({ vinVerified: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [onUpdate]
  );

  const handleVinChange = useCallback(
    (text: string) => {
      const cleaned = text
        .toUpperCase()
        .replace(/[^A-HJ-NPR-Z0-9]/g, '')
        .slice(0, 17);

      setLocalVin(cleaned);
      onUpdate({ vin: cleaned, vinVerified: false });

      if (status !== 'idle' && status !== 'checking') {
        setStatus('idle');
        setErrorMsg(null);
      }

      if (cleaned.length === 17) {
        verifyVin(cleaned);
      }
    },
    [status, onUpdate, verifyVin]
  );

  const borderColor = getStatusColor(status, colors);

  return (
    <StepContainer>
      {/* VIN Input */}
      <View style={styles.inputWrapper}>
        <BottomSheetTextInput
          style={[
            styles.vinInput,
            {
              backgroundColor: colors.fill2,
              color: colors.label,
              borderColor,
            },
          ]}
          placeholder="e.g. WVWZZZ3CZWE123456"
          placeholderTextColor={colors.labelQuaternary}
          value={localVin}
          onChangeText={handleVinChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={17}
          keyboardType="ascii-capable"
          returnKeyType="done"
        />

        {/* Status indicator */}
        <View style={styles.statusIcon}>
          {status === 'checking' ? (
            <ActivityIndicator size="small" color={colors.label} />
          ) : status === 'verified' ? (
            <CheckCircle2 size={Sizes.iconSm} color={colors.success} strokeWidth={2} />
          ) : status === 'taken' || status === 'invalid' ? (
            <AlertCircle size={Sizes.iconSm} color={colors.error} strokeWidth={2} />
          ) : null}
        </View>
      </View>

      {/* Character count */}
      <View style={styles.countRow}>
        <Supporting size="bodySm" tone="muted">
          {localVin.length}/17
        </Supporting>
        {status === 'verified' && (
          <Supporting size="bodySm" style={{ color: colors.success }}>
            Verified
          </Supporting>
        )}
      </View>

      {/* Error message */}
      {errorMsg && (
        <View style={[styles.errorBox, { backgroundColor: colors.errorMuted }]}>
          <AlertCircle size={Sizes.iconSm} color={colors.error} strokeWidth={2} />
          <Body size="bodySm" style={{ color: colors.error, flex: 1 }}>
            {errorMsg}
          </Body>
        </View>
      )}

      {/* VIN Visibility Toggle */}
      <View style={[styles.visibilitySection, { backgroundColor: colors.fill2 }]}>
        <View style={styles.visibilityContent}>
          <Label size="caption">Show VIN publicly</Label>
        </View>
        <Switch
          value={data.vinVisibility === 'public'}
          onValueChange={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onUpdate({ vinVisibility: value ? 'public' : 'private' });
          }}
          trackColor={{ false: colors.fill2, true: colors.success + '80' }}
          thumbColor={data.vinVisibility === 'public' ? colors.success : colors.labelQuaternary}
        />
      </View>

      {/* Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.fill2 }]}>
        <Supporting size="bodySm" tone="muted">
          Find your VIN on the driver's door jamb, dashboard, or vehicle registration. This setting is permanent for this listing.
        </Supporting>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
  },
  vinInput: {
    height: Sizes.actionButtonLg,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing["5xl"],
    ...Typography.body,
    letterSpacing: 1,
  },
  statusIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  visibilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
  },
  visibilityContent: {
    flex: 1,
    gap: 2,
    marginRight: Spacing.md,
  },
  infoBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
});

export default VinStepContent;
