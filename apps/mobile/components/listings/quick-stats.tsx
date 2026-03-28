/**
 * Quick Stats - Mileage, Specs, Location, VIN
 */

import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View, Platform, Clipboard } from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { MapPin, Copy, Check } from 'lucide-react-native';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Data, Supporting } from '@/components/ui';
import { formatMileage, formatSpecs, formatEmirate } from './types';

interface QuickStatsProps {
  mileage: number;
  specs: string;
  emirate: string;
  city?: string | null;
  vin?: string | null;
  vinVisibility?: 'public' | 'private';
  isBlk?: boolean;
}

export const QuickStats = memo(function QuickStats({
  mileage,
  specs,
  emirate,
  city,
  vin,
  vinVisibility = 'public',
  isBlk = false,
}: QuickStatsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [copied, setCopied] = useState(false);

  const displaySpecs = formatSpecs(specs);
  const displayEmirate = city ? `${city}, ${formatEmirate(emirate)}` : formatEmirate(emirate);
  
  const secondaryTextColor = isBlk ? colors.blkText2 : colors.labelSecondary;

  const handleCopyVin = useCallback(async () => {
    if (!vin) return;
    try {
      Clipboard.setString(vin);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy VIN:', error);
    }
  }, [vin]);

  return (
    <View style={styles.container}>
      {/* Quick Details Row */}
      <View style={styles.statsRow}>
        <Data size="body" style={{ color: secondaryTextColor }}>
          {formatMileage(mileage)} km
        </Data>
        <Supporting size="bodySm" tone="muted" style={styles.separator}>
          •
        </Supporting>
        <Data size="body" style={{ color: secondaryTextColor }}>
          {displaySpecs} Specs
        </Data>
        <Supporting size="bodySm" tone="muted" style={styles.separator}>
          •
        </Supporting>
        <View style={styles.locationRow}>
          <MapPin size={Sizes.iconXs} color={secondaryTextColor} />
          <Data size="body" style={{ color: secondaryTextColor }}>
            {displayEmirate}
          </Data>
        </View>
      </View>

      {/* VIN - Copyable (if public) or simple Verified text (if private) */}
      {vin ? (
        <HapticPressable onPress={handleCopyVin} style={styles.vinRow}>
          {({ pressed }) => (
            <>
              <Data size="bodySm" tone="muted">VIN</Data>
              <Data size="body" style={[styles.vinValue, { opacity: pressed ? 0.7 : 1 }]}>
                {vin}
              </Data>
              {copied ? (
                <Check size={Sizes.iconXs} color={colors.success} strokeWidth={2.5} />
              ) : (
                <Copy size={Sizes.iconXs} color={colors.labelTertiary} strokeWidth={1.75} />
              )}
            </>
          )}
        </HapticPressable>
      ) : vinVisibility === 'private' ? (
        <View style={styles.vinRow}>
          <Data size="bodySm" tone="muted">VIN</Data>
          <Data size="body" style={{ color: colors.success }}>Verified</Data>
        </View>
      ) : null}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  separator: {
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinValue: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
});
